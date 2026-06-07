import { type FC, useMemo } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/shared/ui/button/Button";
import { Page } from "@/shared/pages/Page";

interface ErrorPageProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export const ErrorPage: FC<ErrorPageProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const hasError = Boolean(error); // check error existence

  const errorMessage = useMemo(
    () => error?.message || "Unknown error occurred", // safe fallback message
    [error],
  );

  const errorStack = useMemo(
    () => error?.stack, // memoize stack
    [error],
  );

  return (
    <Page
      title="Something went wrong"
      subtitle="An unexpected error has occurred while rendering this page." // static subtitle
      breadcrumbs={[{ label: "Error" }]} // breadcrumb
    >
      <div className="flex flex-col items-center justify-center py-20 text-center">
        {/* icon */}
        <div className="mb-8 rounded-3xl bg-error/10 p-6 text-error animate-bounce-slow">
          <AlertCircle size={64} />
        </div>

        <div className="max-w-2xl space-y-6">
          {/* heading */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-text-primary">
              Application Error
            </h2>
            <p className="text-text-secondary">
              We've encountered a technical issue. Our team has been notified
              and we're working to fix it.
            </p>
          </div>

          {/* error details */}
          {hasError && (
            <div className="max-h-48 overflow-auto rounded-xl border border-error/20 bg-neutral-bg p-4 text-left scrollbar-hide">
              <p className="break-all font-mono text-xs text-error/80">
                {errorMessage}
              </p>

              {errorStack && (
                <pre className="mt-2 text-[10px] leading-relaxed text-text-muted opacity-50">
                  {errorStack}
                </pre>
              )}
            </div>
          )}

          {/* actions */}
          <div className="flex items-center justify-center gap-4">
            {resetErrorBoundary ? (
              <Button
                variant="primary"
                onClick={resetErrorBoundary} // retry boundary
                className="gap-2 px-8"
              >
                <RotateCcw size={18} />
                Try Again
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => window.location.reload()} // reload fallback
                className="gap-2 px-8"
              >
                <RotateCcw size={18} />
                Reload Page
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")} // navigate home
              className="gap-2"
            >
              <Home size={18} />
              Back to Safety
            </Button>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default ErrorPage;
