import React from "react";
import type { FormOption } from "../../../types/types";

/**
 * Common utilities for CustomSelect
 */

export const cacheKey = (input: string, page: number) => `${input}__page${page}`;

export const getOptionLabel = (opt: FormOption, labelKey: string = "label"): React.ReactNode => {
  if (typeof opt === "object" && opt !== null) {
    return (opt[labelKey] as React.ReactNode);
  }
  return String(opt);
};

export const getOptionValue = (opt: FormOption, valueKey: string = "value"): unknown => {
  if (typeof opt === "object" && opt !== null) {
    return opt[valueKey];
  }
  return opt;
};
