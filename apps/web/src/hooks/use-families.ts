import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Family, FamilyWithMembers, FamilyInvitation } from "@fynans/shared";

export function usePendingInvitations() {
  const query = useQuery({
    queryKey: ["family-invitations-pending"],
    queryFn: async () => {
      return apiClient.get<FamilyInvitation[]>("/families/invitations/pending");
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
      return apiClient.get<Family[]>("/families");
    },
  });

  const pendingInvitationsQuery = useQuery({
    queryKey: ["family-invitations-pending"],
    queryFn: async () => {
      return apiClient.get<FamilyInvitation[]>("/families/invitations/pending");
    },
  });

  const createFamily = useMutation({
    mutationFn: async (name: string) => {
      return apiClient.post<Family>("/families", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
    },
  });

  const inviteMember = useMutation({
    mutationFn: async ({ familyId, email }: { familyId: string; email: string }) => {
      await apiClient.post(`/families/${familyId}/invitations`, { inviteeEmail: email });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["family-sent-invitations", variables.familyId] });
    },
  });

  const removeMember = useMutation({
    mutationFn: async ({ familyId, userId }: { familyId: string; userId: string }) => {
      await apiClient.delete(`/families/${familyId}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
    },
  });

  const leaveFamily = useMutation({
    mutationFn: async (familyId: string) => {
      await apiClient.delete(`/families/${familyId}/members/me`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
    },
  });

  const acceptInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      await apiClient.post(`/families/invitations/${invitationId}/accept`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      queryClient.invalidateQueries({ queryKey: ["family-invitations-pending"] });
    },
  });

  const declineInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      await apiClient.post(`/families/invitations/${invitationId}/decline`, {});
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
      return apiClient.get<FamilyWithMembers>(`/families/${familyId}`);
    },
    enabled: !!familyId,
  });
}

export function useFamilySentInvitations(familyId: string) {
  const queryClient = useQueryClient();

  const sentInvitationsQuery = useQuery({
    queryKey: ["family-sent-invitations", familyId],
    queryFn: async () => {
      return apiClient.get<FamilyInvitation[]>(`/families/${familyId}/invitations/pending`);
    },
    enabled: !!familyId,
  });

  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      await apiClient.post(`/families/invitations/${invitationId}/cancel`, {});
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
