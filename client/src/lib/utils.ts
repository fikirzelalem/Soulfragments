import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combines Tailwind + class utilities
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// LocalStorage helpers (used by Tutorial, etc.)
export function getLocalStorage(key: string, fallback: any = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function setLocalStorage(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Failed to save localStorage:", err);
  }
}
