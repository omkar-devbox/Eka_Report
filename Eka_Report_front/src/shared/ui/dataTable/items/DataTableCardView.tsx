import type { ReactNode } from "react";
import { Skeleton } from "../../skeleton";
import type { ColumnDef, Id } from "../types/dataTable.types";
import { dataTableStyles as styles } from "../styles/dataTable.styles";

interface DataTableCardViewProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  renderCard?: (row: T) => ReactNode;
  getRowId: (row: T) => Id;
  selection?: Set<Id>;
  onToggleSelection?: (row: T) => void;
  orientation?: "vertical" | "horizontal";
  isLoading?: boolean;
}

/**
 * DataTableCardView Component
 * Renders data in a responsive card grid layout.
 * Supports custom card rendering or fallback to an auto-generated card based on columns.
 */
export const DataTableCardView = <T,>({
  data,
  columns,
  renderCard,
  getRowId,
  selection,
  onToggleSelection,
  orientation = "vertical",
  isLoading,
}: DataTableCardViewProps<T>) => {
  if (isLoading) {
    return (
      <div className={styles.cardGrid(orientation)}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={styles.card(false, orientation)}>
            <div className={styles.cardContent(orientation)}>
              <div className="flex items-center gap-3 mb-4">
                <Skeleton variant="circle" width={40} height={40} />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton variant="text" count={3} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.emptyRow}>
        <div className={styles.emptyContent}>No records found.</div>
      </div>
    );
  }

  return (
    <div className={styles.cardGrid(orientation)}>
      {data.map((row, index) => {
        const id = getRowId(row);
        const isSelected = selection?.has(id) || false;

        return (
          <div
            key={String(id)}
            className={styles.card(isSelected, orientation)}
            onClick={() => onToggleSelection?.(row)}
          >
            {renderCard ? (
              renderCard(row)
            ) : (
              <div className={styles.cardContent(orientation)}>
                {columns.map((col) => {
                  // Skip if column is explicitly hidden
                  if (col.visible === false) return null;

                  const value = "key" in col ? row[col.key] : null;
                  const content = col.render
                    ? col.render(row, index)
                    : String(value ?? "");

                  return (
                    <div key={col.id} className={styles.cardItem(orientation)}>
                      <span className={styles.cardLabel}>{col.label}</span>
                      <div className={styles.cardValue}>{content}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

DataTableCardView.displayName = "DataTableCardView";
