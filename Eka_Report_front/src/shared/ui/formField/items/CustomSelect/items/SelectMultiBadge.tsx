import { XIcon } from "../../../icons";
import type { SelectMultiBadgeProps } from "../types/CustomSelect.types";
import { getOptionLabel, getOptionValue } from "../utils/select-utils";

export const SelectMultiBadge = ({
  option,
  labelKey,
  valueKey,
  onRemove,
}: SelectMultiBadgeProps) => {
  return (
    <span className="flex items-center gap-1 rounded tracking-wide bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary shrink-0">
      {(() => {
        const label = getOptionLabel(option, labelKey) as any;
        if (
          (option as any).isNew ||
          (typeof label === "string" && label.startsWith("➕ Create "))
        ) {
          return (option.value || label) as any;
        }
        return label as any;
      })()}
      <XIcon
        className="h-3 w-3 cursor-pointer hover:text-primary/70"
        onClick={(e) => onRemove(e, getOptionValue(option, valueKey))}
      />
    </span>
  );
};
