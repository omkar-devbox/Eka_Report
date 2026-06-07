import React, { useEffect, useRef, useCallback } from "react";
import type { TimePickerProps } from "../types/CustomDatePicker.types";
import { cn } from "../../../utils";
import { datePickerStyles as s } from "../styles/style";

export const TimePicker = React.memo(
  ({ selectedDate, onChange }: TimePickerProps) => {
    const date = React.useMemo(() => selectedDate || new Date(), [selectedDate]);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const hoursRef = useRef<HTMLDivElement>(null);
    const minutesRef = useRef<HTMLDivElement>(null);
    const activeScrollTimeouts = useRef<{ hours?: NodeJS.Timeout; minutes?: NodeJS.Timeout }>({});

    const scrollToValue = useCallback(
      (ref: React.RefObject<HTMLDivElement | null>, value: number) => {
        if (ref.current) {
          const container = ref.current;
          const item = container.children[value] as HTMLElement;
          if (item) {
            const targetTop =
              item.offsetTop -
              container.clientHeight / 2 +
              item.clientHeight / 2;
            if (Math.abs(container.scrollTop - targetTop) > 2) {
              container.scrollTo({
                top: targetTop,
                behavior: "smooth",
              });
            }
          }
        }
      },
      [],
    );

    const handleHourClick = useCallback(
      (h: number) => () => {
        const newD = new Date(date);
        newD.setHours(h);
        onChange(newD);
      },
      [date, onChange],
    );

    const handleMinuteClick = useCallback(
      (m: number) => () => {
        const newD = new Date(date);
        newD.setMinutes(m);
        onChange(newD);
      },
      [date, onChange],
    );

    const handleScroll = useCallback(
      (type: "hours" | "minutes") => (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        if (activeScrollTimeouts.current[type]) {
          clearTimeout(activeScrollTimeouts.current[type]);
        }
        activeScrollTimeouts.current[type] = setTimeout(() => {
          if (!container) return;
          const scrollTop = container.scrollTop;
          let closestIndex = 0;
          let minDiff = Infinity;
          Array.from(container.children).forEach((child, index) => {
            const item = child as HTMLElement;
            const targetTop =
              item.offsetTop -
              container.clientHeight / 2 +
              item.clientHeight / 2;
            const diff = Math.abs(scrollTop - targetTop);
            if (diff < minDiff) {
              minDiff = diff;
              closestIndex = index;
            }
          });
          const newD = new Date(date);
          if (type === "hours") {
            if (newD.getHours() !== closestIndex) {
              newD.setHours(closestIndex);
              onChange(newD);
            }
          } else {
            if (newD.getMinutes() !== closestIndex) {
              newD.setMinutes(closestIndex);
              onChange(newD);
            }
          }
        }, 150);
      },
      [date, onChange],
    );

    useEffect(() => {
      const timeout = setTimeout(() => {
        scrollToValue(hoursRef, hours);
        scrollToValue(minutesRef, minutes);
      }, 50);
      return () => clearTimeout(timeout);
    }, [hours, minutes, scrollToValue]);

    useEffect(() => {
      return () => {
        if (activeScrollTimeouts.current.hours) clearTimeout(activeScrollTimeouts.current.hours);
        if (activeScrollTimeouts.current.minutes) clearTimeout(activeScrollTimeouts.current.minutes);
      };
    }, []);

    return (
      <div className={s.timeContainer}>
        <div className={s.timeHighlight} />

        <div className="flex w-full items-stretch justify-center h-full">
          {/* Hours */}
          <div
            ref={hoursRef}
            onScroll={handleScroll("hours")}
            className={s.timeColumn}
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={`h-${i}`}
                className="snap-center h-8 flex items-center justify-center"
              >
                <button
                  type="button"
                  onClick={handleHourClick(i)}
                  className={cn(
                    s.timeBtn,
                    hours === i
                      ? s.timeBtnSelected
                      : "text-text-muted hover:text-text",
                  )}
                >
                  {String(i).padStart(2, "0")}
                </button>
              </div>
            ))}
          </div>

          <div className={s.timeDivider}>:</div>

          {/* Minutes */}
          <div
            ref={minutesRef}
            onScroll={handleScroll("minutes")}
            className={s.timeColumn}
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={`m-${i}`}
                className="snap-center h-8 flex items-center justify-center"
              >
                <button
                  type="button"
                  onClick={handleMinuteClick(i)}
                  className={cn(
                    s.timeBtn,
                    minutes === i
                      ? s.timeBtnSelected
                      : "text-text-muted hover:text-text",
                  )}
                >
                  {String(i).padStart(2, "0")}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);
