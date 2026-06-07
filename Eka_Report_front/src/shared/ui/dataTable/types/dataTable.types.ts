import type { ReactNode } from "react";

/* =========================================================
   🔹 CORE PRIMITIVES
========================================================= */

export type Id = string | number;

export type PinDirection = "left" | "right" | null;
export type ColumnAlign = "left" | "right" | "center";

export type LayoutType = "table" | "card" | null;
export type CardOrientation = "vertical" | "horizontal";
export type RowHeight = number | ((index: number) => number);

/* =========================================================
   🔹 SORTING
========================================================= */

export type ColumnSort<T> = {
  id: keyof T | (string & {});
  desc: boolean;
};

/* =========================================================
   🔹 COLUMN SYSTEM (SPLIT DESIGN)
========================================================= */

type BaseColumn<T> = {
  id: string;
  label: string;

  width?: number;
  minWidth?: number;
  maxWidth?: number;

  pinned?: PinDirection;
  align?: ColumnAlign;
  visible?: boolean;

  headerRender?: () => ReactNode;
  footerRender?: (data: T[]) => ReactNode;

  resizable?: boolean;
  pinnable?: boolean;
  isFilter?: boolean;
  isLast?: boolean;
};

type DataColumn<T> = BaseColumn<T> & {
  key: keyof T;

  sortable?: boolean;

  render?: (row: T, index: number) => ReactNode;

  filterSectionRender?: () => ReactNode;
};

type DisplayColumn<T> = BaseColumn<T> & {
  /** Fully custom column (no key required) */
  render: (row: T, index: number) => ReactNode;
};

export type ColumnDef<T> = DataColumn<T> | DisplayColumn<T>;

/* =========================================================
   🔹 TABLE STATE (MODULAR)
========================================================= */

export type TableSorting<T> = ColumnSort<T>[];

export type TablePagination = {
  pageIndex: number;
  pageSize: number;
};

export type TableColumnState = {
  order: string[];
  visibility: Record<string, boolean>;
  sizing: Record<string, number>;
  pinning: Record<string, PinDirection>;
};

export type DataTableState<T> = {
  sorting: TableSorting<T>;

  pagination: TablePagination;

  columns: TableColumnState;

  selection: Set<Id>;

  globalSearch: string;

  layout: LayoutType;
  cardOrientation: CardOrientation;
};

/* =========================================================
   🔹 STYLE SYSTEM (DESIGN TOKEN BASED)
========================================================= */

export type DataTableStyleConfig = {
  header?: {
    bg?: string;
    text?: string;
    border?: string;
  };

  row?: {
    bg?: string;
    text?: string;
    hoverBg?: string;
    selectedBg?: string;
    border?: string;
  };

  footer?: {
    bg?: string;
    text?: string;
    border?: string;
  };

  toolbar?: {
    bg?: string;
    text?: string;
    border?: string;
  };

  pagination?: {
    activeBg?: string;
    activeText?: string;
  };

  search?: {
    bg?: string;
    text?: string;
    border?: string;
  };

  loading?: {
    bg?: string;
  };
};

/* =========================================================
   🔹 MAIN PROPS (CLEAN API)
========================================================= */

export type DataTableProps<T> = {
  /** Raw data */
  data: T[];

  /** Column definitions */
  columns: ColumnDef<T>[];

  /** Unique row id resolver */
  getRowId?: (row: T) => Id;

  /** Loading state */
  isLoading?: boolean;

  /** Enable row selection */
  selectable?: boolean;

  /** Current selection (controlled) */
  selection?: Id[];

  /** Selection change callback */
  onSelectionChange?: (selection: Id[]) => void;

  /** Sorting change callback */
  onSortingChange?: (sorting: TableSorting<T>) => void;

  /** Table title */
  title?: string;

  /** Manual pagination (server-side) */
  manualPagination?: boolean;

  /** Total records (for manual pagination) */
  totalCount?: number;

  /** Current page index (0-indexed) */
  pageIndex?: number;

  /** Records per page */
  pageSize?: number;

  /** Page change callback */
  onPageChange?: (page: number) => void;

  /** Page size change callback */
  onPageSizeChange?: (pageSize: number) => void;

  /** Global search change callback */
  onGlobalSearchChange?: (search: string) => void;

  /** Layout mode */
  layout?: LayoutType;

  /** Card renderer (for card layout) */
  renderCard?: (row: T) => ReactNode;

  /** Card orientation (vertical grid vs horizontal list) */
  cardOrientation?: CardOrientation;

  /** Footer renderer */
  renderFooter?: () => ReactNode;

  /** Global search enable */
  enableSearch?: boolean;

  /** Design system tokens */
  styles?: DataTableStyleConfig;

  /** Fixed height for the table container (e.g. '500px', '70vh') */
  height?: string | number;

  /** Maximum height for the table container */
  maxHeight?: string | number;

  /** Additional CSS classes for the root container */
  className?: string;

  /** 🔹 Virtualization Props */
  /** Height of rows in pixels. Can be a number or a function for dynamic heights. */
  rowHeight?: RowHeight;
  /** Estimated average row height for virtualization (default: 45) */
  estimateRowHeight?: number;

  /** Scrollbar visibility */
  scrollbar?: "none" | "vertical" | "horizontal" | "both";

  /** Hide the toolbar (search + layout toggle) entirely */
  hideToolbar?: boolean;

  /** Manual pagination config */
  pagination?: {
    total: number;
    page: number; // 1-indexed
    limit: number;
    onPageChange: (page: number) => void; // 1-indexed
    onLimitChange: (limit: number) => void;
  };
};
