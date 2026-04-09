import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatIndianNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return num;

  const numStr = num.toString();
  const [integerPart, decimalPart] = numStr.split('.');

  // Handle Indian numbering system
  const lastThree = integerPart.slice(-3);
  const otherNumbers = integerPart.slice(0, -3);

  let formatted = lastThree;
  if (otherNumbers) {
    formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }

  return decimalPart ? formatted + "." + decimalPart : formatted;
}