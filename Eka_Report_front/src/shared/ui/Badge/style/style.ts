/* ============================================================
 *  Badge — Reusable Style Sheet
 *  All class strings live here so Badge.tsx stays logic-only.
 * ============================================================ */

export type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

/* ── Variant classes ───────────────────────────────────────── */

export const badgeVariantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-neutral-border text-text-primary dark:bg-neutral-bg dark:text-text-primary',
  success:
    'bg-success-light text-success dark:bg-success/20 dark:text-success-light',
  danger:
    'bg-error-bg text-error dark:bg-error/20 dark:text-error-bg',
  warning:
    'bg-warning-light text-warning dark:bg-warning/20 dark:text-warning-light',
  info:
    'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/90',
};

/* ── Dot colours ───────────────────────────────────────────── */

export const badgeDotColors: Record<BadgeVariant, string> = {
  default: 'bg-neutral-border',
  success: 'bg-success',
  danger:  'bg-error',
  warning: 'bg-warning',
  info:    'bg-primary',
};

/* ── Dot sizes ─────────────────────────────────────────────── */

export const badgeDotSizes: Record<BadgeSize, string> = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-2.5 w-2.5',
};

/* ── Size classes ──────────────────────────────────────────── */

export const badgeSizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-1.5 py-0.5 min-h-[18px] min-w-[18px]',
  md: 'text-xs px-2 py-1 min-h-[22px] min-w-[22px]',
  lg: 'text-sm px-2.5 py-1.5 min-h-[26px] min-w-[26px]',
};

/* ── Shared base classes ───────────────────────────────────── */

export const badgeBaseStyles = {
  /** Always applied to the root <span> */
  root: 'inline-flex items-center justify-center font-medium transition-all duration-200',
  /** Wrapper around the dot indicator */
  dotWrapper: 'relative flex mr-1 last:mr-0',
  /** Ping animation ring */
  dotPing: 'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
  /** The solid dot */
  dot: 'relative inline-flex rounded-full',
  /** Icon wrapper — no sibling spacing */
  iconOnly: 'inline-flex',
  /** Icon wrapper — with right spacing when label/count follows */
  iconWithSibling: 'inline-flex mr-1.5',
} as const;
