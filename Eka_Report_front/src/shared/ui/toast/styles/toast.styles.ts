import { cva } from "class-variance-authority";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import type { ToastVariant, ToastPosition } from "../types/toast.types";

/* ---------------------------------- */
/* TYPES */
/* ---------------------------------- */

interface NotificationVariantConfig {
  icon: LucideIcon;
  colorClass: string;
  animate?: string;
}

/* ---------------------------------- */
/* BASE */
/* ---------------------------------- */

const VARIANT_BASE = "text-white border-transparent";

/* ---------------------------------- */
/* VARIANT CONFIG */
/* ---------------------------------- */

export const NOTIFICATION_CONFIG: Record<
  ToastVariant,
  NotificationVariantConfig
> = {
  success: {
    icon: CheckCircle2,
    colorClass: `bg-[var(--toast-success,#22c55e)] ${VARIANT_BASE}`,
  },
  error: {
    icon: AlertCircle,
    colorClass: `bg-[var(--toast-error,#ef4444)] ${VARIANT_BASE}`,
  },
  warning: {
    icon: AlertTriangle,
    colorClass: `bg-[var(--toast-warning,#f59e0b)] ${VARIANT_BASE}`,
  },
  info: {
    icon: Info,
    colorClass: `bg-[var(--toast-info,#3b82f6)] ${VARIANT_BASE}`,
  },
  loading: {
    icon: Loader2,
    colorClass: `bg-[var(--toast-info,#3b82f6)] ${VARIANT_BASE}`,
    animate: "animate-spin",
  },
};

/* ---------------------------------- */
/* POSITION */
/* ---------------------------------- */

export const POSITION_MAP: Record<ToastPosition, string> = {
  "top-right": "top-6 right-6",
  "top-left": "top-6 left-6",
  "top-center": "top-6 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-6 right-6",
  "bottom-left": "bottom-6 left-6",
  "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
};

/* ---------------------------------- */
/* MAIN CARD (NO GLASS DESIGN) */
/* ---------------------------------- */

export const notificationVariants = cva(
  `
  flex items-start gap-3 p-4
  rounded-xl border
  bg-[var(--toast-bg,#ffffff)]
  text-[var(--toast-text,#111827)]
  shadow-sm
  overflow-hidden relative
  transition-all duration-200
  pointer-events-auto
  `,
  {
    variants: {
      variant: {
        success: "border-[var(--toast-border,#e5e7eb)]",
        error: "border-[var(--toast-border,#e5e7eb)]",
        warning: "border-[var(--toast-border,#e5e7eb)]",
        info: "border-[var(--toast-border,#e5e7eb)]",
        loading: "border-[var(--toast-border,#e5e7eb)]",
      },
      exiting: {
        true: "translate-x-full opacity-0",
        false: "translate-x-0 opacity-100",
      },
    },
    defaultVariants: {
      variant: "info",
      exiting: false,
    },
  },
);

/* ---------------------------------- */
/* UI ELEMENTS */
/* ---------------------------------- */

export const NOTIFICATION_UI = {
  container:
    "min-w-[var(--toast-min-width,320px)] max-w-[var(--toast-max-width,400px)]",

  iconContainer:
    "flex-shrink-0 size-[22px] rounded-full flex items-center justify-center mt-0.5",

  closeButton: `
    flex-shrink-0 -mt-0.5 -mr-1 p-0.5 rounded
    hover:bg-neutral-100
    transition-colors
    text-neutral-400 hover:text-neutral-600
    cursor-pointer
    `,

  progressBarContainer:
    "absolute bottom-0 left-0 w-full h-[3px] bg-neutral-200 overflow-hidden",

  progressBar: `
    h-full origin-left
    bg-current
    opacity-100
    `,
};
