import type { ColumnDef, PinDirection } from "../types/dataTable.types";
import { dataTableStyles as styles } from "../styles/dataTable.styles";

interface DataTableFooterProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pinning: Record<string, PinDirection>;
  sizing: Record<string, number>;
}

export const DataTableFooter = <T,>({
  columns,
  data,
  pinning,
  sizing,
}: DataTableFooterProps<T>) => {
  // 🔹 split columns by pin position
  const leftPinned = columns.filter((col) => pinning[col.id] === "left");
  const scrollable = columns.filter((col) => !pinning[col.id]);
  const rightPinned = columns.filter((col) => pinning[col.id] === "right");

  // 🔹 final render order
  const orderedColumns = [...leftPinned, ...scrollable, ...rightPinned];

  // 🔹 check if footer exists
  const hasFooter = columns.some((col) => !!col.footerRender);

  if (!hasFooter) return null; // no footer → skip render

  return (
    <tfoot className={styles.footer}>
      <tr className={styles.footerRow}>
        {orderedColumns.map((col, idx) => (
          <FooterCell
            key={col.id} // unique key
            column={col}
            data={data}
            isLast={idx === orderedColumns.length - 1} // last column check
            isSecondToLast={idx === orderedColumns.length - 2}
            width={sizing[col.id] || 150} // default width fallback
            pinDirection={pinning[col.id] || null} // pin state
            leftOffset={
              pinning[col.id] === "left"
                ? calculateOffset(orderedColumns, idx, "left", sizing) // left pin offset
                : undefined
            }
            rightOffset={
              pinning[col.id] === "right"
                ? calculateOffset(orderedColumns, idx, "right", sizing) // right pin offset
                : undefined
            }
          />
        ))}
      </tr>
    </tfoot>
  );
};

/* =========================================================
   🔹 FOOTER CELL
========================================================= */

interface FooterCellProps<T> {
  column: ColumnDef<T>;
  data: T[];
  width: number;
  isLast: boolean;
  isSecondToLast?: boolean;
  pinDirection: PinDirection;
  leftOffset?: number;
  rightOffset?: number;
}

const FooterCell = <T,>({
  column,
  data,
  width,
  isLast,
  isSecondToLast,
  pinDirection,
  leftOffset,
  rightOffset,
}: FooterCellProps<T>) => {
  const isPinned = !!pinDirection; // check pinned

  return (
    <td
      className={styles.footerCell(
        isPinned,
        isLast,
        column.align,
        isSecondToLast,
      )}
      style={{
        width: `${width}px`,
        minWidth: `${width}px`,
        left: leftOffset !== undefined ? `${leftOffset}px` : undefined,
        right: rightOffset !== undefined ? `${rightOffset}px` : undefined,
      }}
    >
      <div className={styles.cellContent(column.align)}>
        {column.footerRender ? column.footerRender(data) : null}{" "}
        {/* render footer */}
      </div>
    </td>
  );
};

/* =========================================================
   🔹 OFFSET CALCULATION
========================================================= */

const calculateOffset = (
  cols: ColumnDef<any>[],
  index: number,
  direction: "left" | "right",
  sizing: Record<string, number>,
) => {
  // 🔹 left pinned offset
  if (direction === "left") {
    return cols
      .slice(0, index) // previous columns
      .reduce((acc, col) => acc + (sizing[col.id] || 150), 0); // sum widths
  }

  // 🔹 right pinned offset
  return cols
    .slice(index + 1) // next columns
    .reduce((acc, col) => acc + (sizing[col.id] || 150), 0); // sum widths
};
