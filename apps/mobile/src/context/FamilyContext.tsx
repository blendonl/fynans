import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { familyControllerCreate, familyControllerFindAll, familyControllerFindOne, familyControllerInviteMember, familyControllerGetPendingInvitations, familyControllerAcceptInvitation, familyControllerDeclineInvitation, familyControllerLeaveFamily, familyControllerRemoveMember } from '../api/generated/endpoints/family/family';
import { userControllerSearch } from '../api/generated/endpoints/users/users';
import type { FamilyResponseDto, FamilyWithMembersResponseDto, FamilyInvitationResponseDto, UserSearchResponseDto, FamilyMemberUserDto } from '../api/generated/model';
import { useAuth } from "./AuthContext";
import { websocketService } from "../services/websocketService";

interface FamilyContextType {
  families: FamilyResponseDto[];
  selectedFamily: FamilyResponseDto | null;
  pendingInvitations: FamilyInvitationResponseDto[];
  loading: boolean;
  fetchFamilies: () => Promise<void>;
  fetchPendingInvitations: () => Promise<void>;
  fetchFamilyWithMembers: (familyId: string) => Promise<FamilyWithMembersResponseDto>;
  createFamily: (name: string) => Promise<FamilyResponseDto>;
  inviteMember: (familyId: string, email: string) => Promise<void>;
  removeMember: (familyId: string, userId: string) => Promise<void>;
  leaveFamily: (familyId: string) => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  declineInvitation: (invitationId: string) => Promise<void>;
  selectFamily: (family: FamilyResponseDto | null) => void;
  getCurrentUserRole: (familyId: string) => "OWNER" | "ADMIN" | "MEMBER" | null;
  searchUsers: (query: string, excludeFamilyId: string) => Promise<UserSearchResponseDto[]>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, token, isLoading: authLoading } = useAuth();
  const [families, setFamilies] = useState<FamilyResponseDto[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<FamilyResponseDto | null>(null);
  const [subscribedFamilyId, setSubscribedFamilyId] = useState<string | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<
    FamilyInvitationResponseDto[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && token) {
      fetchFamilies();
      fetchPendingInvitations();
      setupWebSocketListeners();
    }

    return () => {
      if (token) {
        websocketService.off('notification:new', handleFamilyNotification);
      }
      if (subscribedFamilyId) {
        websocketService.unsubscribeFromFamily(subscribedFamilyId);
      }
    };
  }, [user, token, authLoading]);

  const setupWebSocketListeners = () => {
    websocketService.on('notification:new', handleFamilyNotification);
  };

  const handleFamilyNotification = (notification: any) => {
    const familyNotificationTypes = [
      'FAMILY_INVITATION_RECEIVED',
      'FAMILY_INVITATION_ACCEPTED',
      'FAMILY_INVITATION_DECLINED',
      'FAMILY_MEMBER_JOINED',
      'FAMILY_MEMBER_LEFT',
    ];

    if (familyNotificationTypes.includes(notification.type)) {
      fetchPendingInvitations();
      fetchFamilies();
    }
  };

  // Load stored family after families are fetched
  useEffect(() => {
    if (families.length > 0) {
      loadStoredFamily();
    }
  }, [families]);

  const loadStoredFamily = async () => {
    const storedFamilyId = await AsyncStorage.getItem("selectedFamilyId");
    if (storedFamilyId) {
      const family = families.find((f) => f.id === storedFamilyId);
      if (family) {
        setSelectedFamily(family);
        websocketService.subscribeToFamily(family.id);
        setSubscribedFamilyId(family.id);
      }
    }
  };

  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const { data } = await familyControllerFindAll();
      setFamilies(data);
    } catch (error) {
      console.error("Failed to fetch families", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvitations = async () => {
    try {
      const { data } = await familyControllerGetPendingInvitations();
      setPendingInvitations(data);
    } catch (error) {
      console.error("Failed to fetch pending invitations", error);
    }
  };

  const createFamily = async (name: string): Promise<FamilyResponseDto> => {
    const { data: family } = await familyControllerCreate({ name });
    setFamilies([...families, family]);
    return family;
  };

  const inviteMember = async (familyId: string, email: string) => {
    await familyControllerInviteMember(familyId, {
      inviteeEmail: email,
    });
  };

  const leaveFamily = async (familyId: string) => {
    await familyControllerLeaveFamily(familyId);
    setFamilies(families.filter((f) => f.id !== familyId));
    if (selectedFamily?.id === familyId) {
      setSelectedFamily(null);
      await AsyncStorage.removeItem("selectedFamilyId");
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    await familyControllerAcceptInvitation(invitationId);
    await fetchFamilies();
    await fetchPendingInvitations();
  };

  const declineInvitation = async (invitationId: string) => {
    await familyControllerDeclineInvitation(invitationId);
    await fetchPendingInvitations();
  };

  const selectFamily = async (family: FamilyResponseDto | null) => {
    if (subscribedFamilyId) {
      websocketService.unsubscribeFromFamily(subscribedFamilyId);
    }

    if (family) {
      websocketService.subscribeToFamily(family.id);
      setSubscribedFamilyId(family.id);
      await AsyncStorage.setItem("selectedFamilyId", family.id);
    } else {
      setSubscribedFamilyId(null);
      await AsyncStorage.removeItem("selectedFamilyId");
    }

    setSelectedFamily(family);
  };

  const fetchFamilyWithMembers = async (
    familyId: string
  ): Promise<FamilyWithMembersResponseDto> => {
    const { data } = await familyControllerFindOne(familyId);
    return data;
  };

  const removeMember = async (familyId: string, userId: string) => {
    await familyControllerRemoveMember(familyId, userId);
    await fetchFamilies();
  };

  const getCurrentUserRole = (
    familyId: string
  ): "OWNER" | "ADMIN" | "MEMBER" | null => {
    return null;
  };

  const searchUsers = async (
    query: string,
    excludeFamilyId: string
  ): Promise<UserSearchResponseDto[]> => {
    if (!query || query.length < 2) {
      return [];
    }
    const { data } = await userControllerSearch({ q: query, excludeFamilyId });
    return data;
  };

  return (
    <FamilyContext.Provider
      value={{
        families,
        selectedFamily,
        pendingInvitations,
        loading,
        fetchFamilies,
        fetchPendingInvitations,
        fetchFamilyWithMembers,
        createFamily,
        inviteMember,
        removeMember,
        leaveFamily,
        acceptInvitation,
        declineInvitation,
        selectFamily,
        getCurrentUserRole,
        searchUsers,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error("useFamily must be used within a FamilyProvider");
  }
  return context;
};
