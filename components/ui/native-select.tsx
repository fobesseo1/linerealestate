import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** shadcn NativeSelect: a styled <select> that keeps the platform picker on phones. */
function NativeSelect({ className, wrapperClassName, ...props }: React.ComponentProps<"select"> & { wrapperClassName?: string }) {
  return <div data-slot="native-select-wrapper" className={cn("relative", wrapperClassName)}>
    <select data-slot="native-select" className={cn("h-11 w-full min-w-0 appearance-none rounded-sm border border-input bg-white py-2 pl-3 pr-8 text-sm leading-[1.4] text-ink outline-none max-md:text-base", className)} {...props}/>
    <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"/>
  </div>;
}

export { NativeSelect };
