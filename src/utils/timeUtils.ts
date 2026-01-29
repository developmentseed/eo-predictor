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
 * Formats timezone offset for UTC context
 */
export function formatUTCOffset(date: Date): string {
  const offsetMinutes = date.getTimezoneOffset();
  const offsetHours = Math.abs(offsetMinutes) / 60;
  const sign = offsetMinutes <= 0 ? "+" : "-";

  if (offsetHours === 0) return "UTC";
  return `${sign}${offsetHours}h UTC`;
}

/**
 * Formats time for display to match PassCounter format with timezone
 */
export function formatTimeDisplay(timestamp: number): string {
  const date = new Date(timestamp);

  const timeString = date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const timezone = formatUTCOffset(date);

  return `${timeString} ${timezone}`;
}

/**
 * Formats last updated timestamp for display as relative time
 */
export function formatLastUpdated(lastUpdated: string): string {
  const date = new Date(lastUpdated);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else {
    return "Less than 1 hour ago";
  }
}
