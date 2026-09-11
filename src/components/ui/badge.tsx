import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[#2563eb]/40 bg-[#172554]/40 text-[#60a5fa]",
        secondary:
          "border-[#232732] bg-[#14161e] text-[#a1a7b5]",
        destructive:
          "border-[#5c1d24] bg-[#2d1215] text-[#f87171]",
        success:
          "border-[#064e3b] bg-[#022c22] text-[#34d399]",
        warning:
          "border-[#78350f] bg-[#451a03]/60 text-[#fbbf24]",
        outline:
          "border-[#232732] text-[#858c9c]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
