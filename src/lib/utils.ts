import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return '#22c55e'; // green-500
  if (aqi <= 100) return '#eab308'; // yellow-500
  return '#ef4444'; // red-500
};
