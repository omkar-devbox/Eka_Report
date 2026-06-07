import { memo, useMemo } from "react";
import type { ColumnDef, PinDirection } from "../types/dataTable.types";
import { calculateOffset } from "../utils/dataTable.utils";
import { dataTableStyles as styles } from "../styles/dataTable.styles";

interface DataTableRowProps<T> {
  row: T;
  index: number;
  columns: ColumnDef<T>[];
  pinning: Record<string, PinDirection>;
  sizing: Record<string, number>;
  isSelected: boolean;
  onToggleSelection?: (row: T) => void;
  measureRef?: (el: HTMLTableRowElement | null) => void;
  "data-index"?: number;
}

const DataTableRowInner = <T,>({
  row,
  index,
  columns,
  pinning,
  sizing,
  isSelected,
  onToggleSelection,
  measureRef,
  "data-index": dataIndex,
}: DataTableRowProps<T>) => {
  // Sort columns by pinning status
  const orderedColumns = useMemo(() => {
    const leftPinned = columns.filter((col) => pinning[col.id] === "left");
    const scrollable = columns.filter((col) => !pinning[col.id]);
    const rightPinned = columns.filter((col) => pinning[col.id] === "right");
    return [...leftPinned, ...scrollable, ...rightPinned];
  }, [columns, pinning]);

  return (
    <tr
      ref={measureRef}
      data-index={dataIndex}
      className={styles.row(isSelected)}
    >
      {orderedColumns.map((col, idx) => (
        <DataTableCell
          key={col.id}
          row={row}
          index={index}
          column={col}
          width={sizing[col.id] || col.width || 150}
          pinDirection={pinning[col.id] || null}
          leftOffset={
            pinning[col.id] === "left"
              ? calculateOffset(orderedColumns, idx, "left", sizing)
              : undefined
          }
          rightOffset={
            pinning[col.id] === "right"
              ? calculateOffset(orderedColumns, idx, "right", sizing)
              : undefined
          }
          isLast={idx === orderedColumns.length - 1}
          isSecondToLast={idx === orderedColumns.length - 2}
          isSelected={isSelected}
          onClick={
            col.id === "selection" ? () => onToggleSelection?.(row) : undefined
          }
        />
      ))}
    </tr>
  );
};

export const DataTableRow = memo(
  DataTableRowInner,
) as typeof DataTableRowInner & {
  displayName: string;
};

DataTableRow.displayName = "DataTableRow";

/* =========================================================
   🔹 DATA TABLE CELL
========================================================= */

interface DataTableCellProps<T> {
  row: T;
  index: number;
  column: ColumnDef<T>;
  width?: number;
  pinDirection: PinDirection;
  leftOffset?: number;
  rightOffset?: number;
  isLast?: boolean;
  isSecondToLast?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const DataTableCellInner = <T,>({
  row,
  index,
  column,
  width,
  pinDirection,
  leftOffset,
  rightOffset,
  isLast,
  isSecondToLast,
  isSelected,
  onClick,
}: DataTableCellProps<T>) => {
  const isPinned = !!pinDirection;

  // Render logic
  const content = useMemo(() => {
    if ("render" in column && column.render) {
      return column.render(row, index);
    } else if ("key" in column) {
      return String(row[column.key as keyof T] || "");
    }
    return null;
  }, [column, row, index]);

  return (
    <td
      className={styles.cell(
        isPinned,
        isLast || false,
        column.align,
        isSecondToLast || false,
        isSelected,
      )}
      style={{
        width: `${width || 150}px`,
        minWidth: `${width || 150}px`,
        maxWidth: column.maxWidth ? `${column.maxWidth}px` : undefined,
        left: leftOffset !== undefined ? `${leftOffset}px` : undefined,
        right: rightOffset !== undefined ? `${rightOffset}px` : undefined,
      }}
      onClick={onClick}
    >
      <div className={styles.cellContent(column.align)}>{content}</div>
    </td>
  );
};

const DataTableCell = memo(DataTableCellInner) as typeof DataTableCellInner & {
  displayName: string;
};

DataTableCell.displayName = "DataTableCell";
