import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  userControllerFindMe,
  userControllerUpdateMe,
  userControllerChangePassword,
  getUserControllerFindMeQueryKey,
} from "@/api/generated/endpoints/users/users";
import type {
  ChangePasswordRequestDto,
  UpdateProfileRequestDto,
} from "@/api/generated/model";

export type { UserResponseDto as Profile } from "@/api/generated/model";

export function useProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: getUserControllerFindMeQueryKey(),
    queryFn: async () => {
      const res = await userControllerFindMe();
      return res.data;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (input: UpdateProfileRequestDto) => {
      const res = await userControllerUpdateMe(input);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUserControllerFindMeQueryKey() });
      toast.success("Profile updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const changePassword = useMutation({
    mutationFn: async (input: ChangePasswordRequestDto) => {
      await userControllerChangePassword(input);
    },
    onSuccess: () => {
      toast.success("Password changed. Other sessions were signed out.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    updateProfile,
    changePassword,
  };
}
