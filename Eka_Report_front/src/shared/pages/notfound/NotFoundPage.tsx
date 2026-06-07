import { type FC } from "react";
import { Link } from "react-router-dom";
import { MoveLeft, Home } from "lucide-react";
import { Button } from "@/shared/ui/button/Button";

export const NotFoundPage: FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-neutral-bg overflow-hidden">
      {/* background glow */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-blue-500/5 blur-[100px]" />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center justify-center p-6 text-center">
        {/* big 404 */}
        <div className="relative mb-12">
          <h1 className="select-none text-[180px] font-black leading-none tracking-tighter text-primary/5 md:text-[240px]">
            404
          </h1>

          {/* floating card */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="transform rounded-3xl border border-sidebar-border bg-white/90 p-8 shadow-2xl backdrop-blur-md transition-transform duration-500 hover:rotate-0 -rotate-3">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Home size={40} strokeWidth={1.5} /> {/* icon */}
              </div>

              <h2 className="mb-2 text-3xl font-bold text-text-primary">
                Lost in Space?
              </h2>

              <p className="italic font-medium text-text-secondary">
                Error 404: Page Not Found
              </p>
            </div>
          </div>
        </div>

        {/* description */}
        <div className="space-y-8">
          <p className="mx-auto max-w-md text-xl text-text-secondary">
            It seems you've ventured into uncharted territory. Don’t worry, even
            the best explorers get lost sometimes.
          </p>

          {/* actions */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => window.history.back()} // go back
              className="h-12 gap-2 rounded-xl border-sidebar-border px-6"
            >
              <MoveLeft size={20} />
              Go Back
            </Button>

            <Link to="/">
              <Button
                variant="primary"
                className="h-12 gap-2 rounded-xl px-10 shadow-lg shadow-primary/20"
              >
                <Home size={20} />
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* support */}
        <p className="mt-16 text-sm text-text-secondary/60">
          If you believe this is an error,{" "}
          <a href="#" className="font-medium text-primary hover:underline">
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
