import { create } from "zustand";
import type {
  Id,
  PinDirection,
  LayoutType,
  CardOrientation,
  TableSorting,
  TablePagination,
  TableColumnState,
  ColumnDef,
} from "../types/dataTable.types";

interface DataTableStore<T> {
  // Table State
  sorting: TableSorting<T>;
  globalSearch: string;
  pagination: TablePagination;
  selection: Set<Id>;

  // Column State
  columns: TableColumnState;

  // UI State
  layout: LayoutType;
  cardOrientation: CardOrientation;
  hoveredRow: Id | null;

  // Actions
  setSorting: (sorting: TableSorting<T>) => void;
  toggleSort: (id: string, desc?: boolean | null) => void;
  setGlobalSearch: (search: string) => void;
  setPagination: (pagination: Partial<TablePagination>) => void;
  setSelection: (selection: Set<Id>) => void;
  toggleSelection: (id: Id) => void;
  toggleAllSelection: (ids: Id[]) => void;

  setColumnOrder: (order: string[]) => void;
  setColumnVisibility: (id: string, visible: boolean) => void;
  setColumnSizing: (id: string, width: number) => void;
  setColumnPinning: (id: string, direction: PinDirection) => void;

  setLayout: (layout: LayoutType) => void;
  setCardOrientation: (orientation: CardOrientation) => void;
  setHoveredRow: (id: Id | null) => void;

  reset: () => void;
}

export const createDataTableStore = <T>(
  initialColumns: ColumnDef<T>[],
  initialLayout: LayoutType = null,
) =>
  create<DataTableStore<T>>((set) => ({
    // Initial State
    sorting: [],
    globalSearch: "",
    pagination: { pageIndex: 0, pageSize: 10 },
    selection: new Set<Id>(),

    columns: {
      order: initialColumns.map((c) => c.id),
      visibility: initialColumns.reduce(
        (acc, col) => {
          if (col.visible === false) acc[col.id] = false;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
      sizing: initialColumns.reduce(
        (acc, col) => {
          if (col.width) acc[col.id] = col.width;
          return acc;
        },
        {} as Record<string, number>,
      ),
      pinning: initialColumns.reduce(
        (acc, col) => {
          if (col.pinned) acc[col.id] = col.pinned;
          return acc;
        },
        {} as Record<string, PinDirection>,
      ),
    },

    layout: initialLayout,
    cardOrientation: "vertical",
    hoveredRow: null,

    // Actions
    setSorting: (sorting) => set({ sorting }),
    toggleSort: (id, desc) =>
      set((state) => {
        const currentSort = state.sorting.find((s) => s.id === id);
        let newSorting: TableSorting<T> = [];

        if (desc === null) {
          newSorting = [];
        } else if (desc !== undefined) {
          newSorting = [{ id: id as keyof T, desc }];
        } else if (!currentSort) {
          newSorting = [{ id: id as keyof T, desc: false }];
        } else if (!currentSort.desc) {
          newSorting = [{ id: id as keyof T, desc: true }];
        } else {
          newSorting = [];
        }

        return { sorting: newSorting };
      }),

    setGlobalSearch: (search) =>
      set((state) => ({
        globalSearch: search,
        pagination: { ...state.pagination, pageIndex: 0 },
      })),

    setPagination: (pagination) =>
      set((state) => ({
        pagination: { ...state.pagination, ...pagination },
      })),

    setSelection: (selection) => set({ selection }),
    toggleSelection: (id) =>
      set((state) => {
        const newSelection = new Set(state.selection);
        if (newSelection.has(id)) {
          newSelection.delete(id);
        } else {
          newSelection.add(id);
        }
        return { selection: newSelection };
      }),

    toggleAllSelection: (ids) =>
      set((state) => {
        const isAllSelected = ids.every((id) => state.selection.has(id));
        return { selection: isAllSelected ? new Set<Id>() : new Set(ids) };
      }),

    setColumnOrder: (order) =>
      set((state) => ({ columns: { ...state.columns, order } })),

    setColumnVisibility: (id, visible) =>
      set((state) => ({
        columns: {
          ...state.columns,
          visibility: { ...state.columns.visibility, [id]: visible },
        },
      })),

    setColumnSizing: (id, width) =>
      set((state) => ({
        columns: {
          ...state.columns,
          sizing: { ...state.columns.sizing, [id]: width },
        },
      })),

    setColumnPinning: (id, direction) =>
      set((state) => ({
        columns: {
          ...state.columns,
          pinning: { ...state.columns.pinning, [id]: direction },
        },
      })),

    setLayout: (layout) => set({ layout }),
    setCardOrientation: (orientation) => set({ cardOrientation: orientation }),
    setHoveredRow: (hoveredRow) => set({ hoveredRow }),

    reset: () =>
      set((state) => ({
        sorting: [],
        globalSearch: "",
        pagination: { ...state.pagination, pageIndex: 0 },
        selection: new Set<Id>(),
      })),
  }));
