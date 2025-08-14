import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        "soft-blue":
          "border-transparent bg-blue-600/10 dark:bg-blue-600/20 text-blue-500 rounded-full shadow-none [a&]:hover:bg-blue-600/15",
        "soft-purple":
          "border-transparent bg-purple-600/10 dark:bg-purple-600/20 text-purple-500 rounded-full shadow-none [a&]:hover:bg-purple-600/15",
        "soft-gray":
          "border-transparent bg-gray-600/10 dark:bg-gray-600/20 text-gray-500 rounded-full shadow-none [a&]:hover:bg-gray-600/15",
        "soft-green":
          "border-transparent bg-green-600/10 dark:bg-green-600/20 text-green-500 rounded-full shadow-none [a&]:hover:bg-green-600/15",
        "soft-yellow":
          "border-transparent bg-yellow-600/10 dark:bg-yellow-600/20 text-yellow-600 rounded-full shadow-none [a&]:hover:bg-yellow-600/15",
        "soft-orange":
          "border-transparent bg-orange-600/10 dark:bg-orange-600/20 text-orange-500 rounded-full shadow-none [a&]:hover:bg-orange-600/15",
        "soft-emerald":
          "border-transparent bg-emerald-600/10 dark:bg-emerald-600/20 text-emerald-500 rounded-full shadow-none [a&]:hover:bg-emerald-600/15",
        "soft-red":
          "border-transparent bg-red-600/10 dark:bg-red-600/20 text-red-500 rounded-full shadow-none [a&]:hover:bg-red-600/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
