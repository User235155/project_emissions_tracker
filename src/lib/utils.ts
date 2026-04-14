export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback

  try {
    const saved = window.localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

export function saveToStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
