/* ============================================================
 *  Tooltip — Styles
 * ============================================================ */

import type { TooltipVariant } from "../types/tooltip.types";

/**
 * Single source of truth for tooltip visual properties per variant.
 * Consolidates background, text, and arrow styles to reduce token waste.
 */
export const tooltipVariants: Record<
  TooltipVariant,
  { panel: string; arrow: string }
> = {
  dark: {
    panel: "bg-neutral-900 text-white dark:bg-neutral-800",
    arrow: "fill-neutral-900 dark:fill-neutral-800",
  },
  light: {
    panel: "bg-white text-neutral-900 border border-neutral-200 shadow-lg",
    arrow: "fill-white [&>path]:stroke-neutral-200",
  },
  primary: {
    panel: "bg-primary text-primary-foreground",
    arrow: "fill-primary",
  },
  success: {
    panel: "bg-emerald-600 text-white",
    arrow: "fill-emerald-600",
  },
  warning: {
    panel: "bg-amber-500 text-white",
    arrow: "fill-amber-500",
  },
  danger: {
    panel: "bg-destructive text-destructive-foreground",
    arrow: "fill-destructive",
  },
  info: {
    panel: "bg-sky-500 text-white",
    arrow: "fill-sky-500",
  },
};

export const tooltipBaseStyles = {
  triggerWrapper: "inline-block",
  panel:
    "z-[2000] px-3 py-1.5 text-xs font-medium rounded-md shadow-sm transition-opacity duration-200",
} as const;
