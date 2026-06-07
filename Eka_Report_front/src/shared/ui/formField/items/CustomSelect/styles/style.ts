/* ============================================================
 *  CustomSelect — Reusable Style Sheet
 *  All class strings live here for better maintainability.
 * ============================================================ */

export const selectStyles = {
  /** Main control container */
  control:
    "flex w-full items-center min-h-[40px] justify-between rounded-md border border-input-border-default bg-input-bg px-3 py-2 text-sm transition-all duration-200 cursor-pointer focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary focus-within:outline-none focus:outline-none hover:bg-neutral-surface/50",

  /** Disabled state for control */
  disabled:
    "cursor-not-allowed pr-10",

  /** Error state for control */
  error:
    "!border-error focus-within:border-error focus-within:ring-1 focus-within:ring-error bg-input-bg",

  /** Inner content area */
  contentArea:
    "flex flex-wrap items-center gap-1.5 flex-1 min-w-0 py-0.5 relative",

  /** Multi-select badge */
  badge:
    "flex items-center gap-1 rounded tracking-wide bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary shrink-0",
  badgeIcon: "h-3 w-3 cursor-pointer hover:opacity-70",

  /** Selected label (single select) */
  selectedLabel:
    "flex-1 truncate text-sm text-input-text leading-5 pointer-events-none",

  /** Placeholder */
  placeholder:
    "absolute inset-y-0 left-0 flex items-center text-sm text-text-muted leading-5 pointer-events-none truncate max-w-full",

  /** Search input */
  input:
    "bg-transparent outline-none p-0 text-input-text text-sm leading-5 min-w-0",

  /** Right indicators container */
  indicators: "flex items-center gap-1.5 ml-2 text-text-muted shrink-0",

  /** Dropdown menu */
  menu: "absolute z-[9999] mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-border bg-surface-primary py-1 shadow-lg shadow-black/10 focus:outline-none",

  /** Individual option */
  option:
    "flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors",
  optionSelected: "bg-brand-primary/10 text-brand-primary",
  optionHighlighted:
    "bg-neutral-surface text-text",
  optionDefault: "text-text-muted hover:bg-neutral-surface hover:text-text",

  /** Messages (loading/no options) */
  message: "px-3 py-2 text-sm text-text-muted",
} as const;
