import { type FC, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Page } from "./Page";
import { SIDEBAR_MENU } from "@/app/fallback/menu/menuItems";

// flatten menu into path -> label map
const buildPathMap = () => {
  const map = new Map<string, string>(); // store path-label pairs

  const traverse = (items: any[]) => {
    for (const item of items) {
      if (item.path) map.set(item.path, item.label); // map current item
      if (item.children) traverse(item.children); // recurse children
    }
  };

  for (const section of SIDEBAR_MENU) {
    traverse(section.items); // process each section
  }

  return map;
};

// build once (static menu assumed)
const PATH_LABEL_MAP = buildPathMap();

export const GenericPage: FC = () => {
  const { pathname } = useLocation(); // current route path

  const label = useMemo(
    () => PATH_LABEL_MAP.get(pathname) || "Page", // O(1) lookup
    [pathname],
  );

  return (
    <Page
      title={label}
      subtitle={`Welcome to the ${label} page. This is a placeholder for future content.`} // dynamic subtitle
      breadcrumbs={[{ label }]} // breadcrumb config
    >
      <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-secondary/50 rounded-3xl border border-dashed border-border">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
          <span className="text-2xl font-bold">{label.charAt(0)}</span>{" "}
          {/* first letter avatar */}
        </div>

        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {label} Content
        </h2>

        <p className="text-text-secondary max-w-md">
          This page is currently under development. Please check back later for
          updates and new features.
        </p>
      </div>
    </Page>
  );
};

export default GenericPage;
