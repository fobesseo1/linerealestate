"use client";
import * as React from "react";
import * as Primitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = Primitive.Root;

export function DialogContent({ className, children, ...props }: React.ComponentProps<typeof Primitive.Content>) {
  return <Primitive.Portal>
    <Primitive.Overlay data-slot="dialog-overlay" className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[3px]"/>
    <Primitive.Content data-slot="dialog-content" className={cn("fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-t-4 border-t-brand bg-white p-7 text-ink shadow-xl", className)} {...props}>
      {children}
      <Primitive.Close aria-label="닫기" className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100"><X size={18}/></Primitive.Close>
    </Primitive.Content>
  </Primitive.Portal>;
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof Primitive.Title>) {
  return <Primitive.Title data-slot="dialog-title" className={cn("pr-6 text-2xl font-bold", className)} {...props}/>;
}

export function DialogDescription({ className, ...props }: React.ComponentProps<typeof Primitive.Description>) {
  return <Primitive.Description data-slot="dialog-description" className={cn("mt-2 text-sm text-gray-500", className)} {...props}/>;
}
