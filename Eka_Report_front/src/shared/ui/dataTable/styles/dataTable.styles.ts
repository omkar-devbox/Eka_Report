export const dataTableStyles = {
  // 🔹 Container
  container:
    "w-full flex flex-col overflow-hidden relative rounded-lg border border-dt-border-color bg-dt-bg shadow-sm isolate",

  // 🔹 Table
  table: "w-max min-w-full border-separate border-spacing-0 table",

  // 🔹 Header
  head: "sticky top-0 z-[100] bg-dt-header-bg border-b border-dt-border-color",

  headerRow: "flex",

  headerCell: (
    isPinned: boolean,
    isMenuOpen: boolean,
    isLast: boolean,
    isSecondToLast?: boolean,
  ) => {
    return [
      "flex items-center justify-between px-4 h-[40px] bg-dt-header-bg box-border text-left",
      "text-[12px] font-semibold uppercase tracking-tight text-dt-header-text select-none",
      isPinned ? "sticky" : "relative",
      isSecondToLast
        ? "flex-1 border-r border-dt-border-color"
        : isLast
          ? "border-r-0"
          : "border-r border-dt-border-color",
      isMenuOpen ? "z-[110]" : isPinned ? "z-[2]" : "z-[1]",
    ].join(" ");
  },

  headerLabelContainer: "flex items-center gap-2 flex-1 overflow-hidden",

  headerLabel: "truncate whitespace-nowrap",

  // 🔹 Resizer
  resizer:
    "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize z-10 transition-colors duration-200 hover:bg-primary",

  // 🔹 Body
  body: "block",

  row: (isSelected: boolean) => {
    return [
      "flex border-b border-dt-border-color transition-colors duration-150 cursor-pointer dt-row",
      isSelected ? "bg-dt-row-selected-bg" : "bg-dt-bg",
    ].join(" ");
  },

  cell: (
    isPinned: boolean,
    isLast: boolean,
    align?: "left" | "center" | "right",
    isSecondToLast?: boolean,
    isSelected?: boolean,
  ) => {
    return [
      "flex items-center px-4 min-h-[52px] box-border text-[14px] text-dt-row-text",
      isPinned ? "sticky z-[1]" : "relative z-0",
      isSelected
        ? "bg-dt-row-selected-bg"
        : isPinned
          ? "bg-dt-bg"
          : "bg-transparent",
      "dt-cell",
      isSecondToLast
        ? "flex-1 border-r-transparent"
        : isLast
          ? "border-r-0"
          : isPinned
            ? "border-r border-dt-border-color"
            : "border-r-transparent",
      align === "center"
        ? "justify-center"
        : align === "right"
          ? "justify-end"
          : "justify-start",
    ].join(" ");
  },

  cellContent: (align?: "left" | "center" | "right") => {
    return [
      "w-auto max-w-full py-2 whitespace-normal break-words",
      align === "center"
        ? "text-center"
        : align === "right"
          ? "text-right"
          : "text-left",
    ].join(" ");
  },

  // 🔹 Footer
  footer:
    "sticky bottom-0 z-[100] bg-dt-header-bg border-t border-dt-border-color",

  footerRow: "flex",

  footerCell: (
    isPinned: boolean,
    isLast: boolean,
    align?: "left" | "center" | "right",
    isSecondToLast?: boolean,
  ) => {
    return [
      "flex items-center px-4 h-[40px] bg-dt-header-bg box-border text-[13px] font-semibold text-dt-row-text",
      isPinned ? "sticky z-[2] bg-dt-header-bg" : "relative z-[1]",
      isSecondToLast
        ? "flex-1 border-r-transparent"
        : isLast
          ? "border-r-0"
          : isPinned
            ? "border-r border-dt-border-color"
            : "border-r-transparent",
      align === "center"
        ? "justify-center"
        : align === "right"
          ? "justify-end"
          : "justify-start",
    ].join(" ");
  },

  // 🔹 Menu Item
  menuItem: (active?: boolean) => {
    return [
      "flex items-center gap-3 px-3 py-2 cursor-pointer text-[13px] transition-colors duration-150",
      active
        ? "bg-dt-header-bg text-primary"
        : "bg-bg text-text-primary hover:bg-dt-header-bg",
    ].join(" ");
  },

  // 🔹 Toolbar
  toolbar:
    "flex items-center justify-between px-4 py-3 bg-dt-toolbar-bg border-b border-dt-border-color gap-4 flex-wrap text-dt-toolbar-text",

  toolbarActionContainer:
    "flex items-center bg-neutral-surface p-1 rounded-lg border border-dt-border-color shadow-inner",

  toolbarActionBtn: (isActive: boolean) => {
    return [
      "flex items-center justify-center w-[34px] h-[32px] rounded-md transition-all duration-200 border-none cursor-pointer",
      isActive
        ? "bg-bg text-primary shadow-sm"
        : "bg-transparent text-text-muted hover:text-text-primary",
    ].join(" ");
  },

  toolbarResetBtn:
    "flex items-center justify-center h-[38px] rounded-lg border border-dt-border-color bg-bg cursor-pointer transition-all duration-200 text-text-muted gap-2 text-[13px] font-medium px-3 hover:border-primary/50 hover:text-primary",

  // 🔹 Pagination
  pagination:
    "flex items-center justify-between px-4 py-2 bg-dt-toolbar-bg border-t border-dt-border-color text-[13px] text-text-muted",

  paginationGroup: "flex items-center gap-6",

  paginationSelect:
    "px-2 py-1 rounded-md border border-dt-border-color outline-none cursor-pointer bg-dt-bg text-dt-row-text text-[13px] hover:border-primary/50 transition-colors",

  paginationText: "text-text-primary font-semibold",

  paginationInputContainer: "relative flex items-center",

  paginationInput:
    "w-16 pl-2 pr-6 py-1 rounded-md border border-dt-border-color outline-none bg-dt-bg text-dt-row-text text-[13px] hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",

  paginationInputClear:
    "absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-sm hover:bg-neutral-bg transition-colors text-text-muted hover:text-primary cursor-pointer",

  paginationActions: "flex items-center gap-2",

  paginationButton: (disabled: boolean) => {
    return [
      "flex items-center justify-center w-8 h-8 rounded-md border border-dt-border-color transition-all duration-200",
      disabled
        ? "bg-neutral-bg-disabled text-text-muted cursor-not-allowed"
        : "bg-bg text-text-secondary cursor-pointer hover:border-primary hover:text-primary",
    ].join(" ");
  },

  // 🔹 States
  loadingRow:
    "flex border-b border-dt-border-color/50 h-[64px] items-center px-4",

  emptyRow: "flex h-[200px] items-center justify-center",

  emptyContent: "text-text-secondary text-center",

  // 🔹 MENU
  menu: `
    bg-bg
    rounded-xl
    border border-border
    ring-1 ring-black/5
    w-[280px]
    shadow-xl
    z-[999]
    will-change-transform
  `,

  // 🔹 Card View
  cardGrid: (orientation: "vertical" | "horizontal") =>
    [
      "p-6 bg-neutral-bg gap-4",
      orientation === "horizontal"
        ? "flex flex-col w-full"
        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    ].join(" "),

  card: (isSelected: boolean, orientation: "vertical" | "horizontal") =>
    [
      "bg-bg rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex",
      orientation === "horizontal" ? "w-full flex-row" : "flex-col",
      isSelected
        ? "ring-2 ring-primary border-transparent shadow-primary/10"
        : "hover:border-border-hover",
    ].join(" "),

  cardContent: (orientation: "vertical" | "horizontal") =>
    [
      "p-5 space-y-4 flex-1",
      orientation === "horizontal"
        ? "flex flex-row items-center gap-6 space-y-0 flex-wrap"
        : "",
    ].join(" "),

  cardItem: (orientation: "vertical" | "horizontal") =>
    [
      "flex flex-col gap-1.5",
      orientation === "horizontal" ? "min-w-[120px] flex-1" : "",
    ].join(" "),

  cardLabel:
    "text-[10px] font-bold text-text-secondary uppercase tracking-wider",
  cardValue: "text-[14px] text-text-primary font-medium",
};
