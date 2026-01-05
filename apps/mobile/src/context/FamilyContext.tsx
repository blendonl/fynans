import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../api/client";
import { useAuth } from "./AuthContext";

interface Family {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

interface FamilyMember {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  balance: number;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface FamilyWithMembers extends Family {
  members: FamilyMember[];
}

interface FamilyInvitation {
  id: string;
  familyId: string;
  inviterId: string;
  inviteeEmail: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

interface FamilyContextType {
  families: Family[];
  selectedFamily: Family | null;
  pendingInvitations: FamilyInvitation[];
  loading: boolean;
  fetchFamilies: () => Promise<void>;
  fetchPendingInvitations: () => Promise<void>;
  fetchFamilyWithMembers: (familyId: string) => Promise<FamilyWithMembers>;
  createFamily: (name: string) => Promise<Family>;
  inviteMember: (familyId: string, email: string) => Promise<void>;
  removeMember: (familyId: string, userId: string) => Promise<void>;
  leaveFamily: (familyId: string) => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  declineInvitation: (invitationId: string) => Promise<void>;
  selectFamily: (family: Family | null) => void;
  getCurrentUserRole: (familyId: string) => "OWNER" | "ADMIN" | "MEMBER" | null;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { token, isLoading: authLoading } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<
    FamilyInvitation[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && token) {
      fetchFamilies();
      fetchPendingInvitations();
    }
  }, [token, authLoading]);

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
      if (family) setSelectedFamily(family);
    }
  };

  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/families");
      setFamilies(data);
    } catch (error) {
      console.error("Failed to fetch families", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvitations = async () => {
    try {
      const data = await apiClient.get("/families/invitations/pending");
      setPendingInvitations(data);
    } catch (error) {
      console.error("Failed to fetch pending invitations", error);
    }
  };

  const createFamily = async (name: string): Promise<Family> => {
    const family = await apiClient.post("/families", { name });
    setFamilies([...families, family]);
    return family;
  };

  const inviteMember = async (familyId: string, email: string) => {
    await apiClient.post(`/families/${familyId}/invitations`, {
      inviteeEmail: email,
    });
  };

  const leaveFamily = async (familyId: string) => {
    await apiClient.delete(`/families/${familyId}/members/me`);
    setFamilies(families.filter((f) => f.id !== familyId));
    if (selectedFamily?.id === familyId) {
      setSelectedFamily(null);
      await AsyncStorage.removeItem("selectedFamilyId");
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    await apiClient.post(`/families/invitations/${invitationId}/accept`, {});
    await fetchFamilies();
    await fetchPendingInvitations();
  };

  const declineInvitation = async (invitationId: string) => {
    await apiClient.post(`/families/invitations/${invitationId}/decline`, {});
    await fetchPendingInvitations();
  };

  const selectFamily = async (family: Family | null) => {
    setSelectedFamily(family);
    if (family) {
      await AsyncStorage.setItem("selectedFamilyId", family.id);
    } else {
      await AsyncStorage.removeItem("selectedFamilyId");
    }
  };

  const fetchFamilyWithMembers = async (
    familyId: string
  ): Promise<FamilyWithMembers> => {
    const data = await apiClient.get(`/families/${familyId}`);
    return data;
  };

  const removeMember = async (familyId: string, userId: string) => {
    await apiClient.delete(`/families/${familyId}/members/${userId}`);
    await fetchFamilies();
  };

  const getCurrentUserRole = (
    familyId: string
  ): "OWNER" | "ADMIN" | "MEMBER" | null => {
    // This would require fetching the family with members
    // For now, return null as a placeholder
    // In practice, we'd cache member information or fetch it
    return null;
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
