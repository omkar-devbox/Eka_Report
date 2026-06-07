import { type FC, type ReactNode, useMemo } from "react";
import { m } from "framer-motion";
import { ChevronRight, Home, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

interface Breadcrumb {
  label: string;
  path?: string;
  onClick?: () => void;
}

interface PageProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  isLoading?: boolean;
  search?: {
    placeholder?: string;
    onSearch: (value: string) => void;
  };
}

export const Page: FC<PageProps> = ({
  title,
  subtitle,
  breadcrumbs = [], // default empty array
  actions,
  children,
  className,
  containerClassName,
  isLoading = false,
  search,
}) => {
  const hasBreadcrumbs = breadcrumbs.length > 0; // check breadcrumb existence

  const renderedBreadcrumbs = useMemo(
    () =>
      breadcrumbs.map((bc, index) => (
        <div key={`${bc.label}-${index}`} className="flex items-center gap-2">
          <ChevronRight size={12} className="opacity-40" /> {/* separator */}
          {bc.path ? (
            <Link to={bc.path} className="hover:text-primary transition-colors">
              {bc.label}
            </Link>
          ) : bc.onClick ? (
            <button
              onClick={bc.onClick}
              className="hover:text-primary transition-colors text-text-primary font-semibold focus:outline-none"
            >
              {bc.label}
            </button>
          ) : (
            <span className="text-text-primary font-semibold">{bc.label}</span>
          )}
        </div>
      )),
    [breadcrumbs],
  ); // memoize breadcrumb rendering

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          {hasBreadcrumbs && (
            <nav className="flex items-center gap-2 text-xs font-medium text-text-secondary/60">
              <Link
                to="/"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <Home size={14} /> {/* home icon */}
              </Link>
              {renderedBreadcrumbs}
            </nav>
          )}

          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
              {title}
            </h1>

            {subtitle && (
              <p className="text-base text-text-secondary max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {search && (
            <div className="relative group min-w-[280px]">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder={search.placeholder || "Search..."}
                className="w-full pl-10 pr-4 py-2 bg-surface-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                onChange={(e) => search.onSearch(e.target.value)}
              />
            </div>
          )}
          {actions}
        </div>
      </div>

      {/* animated content container */}
      <m.div
        initial={{ opacity: 0, y: 10 }} // entry animation
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }} // smoother animation
        className={cn("min-h-[400px]", containerClassName)}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />{" "}
            {/* loader */}
          </div>
        ) : (
          children
        )}
      </m.div>
    </div>
  );
};
