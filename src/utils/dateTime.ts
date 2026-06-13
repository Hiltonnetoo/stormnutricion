/**
 * Naive (timezone-agnostic) date/time utilities used in the Calendar.
 *
 * Appointments are stored as wall time, e.g.: "2026-06-04T14:00:00".
 * JavaScript interprets DATE-ONLY strings ("2026-06-04") as UTC, which causes
 * a 1-day shift when the system is loaded in other timezones. These functions
 * construct the Date object from explicit components, ensuring that the displayed
 * date/time is always the same as registered, regardless of the browser's timezone.
 */

/**
 * Converts "YYYY-MM-DDTHH:mm[:ss]" (or "YYYY-MM-DD") to a Date whose
 * local components correspond EXACTLY to those in the string.
 */
export const parseLocalDateTime = (value: string): Date => {
  if (!value) return new Date(NaN);
  const [datePart, timePart = "00:00:00"] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour = 0, minute = 0, second = 0] = timePart.split(":").map(Number);
  if (!year || !month || !day) return new Date(NaN);
  return new Date(year, month - 1, day, hour, minute, second);
};
