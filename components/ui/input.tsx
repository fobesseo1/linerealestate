import * as React from "react";
import { cn } from "@/lib/utils";

const fieldClass = "w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-3 text-body font-normal text-ink outline-none placeholder:text-caption placeholder:text-gray-500 aria-invalid:border-brand max-md:text-base max-md:placeholder:text-xs";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input data-slot="input" className={cn(fieldClass, className)} {...props}/>;
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(fieldClass, "min-h-21 resize-y leading-[1.7]", className)} {...props}/>;
}

export { Input, Textarea, fieldClass };
