import React, { useCallback } from "react";
import { cn, MONTH_NAMES_SHORT } from "../../../utils";
import type { MonthGridProps } from "../types/CustomDatePicker.types";
import { datePickerStyles as s } from "../styles/style";

export const MonthGridView = React.memo(
  ({
    viewDate,
    selectedDate,
    today,
    focusedMonth,
    onSelectMonth,
    onFocusMonth,
    isMonthDisabled,
  }: MonthGridProps) => {
    const handleSelect = useCallback(
      (idx: number) => (e: React.MouseEvent) => onSelectMonth(idx, e),
      [onSelectMonth],
    );

    const handleFocus = useCallback(
      (idx: number | null) => () => onFocusMonth(idx),
      [onFocusMonth],
    );

    return (
      <div className={s.monthYearGrid}>
        {MONTH_NAMES_SHORT.map((m, idx) => {
          const isSelected =
            selectedDate?.getMonth() === idx &&
            selectedDate?.getFullYear() === viewDate.getFullYear();
          const isDisabled = isMonthDisabled(viewDate.getFullYear(), idx);
          const isFocused = focusedMonth === idx;

          return (
            <div
              key={m}
              role="button"
              tabIndex={isDisabled ? -1 : 0}
              aria-label={`${m} ${viewDate.getFullYear()}`}
              data-month={idx}
              onFocus={handleFocus(idx)}
              onBlur={handleFocus(null)}
              onClick={handleSelect(idx)}
              className={cn(
                s.cellBase,
                s.monthYearCell,
                isDisabled
                  ? s.disabled
                  : isSelected
                    ? s.selected
                    : idx === today.getMonth() &&
                        viewDate.getFullYear() === today.getFullYear()
                      ? s.today
                      : isFocused
                        ? s.focused
                        : "text-text hover:bg-neutral-surface",
              )}
            >
              {m}
            </div>
          );
        })}
      </div>
    );
  },
);
