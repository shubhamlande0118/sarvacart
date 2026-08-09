/**
 * Shared validation helpers used across all forms.
 * Centralised so rules stay consistent and testable.
 */

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^[6-9][0-9]{9}$/;
export const pincodeRegex = /^[1-9][0-9]{5}$/;

export function isEmail(value: string): boolean {
  return emailRegex.test(value.trim());
}

export function isPhone(value: string): boolean {
  return phoneRegex.test(value.replace(/\s|-/g, ""));
}

export function isPincode(value: string): boolean {
  return pincodeRegex.test(value.trim());
}

export function isStrongPassword(value: string): {
  valid: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  if (value.length < 8) reasons.push("At least 8 characters.");
  if (!/[A-Z]/.test(value)) reasons.push("At least one uppercase letter.");
  if (!/[0-9]/.test(value)) reasons.push("At least one number.");
  if (!/[^A-Za-z0-9]/.test(value)) reasons.push("At least one special character.");
  return { valid: reasons.length === 0, reasons };
}

export function required(value: string, label = "This field"): string | null {
  return value.trim().length > 0 ? null : `${label} is required.`;
}

export function minLength(value: string, n: number, label = "This field"): string | null {
  return value.trim().length >= n ? null : `${label} must be at least ${n} characters.`;
}
