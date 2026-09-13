import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userControllerDeleteMe } from "@/api/generated/endpoints/users/users";
import type { DeleteAccountRequestDto } from "@/api/generated/model";
import { useAuth } from "@/providers/auth-provider";

export function useAccountDeletion() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const deleteAccount = useMutation({
    mutationFn: async (input: DeleteAccountRequestDto) => {
      await userControllerDeleteMe(input);
    },
    onSuccess: async () => {
      queryClient.clear();
      toast.success("Your account and all of its data were deleted.");
      await logout();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete account");
    },
  });

  return { deleteAccount };
}
