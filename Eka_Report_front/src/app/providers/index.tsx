import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { LazyMotion, domAnimation } from "framer-motion";
import { ToastContainer } from "@/shared/ui/toast";
// import { ThemeProvider } from "@/shared/lib/theme/ThemeContext";

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <BrowserRouter>
      {/* <ThemeProvider> */}
      <LazyMotion features={domAnimation}>
        {children}
        <ToastContainer />
      </LazyMotion>
      {/* </ThemeProvider> */}
    </BrowserRouter>
  );
};
