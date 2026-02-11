import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Family, FamilyWithMembers, FamilyInvitation } from "@fynans/shared";

export function useFamilies() {
  const queryClient = useQueryClient();

  const familiesQuery = useQuery({
    queryKey: ["families"],
    queryFn: async () => {
      return (await apiClient.get("/families")) as Family[];
    },
  });

  const pendingInvitationsQuery = useQuery({
    queryKey: ["family-invitations-pending"],
    queryFn: async () => {
      return (await apiClient.get("/families/invitations/pending")) as FamilyInvitation[];
    },
  });

  const createFamily = useMutation({
    mutationFn: async (name: string) => {
      return (await apiClient.post("/families", { name })) as Family;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
    },
  });

  const inviteMember = useMutation({
    mutationFn: async ({ familyId, email }: { familyId: string; email: string }) => {
      await apiClient.post(`/families/${familyId}/invitations`, { inviteeEmail: email });
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
      return (await apiClient.get(`/families/${familyId}`)) as FamilyWithMembers;
    },
    enabled: !!familyId,
  });
}
