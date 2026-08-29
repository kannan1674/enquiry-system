import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        primary: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      },
      size: {
        default: "h-6 px-2.5 py-0.5 text-xs",
        sm: "h-5 px-2 py-0.5 text-xs",
        lg: "h-7 px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  appearance?: "default" | "outline" | "stroke"
}

function Badge({ className, variant, size, appearance, ...props }: BadgeProps) {
  // Handle appearance prop for backward compatibility
  let finalVariant = variant
  if (appearance === "outline") {
    finalVariant = "outline"
  } else if (appearance === "stroke") {
    finalVariant = "outline" // Use outline variant for stroke appearance
  }

  return (
    <div className={cn(badgeVariants({ variant: finalVariant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
