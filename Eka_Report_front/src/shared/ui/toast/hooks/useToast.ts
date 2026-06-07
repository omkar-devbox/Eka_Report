import { useSyncExternalStore, isValidElement, type ReactNode } from "react";
import type {
  ToastItem,
  ToastVariant,
  ToastOptions,
  ToastInput,
  ToastPosition,
} from "../types/toast.types";

let toasts: ToastItem[] = [];
let currentPosition: ToastPosition = "top-right";
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => toasts;

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const resolveInput = (
  input: ToastInput,
  variant: ToastVariant,
): Omit<ToastItem, "id"> => {
  // Check if input is a valid React element
  if (isValidElement(input)) {
    return { variant, content: input };
  }

  // Check if input is an options object
  if (typeof input === "object" && input !== null) {
    return { variant, ...(input as ToastOptions) };
  }

  // Default to treating as content
  return { variant, content: input as ReactNode };
};

export const toast = {
  add: (input: ToastInput, variant: ToastVariant = "info") => {
    const id = crypto.randomUUID();
    const itemData = resolveInput(input, variant);
    toasts = [...toasts, { id, ...itemData }];
    emitChange();
    return id;
  },
  remove: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    emitChange();
  },
  success: (m: ToastInput) => toast.add(m, "success"),
  error: (m: ToastInput) => toast.add(m, "error"),
  warning: (m: ToastInput) => toast.add(m, "warning"),
  info: (m: ToastInput) => toast.add(m, "info"),
  loading: (m: ToastInput) => toast.add(m, "loading"),
  setPosition: (position: ToastPosition) => {
    currentPosition = position;
    emitChange();
  },
};

export const useToast = () => {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const position = useSyncExternalStore(
    subscribe,
    () => currentPosition,
    () => currentPosition,
  );
  return {
    toasts: items,
    position,
    removeToast: toast.remove,
    setPosition: toast.setPosition,
  };
};
