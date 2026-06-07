import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
	return format(new Date(date), "d MMM yyyy");
}

export function formatDateTime(date: Date | string): string {
	return format(new Date(date), "d MMM yyyy - HH:mm");
}
