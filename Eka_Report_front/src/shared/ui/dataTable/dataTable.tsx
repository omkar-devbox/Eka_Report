import { useRef, useCallback, useState, useEffect } from "react";
import { useDataTable } from "./hooks/useDataTable";
import { DataTableToolbar } from "./items/DataTableToolbar";
import { DataTableHead } from "./items/DataTableHead";
import { DataTableBody } from "./items/DataTableBody";
import { DataTableFooter } from "./items/DataTableFooter";
import { DataTablePagination } from "./items/DataTablePagination";
import { DataTableCardView } from "./items/DataTableCardView";
import type { DataTableProps } from "./types/dataTable.types";
import { dataTableStyles as styles } from "./styles/dataTable.styles";

/**
 * DataTable Component
 * A highly reusable, performant table with support for pinning, sorting, resizing, and filtering.
 * Refactored for virtualization and optimized state management (Zustand).
 */
export const DataTable = <T,>(props: DataTableProps<T>) => {
  const { state, paginatedData, visibleColumns, totalCount, actions } =
    useDataTable(props);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ── Debounced Search ───────────────────────────────────────────────────
  const [localSearch, setLocalSearch] = useState(state.globalSearch);

  useEffect(() => {
    setLocalSearch(state.globalSearch);
  }, [state.globalSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== state.globalSearch) {
        actions.setGlobalSearch(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, actions, state.globalSearch]);

  const handleGlobalSearchChange = useCallback((val: string) => {
    setLocalSearch(val);
  }, []);

  const isCardView = state.layout === "card";

  return (
    <div
      className={`${styles.container} ${props.className || ""}`}
      style={{
        height: props.height,
        maxHeight: props.maxHeight,
      }}
    >
      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      {!props.hideToolbar &&
        (props.enableSearch || state.layout !== "table") && (
          <DataTableToolbar
            columns={props.columns}
            globalSearch={localSearch}
            onGlobalSearchChange={handleGlobalSearchChange}
            onReset={actions.reset}
            enableSearch={props.enableSearch}
            layout={state.layout}
            onLayoutChange={actions.setLayout}
            cardOrientation={state.cardOrientation}
            onCardOrientationChange={actions.setCardOrientation}
          />
        )}

      {/* ── View Area ─────────────────────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        className="flex-auto overflow-auto relative bg-dt-bg"
        style={{ position: "relative", scrollbarGutter: "stable" }}
      >
        {isCardView ? (
          <DataTableCardView<T>
            data={paginatedData}
            columns={visibleColumns}
            renderCard={props.renderCard}
            getRowId={props.getRowId || ((row: any) => row.id)}
            selection={state.selection}
            onToggleSelection={
              props.selectable ? actions.toggleSelection : undefined
            }
            orientation={state.cardOrientation}
            isLoading={props.isLoading}
          />
        ) : (
          <table className={styles.table} style={{ tableLayout: "fixed" }}>
            <DataTableHead<T>
              columns={visibleColumns}
              sorting={state.sorting}
              pinning={state.columns.pinning}
              sizing={state.columns.sizing}
              onSort={actions.toggleSort}
              onPin={actions.setColumnPinning}
              onResize={actions.setColumnSizing}
              data={props.data}
            />
            <DataTableBody<T>
              data={paginatedData}
              columns={visibleColumns}
              pinning={state.columns.pinning}
              sizing={state.columns.sizing}
              selection={state.selection}
              onToggleSelection={
                props.selectable ? actions.toggleSelection : undefined
              }
              getRowId={
                props.getRowId ||
                ((row) => (row as Record<string, unknown>).id as string)
              }
              isLoading={props.isLoading}
              parentRef={scrollContainerRef}
              rowHeight={props.rowHeight}
              estimateRowHeight={props.estimateRowHeight}
            />
            <DataTableFooter<T>
              columns={visibleColumns}
              data={props.data}
              pinning={state.columns.pinning}
              sizing={state.columns.sizing}
            />
          </table>
        )}
      </div>

      {/* ── Footer / Pagination ───────────────────────────────────────────── */}
      <DataTablePagination
        pagination={state.pagination}
        totalCount={totalCount}
        onPageChange={actions.setPageIndex}
        onPageSizeChange={actions.setPageSize}
      />
    </div>
  );
};

DataTable.displayName = "DataTable";
