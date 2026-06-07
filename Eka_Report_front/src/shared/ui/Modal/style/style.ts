import type { ModalStyleConfig } from "../types";

export const defaultModalStyleConfig: ModalStyleConfig = {
  overlay: {
    bg: "bg-gray-900/40 dark:bg-black/60",
    blur: "backdrop-blur-[2px]",
    zIndex: 50,
  },
  panel: {
    bg: "bg-surface-primary",
    rounded: "rounded-3xl",
    shadow: "shadow-2xl",
    border: "border border-border",
    maxWidths: {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-2xl",
      "2xl": "max-w-3xl",
      "3xl": "max-w-4xl",
      "4xl": "max-w-5xl",
      "5xl": "max-w-6xl",
      "6xl": "max-w-7xl",
      full: "max-w-[95vw] h-[95vh]",
    },
  },
  header: {
    bg: "",
    border: "border-b border-border/50",
    padding: "px-6 py-4",
    titleSize: "text-lg font-semibold",
    titleColor: "text-text",
    descSize: "text-sm font-normal",
    descColor: "text-text-muted",
    closeBtnColor: "text-text-muted hover:text-text",
    closeBtnHoverBg: "hover:bg-neutral-surface",
  },
  body: {
    bg: "",
    padding: "px-6 py-4",
    textColor: "text-text",
    maxHeight: "max-h-[70vh]",
  },
  footer: {
    bg: "",
    border: "border-t border-border/50",
    padding: "px-6 py-4",
  },
};

/* ── Helper for merging configs ────────────────────────────── */

export const getModalStyle = (config?: ModalStyleConfig) => {
  const c = { ...defaultModalStyleConfig, ...config };

  return {
    overlay: `${c.overlay?.bg} ${c.overlay?.blur}`,
    panel: `${c.panel?.bg} ${c.panel?.rounded} ${c.panel?.shadow} ${c.panel?.border} relative w-full overflow-hidden flex flex-col focus:outline-none`,
    header: {
      root: `${c.header?.bg} ${c.header?.padding} ${c.header?.border} flex items-start justify-between`,
      innerRow: "flex gap-3",
      iconWrapper: "flex-shrink-0 mt-0.5 text-gray-500",
      contentCol: "flex flex-col gap-0.5",
      title: `${c.header?.titleSize} ${c.header?.titleColor} leading-tight`,
      description: `${c.header?.descSize} ${c.header?.descColor} leading-relaxed`,
      closeButton: `p-1 rounded-lg ${c.header?.closeBtnColor} ${c.header?.closeBtnHoverBg} transition-all focus:outline-none focus:ring-2 focus:ring-gray-200`,
      closeIcon: "h-5 w-5",
    },
    body: {
      root: `${c.body?.bg} ${c.body?.padding} ${c.body?.textColor}`,
      scrollable: `${c.body?.maxHeight} overflow-y-auto custom-scrollbar`,
    },
    footer: {
      root: `${c.footer?.bg} ${c.footer?.padding} ${c.footer?.border} flex items-center gap-3`,
    },
    maxWidths: c.panel?.maxWidths || defaultModalStyleConfig.panel!.maxWidths!,
    zIndex: c.overlay?.zIndex || defaultModalStyleConfig.overlay!.zIndex!,
  };
};

export const modalFooterAlignStyles: Record<
  "left" | "center" | "right",
  string
> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};
