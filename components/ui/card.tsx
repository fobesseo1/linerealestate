import * as React from "react";
import { cn } from "@/lib/utils";

/** A-1 cards are square-cornered white panels on the light canvas. */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card" className={cn("border border-border bg-card text-card-foreground", className)} {...props}/>;
}

function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 data-slot="card-title" className={cn("mb-5 text-[23px] font-extrabold", className)} {...props}/>;
}

export { Card, CardTitle };
