import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-[#1e222b] bg-[#12141a] px-3 py-1 text-sm text-[#f1f3f7] shadow-inner shadow-black/40 transition-colors placeholder:text-[#555b68] focus-visible:outline-none focus-visible:border-[#3b82f6]/50 focus-visible:ring-1 focus-visible:ring-[#3b82f6]/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
