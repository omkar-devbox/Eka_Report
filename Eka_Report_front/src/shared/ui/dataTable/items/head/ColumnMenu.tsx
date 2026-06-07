import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Check,
  Maximize2,
  RotateCcw,
  Layout,
  Pin,
  ChevronRight,
} from "lucide-react";
import type {
  ColumnDef,
  PinDirection,
  ColumnSort,
} from "../../types/dataTable.types";
import { MenuItem } from "./MenuItem";
import { dataTableStyles as styles } from "../../styles/dataTable.styles";

interface ColumnMenuProps<T> {
  column: ColumnDef<T>;
  isSorted?: ColumnSort<T>;
  pinDirection: PinDirection;
  onSort: (id: string, desc?: boolean | null) => void;
  onPin: (id: string, direction: PinDirection) => void;
  onResize: (id: string, width: number) => void;
  onClose: () => void;
}

export const ColumnMenu = <T,>({
  column,
  isSorted,
  pinDirection,
  onSort,
  onPin,
  onResize,
  onClose,
}: ColumnMenuProps<T>) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(() => {
    const isSortable = "sortable" in column ? column.sortable !== false : false;
    if (isSortable) return "sort";
    if (column.pinnable !== false) return "pin";
    return null;
  });

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className={styles.menu}>
      {/* Dynamic Custom Section (e.g. Filters) */}
      {"filterSectionRender" in column && column.filterSectionRender && (
        <div className="p-3 border-b border-slate-100">
          {column.filterSectionRender()}
        </div>
      )}

      {/* Sort & Layout Section */}
      {("sortable" in column ? column.sortable !== false : false) && (
        <div className="border-b border-slate-100 overflow-hidden">
          <button
            onClick={() => toggleSection("sort")}
            className="w-full px-3 py-2.5 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider"
          >
            <div className="flex items-center gap-2">
              <Layout size={12} className="text-slate-400" />
              <span>SORT & LAYOUT</span>
            </div>
            {expandedSection === "sort" ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>

          {expandedSection === "sort" && (
            <div className="pb-2 animate-in slide-in-from-top-2 duration-200">
              <MenuItem
                icon={<RotateCcw size={16} />}
                label="Default"
                onClick={() => {
                  onSort(column.id, null);
                }}
                active={!isSorted}
              />
              <MenuItem
                icon={<ChevronUp size={16} />}
                label="Sort Ascending"
                onClick={() => {
                  onSort(column.id, false);
                }}
                active={isSorted && !isSorted.desc}
              />
              <MenuItem
                icon={<ChevronDown size={16} />}
                label="Sort Descending"
                onClick={() => {
                  onSort(column.id, true);
                }}
                active={isSorted && isSorted.desc}
              />
            </div>
          )}
        </div>
      )}

      {/* Pin Section */}
      {column.pinnable !== false && (
        <div className="border-b border-slate-100 overflow-hidden">
          <button
            onClick={() => toggleSection("pin")}
            className="w-full px-3 py-2.5 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider"
          >
            <div className="flex items-center gap-2">
              <Pin size={12} className="text-slate-400" />
              <span>PIN COLUMN</span>
            </div>
            {expandedSection === "pin" ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>

          {expandedSection === "pin" && (
            <div className="pb-2 animate-in slide-in-from-top-2 duration-200">
              <MenuItem
                icon={
                  <Check
                    size={16}
                    className={
                      pinDirection === null ? "opacity-100" : "opacity-0"
                    }
                  />
                }
                label="No Pin"
                onClick={() => onPin(column.id, null)}
                active={pinDirection === null}
              />
              <MenuItem
                label="Pin Left"
                onClick={() => onPin(column.id, "left")}
                active={pinDirection === "left"}
              />
              <MenuItem
                label="Pin Right"
                onClick={() => onPin(column.id, "right")}
                active={pinDirection === "right"}
              />
            </div>
          )}
        </div>
      )}

      {/* Actions (Resizing) */}
      {column.resizable !== false && (
        <div className="py-1">
          <MenuItem
            icon={<Maximize2 size={16} />}
            label="Autosize Column"
            onClick={() => {
              onResize(column.id, 200);
              onClose();
            }}
          />
          <MenuItem
            icon={<RotateCcw size={16} />}
            label="Reset Column"
            onClick={() => {
              onResize(column.id, 150);
              onPin(column.id, null);
              onClose();
            }}
          />
        </div>
      )}
    </div>
  );
};
