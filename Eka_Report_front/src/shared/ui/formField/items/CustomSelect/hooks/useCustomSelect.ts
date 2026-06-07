import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { type CustomSelectProps, type FormOption } from "../../../types/types";
import {
  cacheKey,
  getOptionLabel,
  getOptionValue,
} from "../utils/select-utils";

// ─── Internal Debounce Helper ──────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export const useCustomSelect = (props: CustomSelectProps) => {
  const {
    options: staticOptions = [],
    value,
    onChange,
    disabled,
    name,
    isMulti = false,
    isClearable = false,
    labelKey = "label",
    valueKey = "value",
    loadOptions,
    defaultOptions = false,
    cacheOptions = true,
    allowCreate = false,
    label,
  } = props;

  const getCreatePrefix = useCallback(() => {
    if (typeof label === "string" && label.trim()) {
      const cleanLabel = label.replace(/\s*\*+$/, "").trim();
      return `+Add ${cleanLabel} `;
    }
    return `+Add `;
  }, [label]);

  const isAsync = typeof loadOptions === "function";

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Async / pagination state
  const [asyncOptions, setAsyncOptions] = useState<FormOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const optionCache = useRef<Record<string, FormOption[]>>({});
  const hasMoreCache = useRef<Record<string, boolean>>({});
  const [knownOptions, setKnownOptions] = useState<Map<unknown, FormOption>>(
    new Map(),
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);



  // ── Selected state & Options ──────────────────────────────────────────────
  const baseOptions = isAsync ? asyncOptions : staticOptions;

  const selectedValues = isMulti
    ? Array.isArray(value)
      ? value
      : []
    : [value];

  const hasValue = isMulti
    ? (selectedValues as unknown[]).length > 0
    : selectedValues[0] !== undefined && selectedValues[0] !== "";

  const selectedOptions = isAsync
    ? (selectedValues
        .map(
          (v) =>
            knownOptions.get(v) ??
            asyncOptions.find((o) => String(getOptionValue(o, valueKey)) === String(v)) ??
            staticOptions.find((o) => String(getOptionValue(o, valueKey)) === String(v)) ??
            (v ? { [labelKey]: String(v), [valueKey]: v } : null),
        )
        .filter(Boolean) as FormOption[])
    : baseOptions.filter((o) =>
        selectedValues.map(String).includes(String(getOptionValue(o, valueKey))),
      );


  let effectiveSearchTerm = searchTerm;
  if (!isMulti && hasValue && selectedOptions.length > 0) {
    const opt = selectedOptions[0];
    let label = getOptionLabel(opt, labelKey);
    if (typeof label === "string") {
      const match = label.match(/^(?:\+Add\s+.*?|➕ Create\s+)["']?([^"']+)["']?$/);
      if (match) {
        label = match[1];
      } else if ((opt as any).isNew) {
        label = (opt.value || label) as string;
      }
    }
    if (searchTerm === String(label)) {
      effectiveSearchTerm = "";
    }
  }

  const debouncedSearch = useDebounce(effectiveSearchTerm, 300);

  const rawFilteredOptions = isAsync
    ? baseOptions
    : baseOptions.filter((o) =>
        String(getOptionLabel(o, labelKey))
          .toLowerCase()
          .includes(effectiveSearchTerm.toLowerCase()),
      );

  const normalize = (str: unknown) => {
    if (typeof str !== "string") return String(str || "").toLowerCase().trim();
    return str
      .replace(/\s*\((college|institute|university|board)\)$/i, "")
      .toLowerCase()
      .trim();
  };

  const customSelectedOptions = allowCreate
    ? selectedValues
        .filter((v) => {
          if (v === undefined || v === null || String(v).trim() === "") {
            return false;
          }
          const normVal = normalize(v);
          const isPresent = rawFilteredOptions.some((o) => {
            const optVal = getOptionValue(o, valueKey);
            const optLbl = getOptionLabel(o, labelKey);
            const cleanNm = (o as any).cleanName;
            return (
              optVal === v ||
              normalize(optVal) === normVal ||
              normalize(optLbl) === normVal ||
              (cleanNm && normalize(cleanNm) === normVal)
            );
          });
          return !isPresent;
        })
        .map((v) => {
          const option =
            knownOptions.get(v) ??
            asyncOptions.find((o) => getOptionValue(o, valueKey) === v) ??
            staticOptions.find((o) => getOptionValue(o, valueKey) === v);

          let rawLabel = v;
          if (option) {
            const lbl = getOptionLabel(option, labelKey);
            if (typeof lbl === "string") {
              const match = lbl.match(/^(?:\+Add\s+.*?|➕ Create\s+)["']?([^"']+)["']?$/);
              if (match) {
                rawLabel = match[1];
              } else {
                rawLabel = lbl;
              }
            }
          }

          const labelStr = `${getCreatePrefix()}"${String(rawLabel).trim()}"`;
          return {
            label: labelStr,
            value: v,
            [labelKey]: labelStr,
            [valueKey]: v,
            isNew: true,
          } as FormOption;
        })
    : [];

  const showCreateOption =
    allowCreate &&
    effectiveSearchTerm.trim() &&
    !rawFilteredOptions.some((o) => {
      const optLbl = getOptionLabel(o, labelKey);
      const cleanNm = (o as any).cleanName;
      const normSearch = normalize(effectiveSearchTerm);
      return (
        normalize(optLbl) === normSearch ||
        (cleanNm && normalize(cleanNm) === normSearch)
      );
    });

  const filteredOptions = (() => {
    if (showCreateOption) {
      return [
        ...rawFilteredOptions,
        {
          label: `${getCreatePrefix()}"${effectiveSearchTerm.trim()}"`,
          value: effectiveSearchTerm.trim(),
          [labelKey]: `${getCreatePrefix()}"${effectiveSearchTerm.trim()}"`,
          [valueKey]: effectiveSearchTerm.trim(),
          isNew: true,
        } as FormOption,
      ];
    }
    if (!effectiveSearchTerm.trim()) {
      return [...rawFilteredOptions, ...customSelectedOptions];
    }
    return rawFilteredOptions;
  })();

  // ── Core async loader ────────────────────────────────────────────────────
  const load = useCallback(
    async (input: string, pageNum: number, append = false) => {
      if (!loadOptions) return;

      const key = cacheKey(input, pageNum);

      if (cacheOptions && optionCache.current[key] !== undefined) {
        const cached = optionCache.current[key];
        const cachedHasMore = hasMoreCache.current[key] ?? false;
        setAsyncOptions((prev) => (append ? [...prev, ...cached] : cached));
        setHasMore(cachedHasMore);
        return;
      }

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      if (!append) {
        setPage(1);
        setHasMore(false);
      }

      try {
        const result = await loadOptions(input, pageNum);

        let opts: FormOption[];
        let more = false;

        if (Array.isArray(result)) {
          opts = result;
          more = false;
        } else {
          opts = result.options;
          more = result.hasMore;
        }

        if (cacheOptions) {
          optionCache.current[key] = opts;
          hasMoreCache.current[key] = more;
        }

        setKnownOptions((prev) => {
          const next = new Map(prev);
          opts.forEach((o) => next.set(getOptionValue(o, valueKey), o));
          return next;
        });

        setAsyncOptions((prev) => (append ? [...prev, ...opts] : opts));
        setHasMore(more);
      } catch {
        if (!append) setAsyncOptions([]);
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [loadOptions, cacheOptions, valueKey],
  );

  const lastLoadParams = useRef({ search: "___INITIAL___", page: 0 });

  useEffect(() => {
    if (!isAsync || (!isOpen && !defaultOptions)) return;

    // Avoid redundant loads if parameters haven't changed
    if (
      lastLoadParams.current.search === debouncedSearch &&
      lastLoadParams.current.page === 1
    ) {
      return;
    }

    lastLoadParams.current = { search: debouncedSearch, page: 1 };
    load(debouncedSearch, 1, false);
  }, [debouncedSearch, isAsync, isOpen, defaultOptions, load]);

  // ── Infinite scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAsync || !isOpen || !hasMore || isLoadingMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = page + 1;
          setPage(nextPage);
          load(debouncedSearch, nextPage, true);
        }
      },
      { root: listRef.current, threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isAsync, isOpen, hasMore, isLoadingMore, page, debouncedSearch, load]);

  // ── Populate searchTerm on open for editable Combobox ────────────────────
  useEffect(() => {
    if (isOpen && allowCreate && !isMulti && hasValue && !searchTerm) {
      const opt = selectedOptions[0];
      if (opt) {
        let label = getOptionLabel(opt, labelKey);
        if (typeof label === "string") {
          const match = label.match(/^(?:\+Add\s+.*?|➕ Create\s+)["']?([^"']+)["']?$/);
          if (match) {
            label = match[1];
          } else if ((opt as any).isNew) {
            label = (opt.value || label) as string;
          }
        }
        setSearchTerm(String(label));
      }
    }
  }, [isOpen, allowCreate, isMulti, hasValue, selectedOptions, labelKey, searchTerm]);


  const triggerChange = useCallback(
    (newVal: unknown) => {
      if (onChange) {
        const simulatedEvent = {
          target: { name, value: newVal, type: "select-one" },
          currentTarget: { name, value: newVal, type: "select-one" },
        } as unknown as React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >;
        onChange(simulatedEvent);
      }
    },
    [onChange, name],
  );

  const handleSelectOption = useCallback(
    (opt: FormOption) => {
      const optValue = getOptionValue(opt, valueKey);

      setKnownOptions((prev) => {
        const next = new Map(prev);
        next.set(optValue, opt);
        return next;
      });

      if (isMulti) {
        const currentVals = Array.isArray(value) ? value : [];
        const isSelected = currentVals.map(String).includes(String(optValue));
        const nextVals = isSelected
          ? currentVals.filter((v) => String(v) !== String(optValue))
          : [...currentVals, optValue];
        triggerChange(nextVals);
        setSearchTerm("");
        inputRef.current?.focus();
      } else {
        triggerChange(optValue);
        setIsOpen(false);
        setSearchTerm("");
      }
    },
    [isMulti, value, triggerChange, valueKey],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      triggerChange(isMulti ? [] : "");
      setSearchTerm("");
      setHighlightedIndex(0);
      if (isAsync) {
        setAsyncOptions([]);
        setPage(1);
        setHasMore(false);
        if (defaultOptions) load("", 1, false);
      }
      inputRef.current?.focus();
    },
    [isMulti, isAsync, defaultOptions, load, triggerChange],
  );

  const handleRemoveMulti = useCallback(
    (e: React.MouseEvent, optValue: unknown) => {
      e.stopPropagation();
      const currentVals = Array.isArray(value) ? value : [];
      triggerChange(currentVals.filter((v) => v !== optValue));
    },
    [value, triggerChange],
  );

  // ── Outside click ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (allowCreate && !isMulti && searchTerm.trim()) {
           const normSearch = normalize(searchTerm);
           const exactMatch = filteredOptions.find((o) => {
             const lbl = getOptionLabel(o, labelKey);
             const val = getOptionValue(o, valueKey);
             const cleanNm = (o as any).cleanName;
             return normalize(lbl) === normSearch || normalize(val) === normSearch || (cleanNm && normalize(cleanNm) === normSearch);
           });
           const createOpt = filteredOptions.find((o) => (o as any).isNew);
           if (exactMatch) {
               handleSelectOption(exactMatch);
           } else if (createOpt) {
               handleSelectOption(createOpt);
           }
        }
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, allowCreate, isMulti, searchTerm, filteredOptions, handleSelectOption, labelKey, valueKey]);

  // ── Keyboard navigation ──────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const list = listRef.current;
      const highlighted = list.querySelector(
        `[data-index="${highlightedIndex}"]`,
      ) as HTMLElement;
      if (highlighted) {
        const listRect = list.getBoundingClientRect();
        const itemRect = highlighted.getBoundingClientRect();

        if (itemRect.top < listRect.top) {
          list.scrollTop -= listRect.top - itemRect.top;
        } else if (itemRect.bottom > listRect.bottom) {
          list.scrollTop += itemRect.bottom - listRect.bottom;
        }
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      if (e.key === "Backspace" && !searchTerm) {
        if (isMulti) {
          const currentVals = Array.isArray(value) ? value : [];
          if (currentVals.length > 0)
            triggerChange(currentVals.slice(0, currentVals.length - 1));
        } else if (isClearable && hasValue) {
          triggerChange("");
          setHighlightedIndex(0);
        }
        inputRef.current?.focus();
      }

      if (!isOpen) {
        if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex(
            (prev) => (prev + 1) % (filteredOptions.length || 1),
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex(
            (prev) =>
              (prev - 1 + filteredOptions.length) %
              (filteredOptions.length || 1),
          );
          break;
        case "Home":
          e.preventDefault();
          setHighlightedIndex(0);
          break;
        case "End":
          e.preventDefault();
          setHighlightedIndex(Math.max(0, filteredOptions.length - 1));
          break;
        case "PageUp":
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(0, prev - 5));
          break;
        case "PageDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            Math.min(filteredOptions.length - 1, prev + 5),
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredOptions[highlightedIndex])
            handleSelectOption(filteredOptions[highlightedIndex]);
          break;
        case "Escape":
        case "Tab":
          if (e.key === "Escape") e.preventDefault();
          setIsOpen(false);
          break;
      }
    },
    [
      disabled,
      searchTerm,
      isMulti,
      value,
      isClearable,
      hasValue,
      isOpen,
      filteredOptions,
      highlightedIndex,
      handleSelectOption,
      triggerChange,
    ],
  );

  const handleSearchChange = useCallback(
    (val: string) => {
      setSearchTerm(val);
      setHighlightedIndex(0);
      if (!isOpen) setIsOpen(true);

      if (allowCreate && !isMulti && isClearable && val === "") {
        triggerChange("");
      }
    },
    [isOpen, allowCreate, isMulti, isClearable, triggerChange],
  );

  return {
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    handleSearchChange,
    highlightedIndex,
    setHighlightedIndex,
    isLoading,
    isLoadingMore,
    hasMore,
    filteredOptions,
    selectedOptions,
    selectedValues,
    hasValue,
    isAsync,
    containerRef,
    inputRef,
    listRef,
    sentinelRef,
    handleSelectOption,
    handleClear,
    handleRemoveMulti,
    handleKeyDown,
  };
};
