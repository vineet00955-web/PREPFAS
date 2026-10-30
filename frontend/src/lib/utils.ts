import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFraction(val: number): string {
  if (val === 0) return '0';
  const integerPart = Math.floor(val);
  const decimalPart = Number((val - integerPart).toFixed(2));

  let fractionStr = '';
  if (Math.abs(decimalPart - 0.25) < 0.05) fractionStr = '¼';
  else if (Math.abs(decimalPart - 0.33) < 0.05) fractionStr = '⅓';
  else if (Math.abs(decimalPart - 0.5) < 0.05) fractionStr = '½';
  else if (Math.abs(decimalPart - 0.66) < 0.05) fractionStr = '⅔';
  else if (Math.abs(decimalPart - 0.75) < 0.05) fractionStr = '¾';
  else if (decimalPart > 0) fractionStr = decimalPart.toString().replace(/^0\./, '.');

  if (integerPart > 0 && fractionStr) {
    return `${integerPart} ${fractionStr}`;
  } else if (integerPart > 0) {
    return `${integerPart}`;
  }
  return fractionStr || '0';
}

export function formatDateLabel(isoDate: string): { dayName: string; formattedDate: string; isToday: boolean } {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const today = new Date();
  const isToday =
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate();

  return {
    dayName: days[date.getDay()],
    formattedDate: `${months[date.getMonth()]} ${date.getDate()}`,
    isToday,
  };
}

