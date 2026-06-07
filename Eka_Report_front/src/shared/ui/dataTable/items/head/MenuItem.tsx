import React from "react";
import { dataTableStyles as styles } from "../../styles/dataTable.styles";

interface MenuItemProps {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

export const MenuItem = ({ icon, label, onClick, active }: MenuItemProps) => {
  return (
    <div
      onClick={onClick}
      className={styles.menuItem(active)}
    >
      <div className="w-4 flex items-center">
        {icon}
      </div>
      <span className="flex-1">{label}</span>
    </div>
  );
};
