import React, { useMemo, useCallback } from "react";
import { cn } from "../../../utils";
import { getDecadeYears } from "../utils/date-helpers";
import type { YearGridProps } from "../types/CustomDatePicker.types";
import { datePickerStyles as s } from "../styles/style";

export const YearGridView = React.memo(
  ({
    decadeStart,
    viewDate,
    today,
    focusedYear,
    onSelectYear,
    onFocusYear,
    isYearDisabled,
  }: YearGridProps) => {
    const handleSelect = useCallback(
      (y: number) => (e: React.MouseEvent) => onSelectYear(y, e),
      [onSelectYear],
    );

    const handleFocus = useCallback(
      (y: number | null) => () => onFocusYear(y),
      [onFocusYear],
    );

    const years = useMemo(() => {
      const yearArray = getDecadeYears(decadeStart);
      return yearArray.map((y) => {
        const isCurrentYear = y === viewDate.getFullYear();
        const isDisabled = isYearDisabled(y);
        const isFocused = focusedYear === y;

        return (
          <div
            key={y}
            role="button"
            tabIndex={isDisabled ? -1 : 0}
            aria-label={`Year ${y}`}
            data-year={y}
            onFocus={handleFocus(y)}
            onBlur={handleFocus(null)}
            onClick={handleSelect(y)}
            className={cn(
              s.cellBase,
              s.monthYearCell,
              isDisabled
                ? s.disabled
                : isCurrentYear
                  ? s.selected
                  : y === today.getFullYear()
                    ? s.today
                    : isFocused
                      ? s.focused
                      : "text-text hover:bg-neutral-surface",
            )}
          >
            {y}
          </div>
        );
      });
    }, [
      decadeStart,
      viewDate,
      today,
      focusedYear,
      handleFocus,
      handleSelect,
      isYearDisabled,
    ]);

    return <div className={s.monthYearGrid}>{years}</div>;
  },
);
