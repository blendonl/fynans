import { useState, useRef, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

interface AiSuggestion {
  categoryId: string;
  categoryName: string;
}

interface SuggestCategoryResponse {
  categoryId: string | null;
  categoryName: string | null;
}

interface AiSuggestionConfig {
  debounceMs: number;
  minLength?: number;
}

export function useDebouncedAiSuggestion(config: AiSuggestionConfig) {
  const { debounceMs, minLength = 0 } = config;

  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const abortRef = useRef<AbortController | undefined>(undefined);

  const trigger = useCallback(
    (body: Record<string, unknown>, inputLength: number) => {
      clearTimeout(timerRef.current);

      if (inputLength < minLength) {
        setSuggestion(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      timerRef.current = setTimeout(async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const res = (await apiClient.post("/ai/suggest-category", body, {
            signal: controller.signal,
          })) as SuggestCategoryResponse;

          if (res.categoryId && res.categoryName) {
            setSuggestion({ categoryId: res.categoryId, categoryName: res.categoryName });
          } else {
            setSuggestion(null);
          }
        } catch {
          setSuggestion(null);
        }
        setIsLoading(false);
      }, debounceMs);
    },
    [debounceMs, minLength],
  );

  const dismiss = useCallback(() => setSuggestion(null), []);

  return { suggestion, isLoading, trigger, dismiss };
}
