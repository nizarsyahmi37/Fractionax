import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function truncateText(text: string, maxLength?: number): string {
	return text.length > (maxLength ? maxLength : 50) ? text.slice(0, maxLength || 50) + "..." : text;
}
