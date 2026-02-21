import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Family, FamilyWithMembers, FamilyInvitation } from "@/types";
import {
  familyControllerFindAll,
  familyControllerCreate,
  familyControllerFindOne,
  familyControllerInviteMember,
  familyControllerGetPendingInvitations,
  familyControllerGetFamilyPendingInvitations,
  familyControllerAcceptInvitation,
  familyControllerDeclineInvitation,
  familyControllerCancelInvitation,
  familyControllerRemoveMember,
  familyControllerLeaveFamily,
} from "@/api/generated/endpoints/family/family";

export function usePendingInvitations() {
  const query = useQuery({
    queryKey: ["family-invitations-pending"],
    queryFn: async () => {
      const res = await familyControllerGetPendingInvitations();
      return res.data;
    },
  });

  return {
    pendingInvitations: query.data || [],
    isLoading: query.isLoading,
  };
}

export function useFamilies() {
  const queryClient = useQueryClient();

  const familiesQuery = useQuery({
    queryKey: ["families"],
    queryFn: async () => {
      const res = await familyControllerFindAll();
      return res.data;
    },
  });

  const pendingInvitationsQuery = useQuery({
    queryKey: ["family-invitations-pending"],
    queryFn: async () => {
      const res = await familyControllerGetPendingInvitations();
      return res.data;
    },
  });

  const createFamily = useMutation({
    mutationFn: async (name: string) => {
      const res = await familyControllerCreate({ name });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
    },
  });

  const inviteMember = useMutation({
    mutationFn: async ({ familyId, email }: { familyId: string; email: string }) => {
      await familyControllerInviteMember(familyId, { inviteeEmail: email });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["family-sent-invitations", variables.familyId] });
    },
  });

  const removeMember = useMutation({
    mutationFn: async ({ familyId, userId }: { familyId: string; userId: string }) => {
      await familyControllerRemoveMember(familyId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
    },
  });

  const leaveFamily = useMutation({
    mutationFn: async (familyId: string) => {
      await familyControllerLeaveFamily(familyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
    },
  });

  const acceptInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      await familyControllerAcceptInvitation(invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      queryClient.invalidateQueries({ queryKey: ["family-invitations-pending"] });
    },
  });

  const declineInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      await familyControllerDeclineInvitation(invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-invitations-pending"] });
    },
  });

  return {
    families: familiesQuery.data || [],
    pendingInvitations: pendingInvitationsQuery.data || [],
    isLoading: familiesQuery.isLoading,
    createFamily,
    inviteMember,
    removeMember,
    leaveFamily,
    acceptInvitation,
    declineInvitation,
  };
}

export function useFamilyDetail(familyId: string) {
  return useQuery({
    queryKey: ["family", familyId],
    queryFn: async () => {
      const res = await familyControllerFindOne(familyId);
      return res.data;
    },
    enabled: !!familyId,
  });
}

export function useFamilySentInvitations(familyId: string) {
  const queryClient = useQueryClient();

  const sentInvitationsQuery = useQuery({
    queryKey: ["family-sent-invitations", familyId],
    queryFn: async () => {
      const res = await familyControllerGetFamilyPendingInvitations(familyId);
      return res.data;
    },
    enabled: !!familyId,
  });

  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      await familyControllerCancelInvitation(invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-sent-invitations", familyId] });
    },
  });

  return {
    sentInvitations: sentInvitationsQuery.data || [],
    isLoading: sentInvitationsQuery.isLoading,
    cancelInvitation,
  };
}
