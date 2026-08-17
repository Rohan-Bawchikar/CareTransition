/**
 * Date utilities for CareTransition
 * 
 * Ensures timezone-safe date operations and ISO formatting based on local calendar dates,
 * preventing UTC skew in timezones with positive or negative offsets.
 */

/**
 * Returns today's date (or the given date) in YYYY-MM-DD format using local time.
 */
export function getLocalISODate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Safely parses a YYYY-MM-DD or YYYY-MM-DDTHH:mm string into a local Date object,
 * avoiding UTC-induced day-shifting in positive/negative timezones.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  if (dateStr.includes('T')) {
    return new Date(dateStr);
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Returns the date in YYYY-MM-DDTHH:mm format using local time.
 */
export function getLocalISODateTime(date: Date = new Date(), hours = 10, minutes = 0): string {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  return `${year}-${month}-${day}T${h}:${m}`;
}

/**
 * Calculates a date offset from today by a given number of days.
 */
export function getOffsetISODate(offsetDays: number, baseDate: Date = new Date()): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + offsetDays);
  return getLocalISODate(d);
}

/**
 * Calculates a datetime offset from today by a given number of days.
 */
export function getOffsetISODateTime(offsetDays: number, hours = 10, minutes = 0, baseDate: Date = new Date()): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + offsetDays);
  return getLocalISODateTime(d, hours, minutes);
}

/**
 * Formats an ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm) into a clean human-readable date.
 */
export function formatReadableDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats an ISO datetime string into a human-readable datetime.
 */
export function formatReadableDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}
