import { useMemo, useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { createDataTableStore } from "./useDataTableStore";
import type { DataTableProps } from "../types/dataTable.types";

/**
 * useDataTable Hook
 * Centralizes the logic for sorting, filtering, pagination, selection, and column management.
 * Optimized for performance using Zustand and memoized selectors.
 */
export function useDataTable<T>(props: DataTableProps<T>) {
  const {
    data,
    columns: columnDefs,
    getRowId = (row: T) =>
      ((row as Record<string, unknown>).id as string) ||
      ((row as Record<string, unknown>)._id as string),
    enableSearch = true,
  } = props;

  // Initialize store only once per component instance
  const storeRef = useRef<ReturnType<typeof createDataTableStore<T>> | null>(
    null,
  );
  if (!storeRef.current) {
    storeRef.current = createDataTableStore<T>(columnDefs, props.layout);
  }
  const useStore = storeRef.current;

  // Selectors for specific state slices to minimize re-renders
  // useShallow is critical here because we're returning a new object from the selector
  const state = useStore(
    useShallow((s) => ({
      sorting: s.sorting,
      pagination: s.pagination,
      globalSearch: s.globalSearch,
      selection: s.selection,
      columns: s.columns,
      layout: s.layout,
      cardOrientation: s.cardOrientation,
    })),
  );

  const actions = useStore(
    useShallow((s) => ({
      toggleSort: s.toggleSort,
      setColumnPinning: s.setColumnPinning,
      setColumnSizing: s.setColumnSizing,
      setColumnVisibility: s.setColumnVisibility,
      toggleSelection: s.toggleSelection,
      toggleAllSelection: s.toggleAllSelection,
      setSelection: s.setSelection,
      setPagination: s.setPagination,
      setGlobalSearch: s.setGlobalSearch,
      setLayout: s.setLayout,
      setCardOrientation: s.setCardOrientation,
      reset: s.reset,
    })),
  );
 
  // Sync external selection prop to internal store
  useEffect(() => {
    if (props.selection) {
      actions.setSelection(new Set(props.selection));
    }
  }, [props.selection, actions]);

  // Notify parent of global search changes
  useEffect(() => {
    if (props.onGlobalSearchChange) {
      props.onGlobalSearchChange(state.globalSearch);
    }
  }, [state.globalSearch, props.onGlobalSearchChange]);

  /* =========================================================
     🔹 DERIVED STATE: FILTERING (Memoized)
  ========================================================= */

  const filteredData = useMemo(() => {
    let result = [...data];

    // 1. Global Search
    if (state.globalSearch && enableSearch) {
      const search = state.globalSearch.toLowerCase();
      result = result.filter((row) =>
        Object.values(row as Record<string, unknown>).some((val) =>
          String(val).toLowerCase().includes(search),
        ),
      );
    }

    return result;
  }, [data, state.globalSearch, enableSearch]);

  /* =========================================================
     🔹 DERIVED STATE: SORTING
  ========================================================= */

  const sortedData = useMemo(() => {
    if (state.sorting.length === 0) return filteredData;

    const sorted = [...filteredData];
    const { id, desc } = state.sorting[0];
    const col = columnDefs.find((c) => c.id === id);

    if (!col || !("key" in col)) return sorted;

    const key = col.key;

    return sorted.sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal === bVal) return 0;
      const modifier = desc ? -1 : 1;
      return aVal > bVal ? modifier : -modifier;
    });
  }, [filteredData, state.sorting, columnDefs]);

  /* =========================================================
     🔹 DERIVED STATE: PAGINATION
  ========================================================= */

  const paginatedData = useMemo(() => {
    if (props.manualPagination) {
      return data;
    }
    const start = state.pagination.pageIndex * state.pagination.pageSize;
    const end = start + state.pagination.pageSize;
    return sortedData.slice(start, end);
  }, [data, sortedData, state.pagination, props.manualPagination]);

  /* =========================================================
     🔹 EFFECT: SYNC PROPS TO STORE
  ========================================================= */

  useEffect(() => {
    if (props.manualPagination || props.pagination) {
      const pageIndex = props.pagination 
        ? props.pagination.page - 1 
        : props.pageIndex;
      const pageSize = props.pagination
        ? props.pagination.limit
        : props.pageSize;

      if (
        pageIndex !== undefined &&
        pageIndex !== state.pagination.pageIndex
      ) {
        actions.setPagination({ pageIndex });
      }
      if (
        pageSize !== undefined &&
        pageSize !== state.pagination.pageSize
      ) {
        actions.setPagination({ pageSize });
      }
    }
  }, [
    props.manualPagination,
    props.pagination,
    props.pageIndex,
    props.pageSize,
    state.pagination.pageIndex,
    state.pagination.pageSize,
    actions,
  ]);

  /* =========================================================
     🔹 DERIVED STATE: COLUMNS
  ========================================================= */

  const visibleColumns = useMemo(() => {
    return columnDefs.filter(
      (col) => state.columns.visibility[col.id] !== false,
    );
  }, [columnDefs, state.columns.visibility]);

  /* =========================================================
     🔹 SELECTION SYNC
  ========================================================= */

  const handleToggleAllSelection = useCallback(() => {
    const allIds = sortedData.map(getRowId);
    actions.toggleAllSelection(allIds);
  }, [sortedData, getRowId, actions]);

  const handleToggleSelection = useCallback(
    (row: T) => {
      actions.toggleSelection(getRowId(row));
    },
    [getRowId, actions],
  );

  // Notify parent of selection changes
  const selectionArray = useMemo(
    () => Array.from(state.selection),
    [state.selection],
  );
  const prevSelectionRef = useRef<string>("");

  useEffect(() => {
    const currentSelectionStr = JSON.stringify(selectionArray);
    if (
      props.onSelectionChange &&
      currentSelectionStr !== prevSelectionRef.current
    ) {
      props.onSelectionChange(selectionArray);
      prevSelectionRef.current = currentSelectionStr;
    }
  }, [selectionArray, props.onSelectionChange]);

  // Notify parent of sorting changes
  useEffect(() => {
    if (props.onSortingChange) {
      props.onSortingChange(state.sorting);
    }
  }, [state.sorting, props.onSortingChange]);

  return {
    state,
    paginatedData,
    sortedData, // Export sortedData for virtualization if needed
    visibleColumns,
    totalCount: (props.manualPagination || props.pagination)
      ? (props.pagination?.total ?? props.totalCount ?? 0)
      : sortedData.length,
    actions: {
      ...actions,
      toggleSelection: handleToggleSelection,
      toggleAllSelection: handleToggleAllSelection,
      setPageIndex: (index: number) => {
        actions.setPagination({ pageIndex: index });
        if (props.pagination?.onPageChange) {
          props.pagination.onPageChange(index + 1);
        } else if (props.onPageChange) {
          props.onPageChange(index);
        }
      },
      setPageSize: (size: number) => {
        actions.setPagination({ pageSize: size, pageIndex: 0 });
        if (props.pagination?.onLimitChange) {
          props.pagination.onLimitChange(size);
        } else if (props.onPageSizeChange) {
          props.onPageSizeChange(size);
        }
      },
    },
  };
}
