/* ============================================================
 *  FormField — Reusable Style Sheet
 *  All class strings live here so FormField.tsx stays logic-only.
 * ============================================================ */

/* ── Shared base classes ───────────────────────────────────── */

export const formFieldBaseStyles = {
  /** Outer wrapper */
  wrapper: "flex flex-col gap-1.5 group",
  wrapperFull: "w-full",
  wrapperAuto: "w-auto",

  /** Top label (non-checkbox) */
  label:
    "text-sm font-semibold tracking-tight text-[color:var(--ff-label,var(--label-default))] transition-colors duration-200 group-focus-within:text-label-focus dark:text-text-muted dark:group-focus-within:text-brand-primary",
  labelDisabled: "",

  /** Inline label (checkbox / radio) */
  inlineLabel:
    "text-sm font-medium text-[color:var(--ff-label,var(--label-default))] cursor-pointer transition-colors duration-200 group-focus-within:text-label-focus dark:text-text-muted dark:group-focus-within:text-brand-primary",
  inlineLabelDisabled: "cursor-not-allowed",

  /** Required asterisk */
  requiredMark: "ml-1 text-error",
  hint: "cursor-help dark:border-gray-500",

  /** Helper / error text */
  helperText: "text-xs font-medium mt-1 text-text-muted",
  errorText: "text-xs font-medium mt-1 text-error",

  /** Shared text / textarea / input styles */
  input:
    "block w-full rounded-md border border-input-border-default bg-input-bg px-3 py-2 text-sm transition-all duration-200 min-h-[40px] text-input-text placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary hover:bg-neutral-surface/50",
  inputDisabled: "cursor-not-allowed pr-10",
  inputError: "!border-error focus:border-error focus:ring-error bg-input-bg",
  inputPII: "pr-10",

  /** Checkbox / radio input */
  checkboxInput:
    "h-4 w-4 rounded border-input-border-default text-brand-primary transition-all focus:ring-4 focus:ring-brand-primary/10 bg-input-bg",
  checkboxInputError: "border-error text-error focus:ring-error/10",

  radioInput:
    "h-4 w-4 border-input-border-default text-brand-primary transition-all focus:ring-4 focus:ring-brand-primary/10 cursor-pointer bg-input-bg",
  radioInputError: "border-error focus:ring-error/10",

  /** Checkbox / radio row */
  toggleRow: "flex items-center gap-3 group",
  radioGroup: "flex flex-col gap-2",

  /** PII wrapper */
  piiWrapper: "relative w-full group",
  piiToggleButton:
    "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-text-muted hover:text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all",
  piiToggleButtonDisabled: "cursor-not-allowed opacity-50",
  piiIcon: "h-4 w-4",
} as const;
