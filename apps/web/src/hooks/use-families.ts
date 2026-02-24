import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  familyControllerFindOne,
  familyControllerGetFamilyPendingInvitations,
  familyControllerCancelInvitation,
} from "@/api/generated/endpoints/family/family";
import { useFamilyList } from "@/hooks/use-family-list";
import { useFamilyMutations } from "@/hooks/use-family-mutations";
import { useFamilyInvitations } from "@/hooks/use-family-invitations";
import { queryKeys } from "@/lib/query-keys";

export function usePendingInvitations() {
  const { pendingInvitations, isLoading } = useFamilyInvitations();
  return { pendingInvitations, isLoading };
}

/** Backward-compatible composite hook. */
export function useFamilies() {
  const { families, isLoading } = useFamilyList();
  const { createFamily, inviteMember, removeMember, leaveFamily } = useFamilyMutations();
  const { pendingInvitations, acceptInvitation, declineInvitation } = useFamilyInvitations();

  return {
    families,
    pendingInvitations,
    isLoading,
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
    queryKey: queryKeys.families.detail(familyId),
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
    queryKey: queryKeys.families.sentInvitations(familyId),
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.families.sentInvitations(familyId),
      });
    },
  });

  return {
    sentInvitations: sentInvitationsQuery.data || [],
    isLoading: sentInvitationsQuery.isLoading,
    cancelInvitation,
  };
}
