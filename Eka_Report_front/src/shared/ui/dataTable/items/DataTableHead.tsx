import { useState, useEffect, memo, useMemo } from "react";
import type {
  ColumnDef,
  PinDirection,
  TableSorting,
} from "../types/dataTable.types";
import { calculateOffset } from "../utils/dataTable.utils";
import { HeaderCell } from "./head/HeaderCell";
import { dataTableStyles as styles } from "../styles/dataTable.styles";

interface DataTableHeadProps<T> {
  columns: ColumnDef<T>[];
  sorting: TableSorting<T>;
  pinning: Record<string, PinDirection>;
  sizing: Record<string, number>;
  onSort: (id: string, desc?: boolean | null) => void;
  onPin: (id: string, direction: PinDirection) => void;
  onResize: (id: string, width: number) => void;
  data: T[];
}

const DataTableHeadInner = <T,>({
  columns,
  sorting,
  pinning,
  sizing,
  onSort,
  onPin,
  onResize,
  data,
}: DataTableHeadProps<T>) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Register animations once
  useEffect(() => {
    if (!document.getElementById("dt-animations")) {
      const style = document.createElement("style");
      style.id = "dt-animations";
      style.innerHTML = `
        @keyframes dt-fade-in-up {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const orderedColumns = useMemo(() => {
    const leftPinned = columns.filter((col) => pinning[col.id] === "left");
    const scrollable = columns.filter((col) => !pinning[col.id]);
    const rightPinned = columns.filter((col) => pinning[col.id] === "right");
    return [...leftPinned, ...scrollable, ...rightPinned];
  }, [columns, pinning]);

  return (
    <thead className={styles.head}>
      <tr className={styles.headerRow}>
        {orderedColumns.map((col, idx) => (
          <HeaderCell
            key={col.id}
            column={col}
            isLast={idx === orderedColumns.length - 1}
            isSecondToLast={idx === orderedColumns.length - 2}
            width={sizing[col.id] || col.width}
            isSorted={sorting.find((s) => s.id === col.id)}
            pinDirection={pinning[col.id] || null}
            isMenuOpen={activeMenu === col.id}
            onToggleMenu={() =>
              setActiveMenu(activeMenu === col.id ? null : col.id)
            }
            onCloseMenu={() => setActiveMenu(null)}
            onSort={onSort}
            onPin={onPin}
            onResize={onResize}
            data={data}
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
          />
        ))}
      </tr>
    </thead>
  );
};

export const DataTableHead = memo(
  DataTableHeadInner,
) as typeof DataTableHeadInner & {
  displayName: string;
};

DataTableHead.displayName = "DataTableHead";
