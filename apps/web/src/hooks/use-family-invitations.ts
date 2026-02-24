import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  familyControllerGetPendingInvitations,
  familyControllerAcceptInvitation,
  familyControllerDeclineInvitation,
} from "@/api/generated/endpoints/family/family";
import { queryKeys } from "@/lib/query-keys";

export function useFamilyInvitations() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.families.invitationsPending(),
    queryFn: async () => {
      const res = await familyControllerGetPendingInvitations();
      return res.data;
    },
  });

  const acceptInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      await familyControllerAcceptInvitation(invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.families.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.families.invitationsPending() });
    },
  });

  const declineInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      await familyControllerDeclineInvitation(invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.families.invitationsPending() });
    },
  });

  return {
    pendingInvitations: query.data || [],
    isLoading: query.isLoading,
    acceptInvitation,
    declineInvitation,
  };
}
