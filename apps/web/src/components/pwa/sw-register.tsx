"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const UPDATE_POLL_INTERVAL = 60 * 60 * 1000;
const UPDATE_TOAST_ID = "service-worker-update";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let reloading = false;
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const onControllerChange = () => {
      if (!reloading) return;
      window.location.reload();
    };

    const promptForUpdate = (waiting: ServiceWorker) => {
      toast("A new version of Fynans is available.", {
        id: UPDATE_TOAST_ID,
        duration: Infinity,
        action: {
          label: "Reload",
          onClick: () => {
            reloading = true;
            waiting.postMessage({ type: "SKIP_WAITING" });
          },
        },
        cancel: { label: "Later", onClick: () => {} },
      });
    };

    const watchForWaiting = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting && navigator.serviceWorker.controller) {
        promptForUpdate(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;

        installing.addEventListener("statechange", () => {
          if (installing.state !== "installed") return;
          if (!navigator.serviceWorker.controller) return;
          promptForUpdate(installing);
        });
      });
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (cancelled) return;
        watchForWaiting(registration);
        pollTimer = setInterval(() => {
          registration.update().catch(() => {});
        }, UPDATE_POLL_INTERVAL);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, []);

  return null;
}
