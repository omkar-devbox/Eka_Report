import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../lib/theme/ThemeContext";
import { cn } from "../../lib/utils";

interface ThemeToggleProps {
  collapsed?: boolean;
}

export const ThemeToggle = ({ collapsed }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors hover:bg-sidebar-hover text-sidebar-text",
        collapsed && "justify-center"
      )}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <>
          <Moon size={20} className="shrink-0" />
          {!collapsed && <span className="text-[14px] font-medium">Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun size={20} className="shrink-0" />
          {!collapsed && <span className="text-[14px] font-medium">Light Mode</span>}
        </>
      )}
    </button>
  );
};
