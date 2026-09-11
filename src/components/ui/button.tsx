import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow hover:bg-blue-500 active:bg-blue-700",
        destructive:
          "bg-[#3d1316] text-[#f87171] border border-[#5c1d24] shadow-sm hover:bg-[#4d171b] active:bg-[#5c1d24]",
        outline:
          "border border-[#222631] bg-[#12141a] text-[#e2e5eb] hover:bg-[#191c24] hover:border-[#343a49] hover:text-white shadow-sm",
        secondary:
          "bg-[#161922] text-[#e2e5eb] border border-[#222631] shadow-sm hover:bg-[#1e222d] hover:text-white",
        ghost:
          "text-[#949ba8] hover:bg-[#161820] hover:text-white",
        link:
          "text-blue-400 underline-offset-4 hover:underline p-0",
        gold:
          "bg-amber-500 text-[#090a0d] font-semibold shadow hover:bg-amber-400 active:bg-amber-600",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-6 text-base",
        icon: "h-8 w-8 p-0",
        iconLg: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
