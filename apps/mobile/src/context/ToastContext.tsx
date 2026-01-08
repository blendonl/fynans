import React, { createContext, useState, useContext, useRef, useCallback } from 'react';

export interface ToastData {
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
}

interface ToastContextType {
  showToast: (data: ToastData) => void;
  hideToast: () => void;
  currentToast: ToastData | null;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const AUTO_DISMISS_DURATION = 4000;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentToast, setCurrentToast] = useState<ToastData | null>(null);
  const [queue, setQueue] = useState<ToastData[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const processQueue = useCallback(() => {
    setQueue((prevQueue) => {
      if (prevQueue.length > 0) {
        const [next, ...rest] = prevQueue;
        setCurrentToast(next);
        startTimer();
        return rest;
      }
      return prevQueue;
    });
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setCurrentToast(null);
      processQueue();
    }, AUTO_DISMISS_DURATION);
  }, [processQueue]);

  const showToast = useCallback((data: ToastData) => {
    if (currentToast) {
      setQueue((prev) => [...prev, data]);
    } else {
      setCurrentToast(data);
      startTimer();
    }
  }, [currentToast, startTimer]);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCurrentToast(null);
    processQueue();
  }, [processQueue]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, currentToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
