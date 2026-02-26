import { useState, useCallback } from "react";

export function useStickyDefault<T extends string>(key: string, fallback: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return fallback;
    return (localStorage.getItem(key) as T) || fallback;
  });

  const set = useCallback(
    (v: T) => {
      setValue(v);
      localStorage.setItem(key, v);
    },
    [key],
  );

  return [value, set];
}
