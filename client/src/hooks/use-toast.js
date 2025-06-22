import { useState, useEffect } from 'react';

let toastCount = 0;
const toasts = new Map();

export function useToast() {
  const [toastsState, setToastsState] = useState([]);

  useEffect(() => {
    const updateToasts = () => {
      setToastsState(Array.from(toasts.values()));
    };

    // Listen for toast updates
    const interval = setInterval(updateToasts, 100);
    return () => clearInterval(interval);
  }, []);

  const toast = ({ title, description, variant = 'default', duration = 5000 }) => {
    const id = ++toastCount;
    const newToast = {
      id,
      title,
      description,
      variant,
      createdAt: Date.now(),
    };

    toasts.set(id, newToast);

    // Auto remove after duration
    setTimeout(() => {
      toasts.delete(id);
    }, duration);

    return id;
  };

  const dismiss = (id) => {
    toasts.delete(id);
  };

  return {
    toast,
    dismiss,
    toasts: toastsState,
  };
} 