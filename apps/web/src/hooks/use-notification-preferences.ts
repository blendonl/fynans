import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  notificationPreferenceControllerGetPreferences,
  notificationPreferenceControllerUpdatePreferences,
  getNotificationPreferenceControllerGetPreferencesQueryKey,
} from "@/api/generated/endpoints/notification-preference/notification-preference";
import type { UpdatePreferenceRequestDto } from "@/api/generated/model";

export type NotificationChannel = "push" | "inApp" | "toast";

export type TypePreference = Partial<Record<NotificationChannel, boolean>>;

export type TypePreferences = Record<string, TypePreference>;

export function useNotificationPreferences() {
  const queryClient = useQueryClient();
  const queryKey = getNotificationPreferenceControllerGetPreferencesQueryKey();

  const preferencesQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await notificationPreferenceControllerGetPreferences();
      return res.data;
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (input: UpdatePreferenceRequestDto) => {
      const res = await notificationPreferenceControllerUpdatePreferences(input);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update notification preferences");
    },
  });

  return {
    preferences: preferencesQuery.data,
    isLoading: preferencesQuery.isLoading,
    updatePreferences,
  };
}

export function readTypePreferences(value: unknown): TypePreferences {
  if (typeof value !== "object" || value === null) {
    return {};
  }

  const result: TypePreferences = {};

  for (const [type, channels] of Object.entries(value)) {
    if (typeof channels !== "object" || channels === null) {
      continue;
    }

    const entry: TypePreference = {};
    const source = channels as Record<string, unknown>;

    for (const channel of ["push", "inApp", "toast"] as const) {
      if (typeof source[channel] === "boolean") {
        entry[channel] = source[channel];
      }
    }

    result[type] = entry;
  }

  return result;
}
