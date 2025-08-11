import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return (
		twMerge(clsx(inputs))
	)
}

export function truncateText(text: string, maxLength?: number): string {
	return text.length > (maxLength ? maxLength : 50) ? text.slice(0, maxLength || 50) + "..." : text;
}

export function truncateAddress(address: string, prefix: number, suffix: number): string {
	return `${address.slice(0, prefix)}…${address.slice(suffix)}`;
}

export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}