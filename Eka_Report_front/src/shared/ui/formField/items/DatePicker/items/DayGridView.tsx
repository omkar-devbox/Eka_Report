import React, { useMemo, useCallback } from "react";
import { cn, DAY_NAMES } from "../../../utils";
import { getDaysInMonth, getFirstDayOfMonth } from "../utils/date-helpers";
import type { DayGridProps } from "../types/CustomDatePicker.types";
import { datePickerStyles as s } from "../styles/style";

export const DayGridView = React.memo(
  ({
    viewDate,
    selectedDate,
    today,
    focusedDay,
    onSelectDay,
    onFocusDay,
    isDateDisabled,
  }: DayGridProps) => {
    const daysInMonth = useMemo(
      () => getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth()),
      [viewDate],
    );
    const firstDayOfMonth = useMemo(
      () => getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()),
      [viewDate],
    );

    const handleSelect = useCallback(
      (day: number) => (e: React.MouseEvent) => onSelectDay(day, e),
      [onSelectDay],
    );

    const handleKeyDown = useCallback(
      (day: number) => (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectDay(day);
        }
      },
      [onSelectDay],
    );

    const handleFocus = useCallback(
      (day: number | null) => () => onFocusDay(day),
      [onFocusDay],
    );

    const cells = useMemo(() => {
      const items: React.ReactNode[] = [];
      for (let i = 0; i < firstDayOfMonth; i++) {
        items.push(<div key={`e-${i}`} />);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
        const isSelected =
          !!selectedDate && date.toDateString() === selectedDate.toDateString();
        const isToday = date.toDateString() === today.toDateString();
        const isDisabled = isDateDisabled(date);
        const isFocused = focusedDay === d;

        items.push(
          <div
            key={d}
            role="button"
            tabIndex={isDisabled ? -1 : 0}
            aria-pressed={isSelected}
            aria-disabled={isDisabled}
            aria-label={date.toDateString()}
            data-day={d}
            onClick={handleSelect(d)}
            onKeyDown={handleKeyDown(d)}
            onFocus={handleFocus(d)}
            onBlur={handleFocus(null)}
            className={cn(
              s.cellBase,
              s.dayCell,
              isDisabled
                ? s.disabled
                : isSelected
                  ? s.selected
                  : isToday
                    ? s.today
                    : isFocused
                      ? s.focused
                      : "text-text hover:bg-neutral-surface",
            )}
          >
            {d}
          </div>,
        );
      }
      return items;
    }, [
      viewDate,
      selectedDate,
      today,
      focusedDay,
      daysInMonth,
      firstDayOfMonth,
      handleSelect,
      handleKeyDown,
      handleFocus,
      isDateDisabled,
    ]);

    return (
      <>
        <div className={s.dayNamesGrid}>
          {DAY_NAMES.map((d) => (
            <div key={d} className={s.dayName}>
              {d}
            </div>
          ))}
        </div>
        <div className={s.dayGrid}>{cells}</div>
      </>
    );
  },
);
