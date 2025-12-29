// Date utilities for India timezone (IST - UTC+5:30)

const INDIA_TIMEZONE = 'Asia/Kolkata';

/**
 * Get current date/time in India timezone
 */
export function getIndiaDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: INDIA_TIMEZONE }));
}

/**
 * Format a date string to India timezone date
 */
export function formatIndiaDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    timeZone: INDIA_TIMEZONE,
    ...options,
  });
}

/**
 * Format a date string to India timezone time
 */
export function formatIndiaTime(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    timeZone: INDIA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

/**
 * Format a date string to India timezone date and time
 */
export function formatIndiaDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    timeZone: INDIA_TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Check if a date is today in India timezone
 */
export function isIndiaToday(dateString: string): boolean {
  const date = new Date(dateString);
  const indiaDateStr = date.toLocaleDateString('en-US', { timeZone: INDIA_TIMEZONE });
  const todayStr = new Date().toLocaleDateString('en-US', { timeZone: INDIA_TIMEZONE });
  return indiaDateStr === todayStr;
}

/**
 * Get the start of current week in India timezone (Monday)
 */
export function getIndiaWeekStart(): Date {
  const now = getIndiaDate();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  return new Date(now.setDate(diff));
}

/**
 * Format relative time in India timezone
 */
export function formatIndiaRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatIndiaDate(dateString);
}
