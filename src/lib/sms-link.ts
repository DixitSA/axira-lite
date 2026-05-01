/**
 * Normalizes a phone number to E.164 format.
 * Assumes US numbers if no country code is present.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

/**
 * Builds a native SMS deep link.
 * Format: sms:{phone}&body={message}
 */
export function buildSMSLink(phone: string, message: string): string {
  const normalizedPhone = normalizePhone(phone);
  // Use &body for cross-platform compatibility (iOS uses &, some Androids use ?)
  // However, the standard for most modern mobile OS is & or ;
  // "&body=" is the most reliable for pre-filling.
  return `sms:${normalizedPhone}&body=${encodeURIComponent(message)}`;
}
