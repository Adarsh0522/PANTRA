/**
 * MAPPING LAYER — Text-to-Box Utility
 *
 * Converts a raw string into a capped, sanitised array of characters.
 * Each character maps to exactly one box in the PDF grid.
 *
 * Rules:
 *  - Convert to UPPERCASE
 *  - Strip everything except A-Z, 0-9, and space
 *  - Truncate to maxLength
 *  - Returns string[] — empty strings for unused slots are NOT included
 */
export function mapTextToBoxes(
  text: string | undefined | null,
  maxLength: number,
  allowDigits = true,
): string[] {
  if (!text) return [];
  const pattern = allowDigits ? /[^A-Z0-9 ]/g : /[^A-Z ]/g;
  return text
    .toUpperCase()
    .replace(pattern, '')
    .split('')
    .slice(0, maxLength);
}

/**
 * Formats a date string (YYYY-MM-DD) into [DD, MM, YYYY] parts.
 * Returns undefined for any part that doesn't exist.
 */
export function mapDateToParts(
  date: string | undefined | null,
): { day: string; month: string; year: string } | null {
  if (!date) return null;
  const parts = date.split('-');
  if (parts.length !== 3) return null;
  return { year: parts[0], month: parts[1], day: parts[2] };
}

/**
 * Calculates age in years from a date string (YYYY-MM-DD).
 */
export function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
/**
 * Splits a text into two lines based on words without breaking them.
 * Line 1 takes as much as possible up to maxChars.
 */
export function wrapTextByWords(
  text: string | undefined | null,
  maxChars: number,
): { line1: string; line2: string } {
  if (!text) return { line1: "", line2: "" };
  
  const words = text.trim().split(/\s+/);
  let line1 = "";
  let line2 = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const candidate = line1 ? `${line1} ${word}` : word;
    
    if (candidate.length <= maxChars && line2 === "") {
      line1 = candidate;
    } else {
      line2 = line2 ? `${line2} ${word}` : word;
    }
  }

  return { line1, line2 };
}
