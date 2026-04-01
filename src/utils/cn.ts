import { clsx, type ClassValue } from 'clsx';

/**
 * Lightweight class name merger. Wraps clsx.
 * Usage: cn('base', condition && 'conditional', { 'object-style': true })
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
