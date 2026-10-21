import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the custom theme in app/globals.css, so `text-tiny` is not mistaken for a text colour.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["micro", "tiny", "caption", "body", "md", "lead"] }],
      "font-weight": [{ font: ["demibold", "strong", "heavy"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
