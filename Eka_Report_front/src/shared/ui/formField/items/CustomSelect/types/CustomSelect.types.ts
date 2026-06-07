import type React from "react";
import type { FormOption } from "../../../types/types";

export interface SelectSpinnerProps {
  small?: boolean;
}

export interface SelectMultiBadgeProps {
  option: FormOption;
  labelKey: string;
  valueKey: string;
  onRemove: (e: React.MouseEvent, value: unknown) => void;
}

export interface SelectOptionProps {
  option: FormOption;
  index: number;
  labelKey: string;
  valueKey: string;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: (option: FormOption) => void;
  onHighlight: (index: number) => void;
}

export interface SelectMenuProps {
  isOpen: boolean;
  disabled?: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  filteredOptions: FormOption[];
  selectedValues: unknown[];
  highlightedIndex: number;
  loadingMessage?: string;
  noOptionsMessage?: string;
  labelKey: string;
  valueKey: string;
  onSelect: (option: FormOption) => void;
  onHighlight: (index: number) => void;
  listRef: React.RefObject<HTMLDivElement | null>;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

export interface SelectControlProps {
  id?: string;
  disabled?: boolean;
  isMulti?: boolean;
  isSearchable?: boolean;
  isAsync?: boolean;
  isClearable?: boolean;
  placeholder?: string;
  searchTerm: string;
  selectedOptions: FormOption[];
  hasValue: boolean;
  isLoading: boolean;
  isOpen: boolean;
  labelKey: string;
  valueKey: string;
  className?: string;
  ariaInvalid?: boolean | string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSearchChange: (value: string) => void;
  onToggle: () => void;
  onClear: (e: React.MouseEvent) => void;
  onRemoveMulti: (e: React.MouseEvent, value: unknown) => void;
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
}
