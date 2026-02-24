import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  familyControllerCreate,
  familyControllerInviteMember,
  familyControllerRemoveMember,
  familyControllerLeaveFamily,
} from "@/api/generated/endpoints/family/family";
import { queryKeys } from "@/lib/query-keys";

export function useFamilyMutations() {
  const queryClient = useQueryClient();

  const createFamily = useMutation({
    mutationFn: async (name: string) => {
      const res = await familyControllerCreate({ name });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.families.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create family");
    },
  });

  const inviteMember = useMutation({
    mutationFn: async ({ familyId, email }: { familyId: string; email: string }) => {
      await familyControllerInviteMember(familyId, { inviteeEmail: email });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.families.sentInvitations(variables.familyId),
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to send invitation");
    },
  });

  const removeMember = useMutation({
    mutationFn: async ({ familyId, userId }: { familyId: string; userId: string }) => {
      await familyControllerRemoveMember(familyId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.families.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to remove member");
    },
  });

  const leaveFamily = useMutation({
    mutationFn: async (familyId: string) => {
      await familyControllerLeaveFamily(familyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.families.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to leave family");
    },
  });

  return { createFamily, inviteMember, removeMember, leaveFamily };
}
