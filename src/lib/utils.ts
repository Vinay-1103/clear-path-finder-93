
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return '#4ade80'; // green-400
  if (aqi <= 100) return '#facc15'; // yellow-400
  if (aqi <= 150) return '#fb923c'; // orange-400
  if (aqi <= 200) return '#ef4444'; // red-500
  if (aqi <= 300) return '#9333ea'; // purple-600
  return '#881337'; // rose-900
};

export const getAQIBackground = (aqi: number) => {
  if (aqi <= 50) return 'bg-green-100 text-green-800'; 
  if (aqi <= 100) return 'bg-yellow-100 text-yellow-800';
  if (aqi <= 150) return 'bg-orange-100 text-orange-800';
  if (aqi <= 200) return 'bg-red-100 text-red-800';
  if (aqi <= 300) return 'bg-purple-100 text-purple-800';
  return 'bg-rose-100 text-rose-900';
};

export const getAQILabel = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};
