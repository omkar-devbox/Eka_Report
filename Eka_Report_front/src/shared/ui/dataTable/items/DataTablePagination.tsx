import { memo, useState, useEffect, type FC } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import type { TablePagination } from "../types/dataTable.types";
import { dataTableStyles as styles } from "../styles/dataTable.styles";

interface DataTablePaginationProps {
  pagination: TablePagination;
  totalCount: number;
  onPageChange: (index: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const DataTablePagination: FC<DataTablePaginationProps> = memo(
  ({ pagination, totalCount, onPageChange, onPageSizeChange }) => {
    const { pageIndex, pageSize } = pagination;
    const pageCount = Math.ceil(totalCount / pageSize);
    const start = pageIndex * pageSize + 1;
    const end = Math.min((pageIndex + 1) * pageSize, totalCount);

    const [localPage, setLocalPage] = useState<string>((pageIndex + 1).toString());

    useEffect(() => {
      setLocalPage((pageIndex + 1).toString());
    }, [pageIndex]);

    const handlePageJump = (val: string) => {
      if (val === "") {
        setLocalPage((pageIndex + 1).toString());
        return;
      }
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        const page = Math.max(1, Math.min(num, pageCount));
        onPageChange(page - 1);
        setLocalPage(page.toString());
      } else {
        setLocalPage((pageIndex + 1).toString());
      }
    };

    return (
      <div className={styles.pagination}>
        <div className={styles.paginationGroup}>
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className={styles.paginationSelect}
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div>
            Showing{" "}
            <span className={styles.paginationText}>
              {totalCount > 0 ? start : 0}
            </span>{" "}
            to <span className={styles.paginationText}>{end}</span> of{" "}
            <span className={styles.paginationText}>{totalCount}</span>
          </div>

          <div className="flex items-center gap-2 border-l border-dt-border-color pl-6 ml-1">
            <span>Go to:</span>
            <div className={styles.paginationInputContainer}>
              <input
                type="number"
                min={1}
                max={pageCount}
                value={localPage}
                onChange={(e) => setLocalPage(e.target.value)}
                onBlur={() => handlePageJump(localPage)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePageJump(localPage);
                  }
                }}
                className={styles.paginationInput}
              />
              {localPage !== "" && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalPage("");
                    // Optional: keep focus or jump to page 1?
                    // Typically clearing just lets user type fresh.
                  }}
                  className={styles.paginationInputClear}
                  title="Clear"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.paginationActions}>
          <PaginationButton
            onClick={() => onPageChange(0)}
            disabled={pageIndex === 0}
            icon={<ChevronsLeft size={18} />}
          />
          <PaginationButton
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
            icon={<ChevronLeft size={18} />}
          />
          <div className="mx-2 font-medium">
            Page {pageIndex + 1} of {pageCount || 1}
          </div>
          <PaginationButton
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= pageCount - 1}
            icon={<ChevronRight size={18} />}
          />
          <PaginationButton
            onClick={() => onPageChange(pageCount - 1)}
            disabled={pageIndex >= pageCount - 1}
            icon={<ChevronsRight size={18} />}
          />
        </div>
      </div>
    );
  },
);

DataTablePagination.displayName = "DataTablePagination";

const PaginationButton = memo(({ onClick, disabled, icon }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={styles.paginationButton(disabled)}
  >
    {icon}
  </button>
));

(PaginationButton as any).displayName = "PaginationButton";
