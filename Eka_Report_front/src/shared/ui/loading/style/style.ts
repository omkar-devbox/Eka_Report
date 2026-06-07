/* ============================================================
 *  Loading — Light Mode Only (Clean Version)
 * ============================================================ */

export const loadingBaseStyles = {
  /** Wrapper */
  wrapper:
    "flex flex-col items-center justify-center bg-white transition-all duration-300",

  /** Fullscreen */
  fullScreen: "fixed inset-0 z-[10000]",

  /** Inline */
  inline: "w-full h-full min-h-[400px] rounded-3xl border border-gray-100",

  /** Card Layout (same as index.html) */
  card: "flex flex-col items-center gap-[18px]",

  /** Logo (exact gradient + shadow) */
  logo: "w-14 h-14 rounded-[14px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-xl shadow-[0_6px_18px_rgba(99,102,241,0.25)]",

  /** Loader Track */
  loader:
    "w-[110px] h-[3px] rounded-[10px] bg-[#e5e7eb] overflow-hidden relative",

  /** Loader Moving Bar */
  loaderBar:
    "absolute inset-y-0 w-[35%] bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] animate-move",

  /** Text */
  text: "text-[11px] font-medium tracking-[0.18em] text-[#6b7280] uppercase",

  /** Skeleton wrapper (optional reuse) */
  skeletonWrapper: "p-8 w-full max-w-7xl mx-auto",
} as const;
