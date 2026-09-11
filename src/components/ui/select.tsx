import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

export interface SimpleSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
}

const Select = React.forwardRef<HTMLSelectElement, SimpleSelectProps>(
  ({ className, children, options, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-9 w-full appearance-none items-center justify-between rounded-md border border-[#1e222b] bg-[#12141a] px-3 py-1 pr-8 text-sm text-[#f1f3f7] shadow-inner shadow-black/40 transition-colors focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#12141a] text-[#f1f3f7]">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-[#7d8594]" />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
