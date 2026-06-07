import {
  MONTH_NAMES_SHORT,
  MONTH_NAMES_LONG,
  toMidnight,
} from "../../../utils";

export const parseValueToDate = (
  val: unknown,
  showTime = false,
): Date | null => {
  if (!val) return null;
  const d = new Date(val as string | number | Date);
  return isNaN(d.getTime()) ? null : showTime ? d : toMidnight(d);
};

export const formatValueForEvent = (
  date: Date | null,
  showTime: boolean,
): string => {
  if (!date) return "";
  if (showTime) return date.toISOString();

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

export const getFirstDayOfMonth = (year: number, month: number): number =>
  new Date(year, month, 1).getDay();

export const getDecadeYears = (decadeStart: number): number[] =>
  Array.from({ length: 12 }, (_, i) => decadeStart - 1 + i);

export const formatForDisplay = (
  date: Date | null,
  dateFormat: string,
  showTime: boolean,
): string => {
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const MMM = MONTH_NAMES_SHORT[date.getMonth()];
  const y = String(date.getFullYear());
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");

  let res = dateFormat
    .replace("dd", d)
    .replace("mm", m)
    .replace("MMM", MMM)
    .replace("yyyy", y);

  if (showTime) res += ` ${hh}:${mm}`;
  return res;
};

export const parseInputString = (
  text: string,
  dateFormat: string,
  showTime: boolean,
): Date | null => {
  if (!text) return null;
  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();

  // Handle semantic dates
  if (lowerText === "today" || lowerText === "now") {
    const d = new Date();
    return showTime ? d : toMidnight(d);
  }
  if (lowerText === "tomorrow") {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return showTime ? d : toMidnight(d);
  }
  if (lowerText === "yesterday") {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return showTime ? d : toMidnight(d);
  }

  let parsedD: Date | null = null;
  const cleanVal = cleanText.replace(/[/.]/g, "-");
  const parts = cleanVal.split(/[- :]/).filter(Boolean);

  let d: number | undefined,
    m: number | undefined,
    y: number | undefined,
    hh = 0,
    mm = 0;

  // Specific format parsing
  if (dateFormat === "dd-mm-yyyy" && parts.length >= 3) {
    [d, m, y] = parts.map(Number);
  } else if (dateFormat === "mm-dd-yyyy" && parts.length >= 3) {
    [m, d, y] = parts.map(Number);
  } else if (dateFormat === "yyyy-mm-dd" && parts.length >= 3) {
    [y, m, d] = parts.map(Number);
  } else if (dateFormat === "yyyy-dd-mm" && parts.length >= 3) {
    [y, d, m] = parts.map(Number);
  } else if (dateFormat === "dd-MMM-yyyy" && parts.length >= 3) {
    d = Number(parts[0]);
    const monthStr = parts[1]?.toLowerCase();
    m =
      MONTH_NAMES_SHORT.findIndex((name) => name.toLowerCase() === monthStr) +
      1;
    if (m === 0) {
      m =
        MONTH_NAMES_LONG.findIndex((name) => name.toLowerCase() === monthStr) +
        1;
    }
    y = Number(parts[2]);
  } else if (dateFormat === "mm-yyyy" && parts.length >= 2) {
    m = Number(parts[0]);
    y = Number(parts[1]);
    d = 1;
  } else if (dateFormat === "yyyy-mm" && parts.length >= 2) {
    y = Number(parts[0]);
    m = Number(parts[1]);
    d = 1;
  } else if (dateFormat === "yyyy" && parts.length >= 1) {
    y = Number(parts[0]);
    m = 1;
    d = 1;
  }

  // Time parsing if requested
  if (showTime && parts.length >= 5) {
    hh = Number(parts[parts.length - 2]);
    mm = Number(parts[parts.length - 1]);
  }

  // Validate numeric parts
  if (
    y !== undefined &&
    m !== undefined &&
    d !== undefined &&
    !isNaN(y) &&
    !isNaN(m) &&
    !isNaN(d) &&
    y > 100 &&
    m >= 1 &&
    m <= 12 &&
    d >= 1 &&
    d <= 31
  ) {
    // Handle 2-digit years
    const finalY = y < 100 ? (y > 50 ? 1900 + y : 2000 + y) : y;
    const attemptD = new Date(finalY, m - 1, d, hh, mm);
    if (!isNaN(attemptD.getTime())) {
      parsedD = attemptD;
    }
  }

  // Fallback 1: Pure numeric strings (e.g., 01122024)
  if (!parsedD && /^\d{6,8}$/.test(cleanText)) {
    if (dateFormat === "dd-mm-yyyy") {
      d = parseInt(cleanText.substring(0, 2));
      m = parseInt(cleanText.substring(2, 4));
      y = parseInt(cleanText.substring(4));
    } else if (dateFormat === "mm-dd-yyyy") {
      m = parseInt(cleanText.substring(0, 2));
      d = parseInt(cleanText.substring(2, 4));
      y = parseInt(cleanText.substring(4));
    } else if (dateFormat === "yyyy-mm-dd") {
      y = parseInt(cleanText.substring(0, 4));
      m = parseInt(cleanText.substring(4, 6));
      d = parseInt(cleanText.substring(6, 8));
    }

    if (y && m && d && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const finalY = y < 100 ? (y > 50 ? 1900 + y : 2000 + y) : y;
      const attemptD = new Date(finalY, m - 1, d);
      if (!isNaN(attemptD.getTime())) parsedD = attemptD;
    }
  }

  // Fallback 2: Native JS Date parsing (very flexible)
  if (!parsedD) {
    const fallbackDate = new Date(cleanText);
    if (!isNaN(fallbackDate.getTime())) {
      parsedD = fallbackDate;
    }
  }

  // Fallback 3: Timestamp parsing
  if (!parsedD && /^\d{10,13}$/.test(cleanText)) {
    const ts = parseInt(cleanText);
    const attemptD = new Date(ts.toString().length === 10 ? ts * 1000 : ts);
    if (!isNaN(attemptD.getTime())) {
      parsedD = attemptD;
    }
  }

  if (parsedD && !isNaN(parsedD.getTime())) {
    return showTime ? parsedD : toMidnight(parsedD);
  }
  return null;
};

export const checkIsDateDisabled = (
  date: Date,
  minD: Date | null,
  maxD: Date | null,
): boolean => {
  const md = toMidnight(date);
  if (minD && md < minD) return true;
  if (maxD && md > maxD) return true;
  return false;
};

export const checkIsMonthDisabled = (
  year: number,
  month: number,
  minD: Date | null,
  maxD: Date | null,
): boolean => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  if (maxD && firstDay > maxD) return true;
  if (minD && lastDay < minD) return true;
  return false;
};

export const checkIsYearDisabled = (
  year: number,
  minD: Date | null,
  maxD: Date | null,
): boolean => {
  if (maxD && year > maxD.getFullYear()) return true;
  if (minD && year < minD.getFullYear()) return true;
  return false;
};
