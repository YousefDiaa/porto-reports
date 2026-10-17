import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, format: "short" | "long" | "full" = "long"): string {
  const date = new Date(dateString);
  
  const formats = {
    short: { day: "numeric", month: "numeric", year: "numeric" } as const,
    long: { day: "numeric", month: "long", year: "numeric" } as const,
    full: { weekday: "long", day: "numeric", month: "long", year: "numeric" } as const,
  };

  return date.toLocaleDateString("ar-EG", formats[format]);
}

export function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

export function getDateRange(period: "monthly" | "quarterly" | "semi-annual" | "annual", year: number, month?: number, quarter?: number): { start: string; end: string } {
  let start: Date;
  let end: Date;

  switch (period) {
    case "monthly":
      start = new Date(year, (month || 1) - 1, 1);
      end = new Date(year, month || 1, 0);
      break;
    case "quarterly":
      const q = (quarter || 1) - 1;
      start = new Date(year, q * 3, 1);
      end = new Date(year, q * 3 + 3, 0);
      break;
    case "semi-annual":
      if ((month || 1) <= 6) {
        start = new Date(year, 0, 1);
        end = new Date(year, 5, 30);
      } else {
        start = new Date(year, 6, 1);
        end = new Date(year, 11, 31);
      }
      break;
    case "annual":
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31);
      break;
  }

  return {
    start: start!.toISOString().split("T")[0],
    end: end!.toISOString().split("T")[0],
  };
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function truncateText(text: string, length: number = 150): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + "...";
}
