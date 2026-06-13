/**
 * calcAge — Single source of truth to calculate age from a date in DD/MM/YYYY format.
 * Validates the format, calculates using the exact millisecond difference (considers month and day),
 * and returns 0 for invalid or missing dates.
 *
 * Centralized here to avoid divergences between Patients, Profile, and Diet Generator.
 */
export function calcAge(dob: string): number {
  if (!dob || typeof dob !== "string" || !/^\d{2}\/\d{2}\/\d{4}$/.test(dob))
    return 0;
  const [day, month, year] = dob.split("/").map(Number);
  const birthDate = new Date(year, month - 1, day);
  if (isNaN(birthDate.getTime())) return 0;
  const ageDate = new Date(Date.now() - birthDate.getTime());
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);
  return age >= 0 ? age : 0;
}
