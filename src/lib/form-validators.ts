/** Alphanumeric code with optional hyphen/underscore (2–64 chars), first char letter or digit. */
export const ENTITY_CODE_PATTERN = /^[A-Z0-9][A-Z0-9-_]{1,63}$/;

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function toUpperCode(value: string) {
  return value.trim().toUpperCase();
}
