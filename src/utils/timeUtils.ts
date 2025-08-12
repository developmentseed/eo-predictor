/**
 * Formats timezone offset information for display
 */
export function formatTimezoneOffset(date: Date): string {
  const offsetMinutes = date.getTimezoneOffset();
  const offsetHours = Math.abs(offsetMinutes) / 60;
  const sign = offsetMinutes <= 0 ? "+" : "-";
  
  if (offsetHours === 0) return "(local time)";
  return `(${sign}${offsetHours}h local)`;
}

/**
 * Formats time for display with UTC and local offset
 */
export function formatTimeDisplay(timestamp: number): {
  date: string;
  time: string;
  timezone: string;
} {
  const date = new Date(timestamp);
  
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    timezone: formatTimezoneOffset(date),
  };
}