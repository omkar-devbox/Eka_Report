import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  useFloating,
  autoUpdate,
  offset as offsetMiddleware,
  flip,
  shift,
  useInteractions,
  useClick,
  useDismiss,
  useRole,
} from "@floating-ui/react";
import { toMidnight } from "../../../utils";
import {
  formatForDisplay,
  parseInputString,
  checkIsDateDisabled,
  checkIsMonthDisabled,
  checkIsYearDisabled,
  parseValueToDate,
  formatValueForEvent,
  getDaysInMonth,
} from "../utils/date-helpers";
import type { DatePickerView } from "../types/CustomDatePicker.types";

interface UseDatePickerProps {
  value?: unknown;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  minDate?: string | Date;
  maxDate?: string | Date;
  dateFormat?: string;
  showTime?: boolean;
  initialView?: DatePickerView;
  minView?: DatePickerView;
}

export const useDatePicker = ({
  value,
  onChange,
  name,
  minDate,
  maxDate,
  dateFormat = "dd-mm-yyyy",
  showTime = false,
  initialView = "day",
  minView = "day",
}: UseDatePickerProps) => {
  const isTyping = useRef(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<DatePickerView>(initialView);

  const [focusedDay, setFocusedDay] = useState<number | null>(null);
  const [focusedMonth, setFocusedMonth] = useState<number | null>(null);
  const [focusedYear, setFocusedYear] = useState<number | null>(null);

  // Floating UI
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offsetMiddleware(4),
      flip({ padding: 5 }),
      shift({ padding: 5 }),
    ],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context),
  ]);

  const selectedDate = useMemo(
    () => parseValueToDate(value, showTime),
    [value, showTime],
  );
  const minD = useMemo(() => parseValueToDate(minDate), [minDate]);
  const maxD = useMemo(() => parseValueToDate(maxDate), [maxDate]);

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!isTyping.current) {
      setInputValue(formatForDisplay(selectedDate, dateFormat, showTime));
    }
  }, [selectedDate, dateFormat, showTime]);

  const [viewDate, setViewDate] = useState<Date>(
    () => selectedDate || toMidnight(new Date()),
  );
  const [decadeStart, setDecadeStart] = useState<number>(
    () => Math.floor((selectedDate || new Date()).getFullYear() / 10) * 10,
  );

  const [prevSelectedDate, setPrevSelectedDate] = useState<Date | null>(selectedDate);
  if (selectedDate?.getTime() !== prevSelectedDate?.getTime()) {
    setPrevSelectedDate(selectedDate);
    if (selectedDate) {
      setViewDate(toMidnight(selectedDate));
      setDecadeStart(Math.floor(selectedDate.getFullYear() / 10) * 10);
    }
  }

  const triggerChange = useCallback(
    (newDate: Date | null) => {
      if (!onChangeRef.current) return;

      if (!isTyping.current) {
        setInputValue(formatForDisplay(newDate, dateFormat, showTime));
      }

      const dateStr = formatValueForEvent(newDate, showTime);
      const simulatedEvent = {
        target: { name, value: dateStr, type: "date" },
        currentTarget: { name, value: dateStr, type: "date" },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChangeRef.current(simulatedEvent);
    },
    [name, showTime, dateFormat],
  );

  const isDateDisabled = useCallback(
    (d: Date) => checkIsDateDisabled(d, minD, maxD),
    [minD, maxD],
  );

  const isMonthDisabled = useCallback(
    (year: number, month: number) =>
      checkIsMonthDisabled(year, month, minD, maxD),
    [minD, maxD],
  );

  const isYearDisabled = useCallback(
    (year: number) => checkIsYearDisabled(year, minD, maxD),
    [minD, maxD],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      isTyping.current = false;
      setInputValue("");
      triggerChange(null);
    },
    [triggerChange],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedText = e.clipboardData.getData("text");
      if (!pastedText) return;
      e.preventDefault();

      const parsedD = parseInputString(pastedText, dateFormat, showTime);
      if (parsedD && !isDateDisabled(parsedD)) {
        setInputValue(formatForDisplay(parsedD, dateFormat, showTime));
        triggerChange(parsedD);
      }
    },
    [dateFormat, showTime, isDateDisabled, triggerChange],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      isTyping.current = true;

      if (val === "") {
        setInputValue("");
        triggerChange(null);
        return;
      }

      setInputValue(val);

      const parsedD = parseInputString(val, dateFormat, showTime);
      if (parsedD && !isDateDisabled(parsedD)) {
        triggerChange(parsedD);
      } else {
        triggerChange(null);
      }
    },
    [dateFormat, showTime, isDateDisabled, triggerChange],
  );

  const handleInputBlur = useCallback(() => {
    isTyping.current = false;
    setInputValue(formatForDisplay(selectedDate, dateFormat, showTime));
  }, [selectedDate, dateFormat, showTime]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Enter") {
        setIsOpen(false);
        isTyping.current = false;
        if (selectedDate)
          setInputValue(formatForDisplay(selectedDate, dateFormat, showTime));
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const char = e.key;
      if (
        [
          "Backspace",
          "Delete",
          "ArrowLeft",
          "ArrowRight",
          "Tab",
          "Enter",
          "Escape",
        ].includes(char)
      )
        return;

      if (
        !/[\d-/.]/.test(char) &&
        !(/[a-zA-Z]/.test(char) && dateFormat.includes("MMM")) &&
        !(/[ : ]/.test(char) && showTime)
      ) {
        e.preventDefault();
      }
    },
    [selectedDate, dateFormat, showTime],
  );

  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Tab") {
        setIsOpen(false);
        if (view !== "day") setView("day");
        return;
      }

      const navigateView = (
        next: number,
        setter: (n: number | null) => void,
        selectorPrefix: string,
      ) => {
        e.preventDefault();
        setter(next);
        const btn = refs.floating.current?.querySelector<HTMLElement>(
          `[data-${selectorPrefix}="${next}"]`,
        );
        btn?.focus();
      };

      if (view === "day") {
        const daysInMonth = getDaysInMonth(
          viewDate.getFullYear(),
          viewDate.getMonth(),
        );
        const current =
          focusedDay ??
          selectedDate?.getDate() ??
          toMidnight(new Date()).getDate();

        if (e.key === "ArrowRight")
          navigateView(
            Math.min(current + 1, daysInMonth),
            setFocusedDay,
            "day",
          );
        else if (e.key === "ArrowLeft")
          navigateView(Math.max(current - 1, 1), setFocusedDay, "day");
        else if (e.key === "ArrowDown")
          navigateView(
            Math.min(current + 7, daysInMonth),
            setFocusedDay,
            "day",
          );
        else if (e.key === "ArrowUp")
          navigateView(Math.max(current - 7, 1), setFocusedDay, "day");
        else if (e.key === "PageDown") {
          e.preventDefault();
          setViewDate(
            new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1),
          );
        } else if (e.key === "PageUp") {
          e.preventDefault();
          setViewDate(
            new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1),
          );
        }
      } else if (view === "month") {
        const current = focusedMonth ?? viewDate.getMonth();
        if (e.key === "ArrowRight")
          navigateView(
            Math.min(current + 1, 11),
            setFocusedMonth,
            "month",
          );
        else if (e.key === "ArrowLeft")
          navigateView(
            Math.max(current - 1, 0),
            setFocusedMonth,
            "month",
          );
        else if (e.key === "ArrowDown")
          navigateView(
            Math.min(current + 3, 11),
            setFocusedMonth,
            "month",
          );
        else if (e.key === "ArrowUp")
          navigateView(
            Math.max(current - 3, 0),
            setFocusedMonth,
            "month",
          );
        else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!isMonthDisabled(viewDate.getFullYear(), current)) {
            setViewDate(new Date(viewDate.getFullYear(), current, 1));
            setView("day");
            setFocusedMonth(null);
          }
        }
      } else if (view === "year") {
        const current = focusedYear ?? viewDate.getFullYear();
        if (e.key === "ArrowRight")
          navigateView(
            Math.min(current + 1, decadeStart + 11),
            setFocusedYear,
            "year",
          );
        else if (e.key === "ArrowLeft")
          navigateView(
            Math.max(current - 1, decadeStart),
            setFocusedYear,
            "year",
          );
        else if (e.key === "ArrowDown")
          navigateView(
            Math.min(current + 3, decadeStart + 11),
            setFocusedYear,
            "year",
          );
        else if (e.key === "ArrowUp")
          navigateView(
            Math.max(current - 3, decadeStart),
            setFocusedYear,
            "year",
          );
        else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!isYearDisabled(current)) {
            setViewDate(new Date(current, viewDate.getMonth(), 1));
            setDecadeStart(Math.floor(current / 10) * 10);
            setView("month");
            setFocusedYear(null);
          }
        }
      }
    },
    [
      view,
      viewDate,
      focusedDay,
      focusedMonth,
      focusedYear,
      selectedDate,
      decadeStart,
      isMonthDisabled,
      isYearDisabled,
    ],
  );

  const handlePrev = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      if (view === "day")
        setViewDate(
          new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1),
        );
      else if (view === "month")
        setViewDate(
          new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1),
        );
      else if (view === "year") setDecadeStart((s) => s - 10);
    },
    [view, viewDate],
  );

  const handleNext = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      if (view === "day")
        setViewDate(
          new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1),
        );
      else if (view === "month")
        setViewDate(
          new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1),
        );
      else if (view === "year") setDecadeStart((s) => s + 10);
    },
    [view, viewDate],
  );

  const selectDay = useCallback(
    (d: number, e?: React.MouseEvent) => {
      e?.stopPropagation();
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);

      // Preserve time if showTime is enabled and we have a selectedDate
      if (showTime && selectedDate) {
        date.setHours(selectedDate.getHours());
        date.setMinutes(selectedDate.getMinutes());
        date.setSeconds(selectedDate.getSeconds());
      }

      if (isDateDisabled(date)) return;
      triggerChange(date);

      if (!showTime) {
        setIsOpen(false);
        setView("day");
      }
    },
    [viewDate, isDateDisabled, triggerChange, showTime, selectedDate],
  );

  const handleApply = useCallback(() => {
    setIsOpen(false);
    setView("day");
  }, []);

  const selectMonth = useCallback(
    (month: number, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (isMonthDisabled(viewDate.getFullYear(), month)) return;
      const newDate = new Date(viewDate.getFullYear(), month, 1);
      setViewDate(newDate);
      
      if (minView === "month") {
        triggerChange(newDate);
        setIsOpen(false);
      } else {
        setView("day");
      }
      setFocusedMonth(null);
    },
    [viewDate, isMonthDisabled, minView, triggerChange],
  );

  const selectYear = useCallback(
    (year: number, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (isYearDisabled(year)) return;
      const newDate = new Date(year, viewDate.getMonth(), 1);
      setViewDate(newDate);
      setDecadeStart(Math.floor(year / 10) * 10);
      
      if (minView === "year") {
        triggerChange(newDate);
        setIsOpen(false);
      } else {
        setView("month");
      }
      setFocusedYear(null);
    },
    [viewDate, isYearDisabled, minView, triggerChange],
  );

  const handleToday = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const t = showTime ? new Date() : toMidnight(new Date());
      if (!isDateDisabled(t)) {
        triggerChange(t);
        setIsOpen(false);
        setView("day");
      } else {
        setViewDate(t);
        setView("day");
      }
    },
    [showTime, isDateDisabled, triggerChange],
  );

  const todayDate = useMemo(() => toMidnight(new Date()), []);

  const inputProps = useMemo(
    () => ({
      inputValue,
      setInputValue,
      isOpen,
      handleInputChange,
      handleInputBlur,
      handleInputKeyDown,
      handlePaste,
      handleClear,
      getReferenceProps,
    }),
    [
      inputValue,
      isOpen,
      handleInputChange,
      handleInputBlur,
      handleInputKeyDown,
      handlePaste,
      handleClear,
      getReferenceProps,
    ],
  );

  const popoverProps = useMemo(
    () => ({
      view,
      setView,
      viewDate,
      selectedDate,
      todayDate,
      decadeStart,
      focusedDay,
      setFocusedDay,
      focusedMonth,
      setFocusedMonth,
      focusedYear,
      setFocusedYear,
      isDateDisabled,
      isMonthDisabled,
      isYearDisabled,
      handlePrev,
      handleNext,
      selectDay,
      selectMonth,
      selectYear,
      handleToday,
      handleGridKeyDown,
      triggerChange,
      handleApply,
      getFloatingProps,
    }),
    [
      view,
      viewDate,
      selectedDate,
      todayDate,
      decadeStart,
      focusedDay,
      focusedMonth,
      focusedYear,
      isDateDisabled,
      isMonthDisabled,
      isYearDisabled,
      handlePrev,
      handleNext,
      selectDay,
      selectMonth,
      selectYear,
      handleToday,
      handleGridKeyDown,
      triggerChange,
      handleApply,
      getFloatingProps,
    ],
  );

  return {
    inputProps,
    popoverProps,
    isOpen,
    setIsOpen,
    setView,
    refs,
    floatingStyles,
    context,
  };
};
