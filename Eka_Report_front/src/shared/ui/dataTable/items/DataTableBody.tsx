import { memo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DataTableRow } from "./DataTableRow";
import { Skeleton } from "../../skeleton";
import type {
  ColumnDef,
  PinDirection,
  Id,
  RowHeight,
} from "../types/dataTable.types";
import { dataTableStyles as styles } from "../styles/dataTable.styles";

interface DataTableBodyProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pinning: Record<string, PinDirection>;
  sizing: Record<string, number>;
  selection: Set<Id>;
  onToggleSelection?: (row: T) => void;
  getRowId: (row: T) => Id;
  isLoading?: boolean;
  parentRef: React.RefObject<HTMLDivElement | null>;
  estimateRowHeight?: number;
  rowHeight?: RowHeight;
}

const DataTableBodyInner = <T,>({
  data,
  columns,
  pinning,
  sizing,
  selection,
  onToggleSelection,
  getRowId,
  isLoading,
  parentRef,
  estimateRowHeight = 45,
  rowHeight,
}: DataTableBodyProps<T>) => {
  // 🔹 Virtualization logic
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () =>
      typeof rowHeight === "number" ? rowHeight : estimateRowHeight,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  // 🔹 Loading state
  if (isLoading) {
    return (
      <tbody>
        {[...Array(10)].map((_, i) => (
          <tr key={i} className={styles.row(false)}>
            {columns.map((col, j) => (
              <td
                key={j}
                className={styles.cell(
                  !!pinning[col.id],
                  j === columns.length - 1,
                  col.align,
                )}
                style={{
                  width: sizing[col.id] || col.width,
                  minWidth: sizing[col.id] || col.width,
                  left: pinning[col.id] === "left" ? 0 : undefined,
                  right: pinning[col.id] === "right" ? 0 : undefined,
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  {col.id === "name" && (
                    <Skeleton variant="circle" width={32} height={32} />
                  )}
                  <div className="flex-1 space-y-2">
                    <Skeleton
                      variant="text"
                      width={j % 2 === 0 ? "80%" : "60%"}
                      height={14}
                    />
                  </div>
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }

  // 🔹 Empty state
  if (data.length === 0) {
    return (
      <tbody>
        <tr className={styles.emptyRow}>
          <td colSpan={columns.length} className={styles.emptyContent}>
            <div className="text-[16px] font-medium">No results found</div>
            <div className="text-[14px] opacity-70">
              Try adjusting your filters
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  // 🔹 Virtualized rows
  return (
    <tbody
      className={styles.body}
      style={{
        height: `${totalSize}px`,
        position: "relative",
      }}
    >
      {/* Spacer to push rows down when scrolling */}
      {virtualRows.length > 0 && virtualRows[0].start > 0 && (
        <tr>
          <td style={{ height: `${virtualRows[0].start}px` }} />
        </tr>
      )}

      {virtualRows.map((virtualRow) => {
        const row = data[virtualRow.index];
        const rowId = getRowId(row);

        return (
          <DataTableRow
            key={rowId}
            row={row}
            index={virtualRow.index}
            columns={columns}
            pinning={pinning}
            sizing={sizing}
            isSelected={selection.has(rowId)}
            onToggleSelection={onToggleSelection}
            // Use ref for dynamic measurement if needed (optional)
            measureRef={rowVirtualizer.measureElement}
            data-index={virtualRow.index}
          />
        );
      })}

      {/* Spacer to fill remaining height */}
      {virtualRows.length > 0 && (
        <tr>
          <td
            style={{
              height: `${totalSize - virtualRows[virtualRows.length - 1].end}px`,
            }}
          />
        </tr>
      )}
    </tbody>
  );
};

export const DataTableBody = memo(DataTableBodyInner) as (<T>(
  props: DataTableBodyProps<T>,
) => React.ReactElement) & {
  displayName: string;
};

DataTableBody.displayName = "DataTableBody";
