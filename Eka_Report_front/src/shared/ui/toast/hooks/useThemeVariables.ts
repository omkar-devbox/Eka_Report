import { useMemo, type CSSProperties } from "react";
import type { ToastTheme } from "../types/toast.types";

const THEME_MAP: Record<keyof ToastTheme, string> = {
  bg: "--toast-bg",
  text: "--toast-text",
  border: "--toast-border",
  iconBg: "--toast-icon-bg",
  iconText: "--toast-icon-text",
  progress: "--toast-progress",
};

export function useThemeVariables(theme?: ToastTheme) {
  return useMemo(() => {
    if (!theme) return undefined;

    return Object.entries(theme).reduce(
      (acc, [key, value]) => {
        const varName = THEME_MAP[key as keyof ToastTheme];
        if (varName && value) {
          acc[varName as string] = value;
        }
        return acc;
      },
      {} as Record<string, string>,
    ) as CSSProperties;
  }, [theme]);
}

export const THEME_VAR_CLASSES = {
  container:
    "bg-[var(--toast-bg)] text-[var(--toast-text)] border-[var(--toast-border)]",
  icon: "bg-[var(--toast-icon-bg)] text-[var(--toast-icon-text)]",
  progress: "bg-[var(--toast-progress)]",
};
