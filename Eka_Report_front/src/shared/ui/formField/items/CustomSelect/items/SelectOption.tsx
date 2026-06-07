import { cn } from "../../../utils";
import { CheckIcon } from "../../../icons";
import type { SelectOptionProps } from "../types/CustomSelect.types";
import { getOptionLabel } from "../utils/select-utils";
import { selectStyles } from "../styles/style";

export const SelectOption = ({
  option,
  index,
  labelKey,
  isSelected,
  isHighlighted,
  onSelect,
  onHighlight,
}: SelectOptionProps) => {
  return (
    <div
      onMouseEnter={() => onHighlight(index)}
      data-index={index}
      className={cn(
        selectStyles.option,
        isSelected
          ? selectStyles.optionSelected
          : isHighlighted
            ? selectStyles.optionHighlighted
            : selectStyles.optionDefault,
        (option as any).isNew && "text-brand-primary font-medium",
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(option);
      }}
    >
      <span>{getOptionLabel(option, labelKey)}</span>
      {isSelected && <CheckIcon className="h-4 w-4" />}
    </div>
  );
};
