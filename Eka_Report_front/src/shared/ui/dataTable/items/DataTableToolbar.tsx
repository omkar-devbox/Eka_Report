import { memo, type FC } from "react";
import {
  Search,
  RotateCcw,
  X,
  LayoutGrid,
  Table,
  Rows,
  Grid,
} from "lucide-react";
import { FormField } from "../../formField/items/FormField";
import type { ColumnDef, DataTableStyleConfig } from "../types/dataTable.types";
import { dataTableStyles as styles } from "../styles/dataTable.styles";

/**
 * DataTableToolbar Props
 */
export interface DataTableToolbarProps {
  /** Column definitions (needed for labels in chips) */
  columns: ColumnDef<any>[];
  /** Current global search value */
  globalSearch: string;
  /** Callback for search value change */
  onGlobalSearchChange: (value: string) => void;
  /** Callback to reset all table filters/sorting */
  onReset?: () => void;
  /** Optional style configuration */
  styleConfig?: DataTableStyleConfig["toolbar"];
  /** Whether search is enabled */
  enableSearch?: boolean;
  /** Current layout mode */
  layout?: "table" | "card" | null;
  /** Callback for layout change */
  onLayoutChange?: (layout: "table" | "card") => void;
  /** Current card orientation */
  cardOrientation?: "vertical" | "horizontal";
  /** Callback for card orientation change */
  onCardOrientationChange?: (orientation: "vertical" | "horizontal") => void;
}

/**
 * DataTableToolbar Component
 * Renders the top bar of the DataTable with search and actions.
 * Optimized for high-density information display and premium aesthetics.
 */
export const DataTableToolbar: FC<DataTableToolbarProps> = memo(
  ({
    globalSearch,
    onGlobalSearchChange,
    onReset,
    styleConfig,
    enableSearch = true,
    layout,
    onLayoutChange,
    cardOrientation,
    onCardOrientationChange,
  }) => {
    const isTable = layout === "table";
    const isCard = layout === "card";
    const hasValue = globalSearch.length > 0;

    return (
      <div className="flex flex-col rounded-t-inherit">
        <div className={styles.toolbar}>
          {/* ── Left Side: Search & Filters ────────────────────────────────────── */}
          <div className="flex-1 flex items-center gap-3">
            {enableSearch && (
              <div className="w-full max-w-[320px] relative">
                <FormField
                  type="text"
                  placeholder="Search records..."
                  value={globalSearch}
                  onChange={(e) => {
                    const val =
                      typeof e === "object" && e !== null && "target" in e
                        ? (e.target as HTMLInputElement).value
                        : String(e);
                    onGlobalSearchChange(val);
                  }}
                  fullWidth
                  styleConfig={{
                    bg: "var(--dt-search-bg)",
                    border: "var(--dt-search-border)",
                    ...styleConfig,
                  }}
                />

                {!hasValue && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-text-muted">
                    <Search size={16} />
                  </div>
                )}

                {hasValue && (
                  <button
                    type="button"
                    onClick={() => onGlobalSearchChange("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-muted flex items-center justify-center p-1 rounded hover:bg-neutral-bg transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Right Side: Actions ────────────────────────────────────────────── */}
          {layout !== "table" && (
            <div className="flex items-center gap-2">
              {layout !== "card" && onLayoutChange && (
                <div className={styles.toolbarActionContainer}>
                  <button
                    type="button"
                    onClick={() => onLayoutChange("table")}
                    title="Table View"
                    className={styles.toolbarActionBtn(isTable)}
                  >
                    <Table size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onLayoutChange("card")}
                    title="Card View"
                    className={styles.toolbarActionBtn(isCard)}
                  >
                    <LayoutGrid size={16} />
                  </button>
                </div>
              )}

              {layout === "card" && onCardOrientationChange && (
                <div className={styles.toolbarActionContainer}>
                  <button
                    type="button"
                    onClick={() => onCardOrientationChange("vertical")}
                    title="Vertical Grid"
                    className={styles.toolbarActionBtn(
                      cardOrientation === "vertical",
                    )}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onCardOrientationChange("horizontal")}
                    title="Horizontal List"
                    className={styles.toolbarActionBtn(
                      cardOrientation === "horizontal",
                    )}
                  >
                    <Rows size={16} />
                  </button>
                </div>
              )}

              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  title="Reset table state"
                  className={styles.toolbarResetBtn}
                >
                  <RotateCcw size={16} />
                  {hasValue && <span>Reset</span>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

DataTableToolbar.displayName = "DataTableToolbar";
