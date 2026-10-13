import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex w-fit shrink-0 items-center whitespace-nowrap", {
  variants: {
    variant: {
      // Red label on photos and status tags.
      brand: "rounded-sm bg-brand px-2 py-1 text-tiny text-white",
      // White label on photos.
      light: "rounded-sm bg-white px-2 py-1 text-tiny text-ink",
      tag: "rounded-sm bg-gray-50 px-2 py-1 text-micro text-gray-700",
    },
  },
  defaultVariants: { variant: "brand" },
});

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props}/>;
}

export { Badge, badgeVariants };
