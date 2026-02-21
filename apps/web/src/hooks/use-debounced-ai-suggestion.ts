import { useState, useRef, useCallback } from "react";
import { aiControllerSuggestCategory } from "@/api/generated/endpoints/ai/ai";

interface AiSuggestion {
  categoryId: string;
  categoryName: string;
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
          const res = await aiControllerSuggestCategory(
            body as unknown as Parameters<typeof aiControllerSuggestCategory>[0],
            { signal: controller.signal },
          );
          const categoryId = res.data.categoryId as unknown as string | null;
          const categoryName = res.data.categoryName as unknown as string | null;

          if (categoryId && categoryName) {
            setSuggestion({ categoryId, categoryName });
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
