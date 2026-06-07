import type { ColumnDef } from "../types/dataTable.types";

export const calculateOffset = (
  cols: ColumnDef<any>[],
  index: number,
  direction: "left" | "right",
  sizing: Record<string, number>,
) => {
  if (direction === "left") {
    return cols
      .slice(0, index)
      .reduce((acc, col) => acc + (sizing[col.id] || col.width || 150), 0);
  } else {
    return cols
      .slice(index + 1)
      .reduce((acc, col) => acc + (sizing[col.id] || col.width || 150), 0);
  }
};
