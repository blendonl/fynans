import { useState, useCallback } from "react";

export function useCreateDialog(initialName = "") {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);

  const show = useCallback((prefillName: string) => {
    setName(prefillName);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  return { open, name, show, close, setOpen };
}
