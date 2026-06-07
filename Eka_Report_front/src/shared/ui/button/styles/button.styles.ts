import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  `relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[13px] font-medium transition-all
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
  disabled:pointer-events-none disabled:opacity-50 
  [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 cursor-pointer
  bg-[var(--btn-bg)] text-[var(--btn-text)] border-[var(--btn-border)]
  hover:bg-[var(--btn-hoverBg)] hover:text-[var(--btn-hoverText)]
  active:scale-[0.98]
  disabled:bg-[var(--btn-disabledBg)] disabled:text-[var(--btn-disabledText)]
  data-[loading=true]:text-transparent data-[loading=true]:[&>svg:not(.loader)]:opacity-0`,
  {
    variants: {
      variant: {
        primary: "bg-brand-primary text-white hover:bg-blue-600 dark:hover:bg-blue-500 shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
        secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
        outline: "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900",
        ghost: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
      },
      size: {
        sm: "h-8 px-3 text-[12px]",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-[14px]",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);
