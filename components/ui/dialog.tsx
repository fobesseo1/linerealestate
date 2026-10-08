"use client";
import * as React from "react";
import * as Primitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
export const Dialog = Primitive.Root;
export const DialogTitle = Primitive.Title;
export const DialogDescription = Primitive.Description;
export function DialogContent({ className, children, ...props }: React.ComponentProps<typeof Primitive.Content>) {
  return <Primitive.Portal><Primitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[3px]" /><Primitive.Content className={cn("fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%_-_32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-white p-7 shadow-xl", className)} {...props}>{children}<Primitive.Close aria-label="닫기" className="absolute right-4 top-4 rounded-full p-2 hover:bg-neutral-100"><X size={18}/></Primitive.Close></Primitive.Content></Primitive.Portal>;
}
