import {
  formatPhoneNumberIntl,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
} from 'react-phone-number-input';

/**
 * Whether a phone number (E.164, as `PhoneInput` gives it) has a possible length for its
 * country. The lenient check: right for a field while it is being filled in.
 */
export function isPossiblePhone(value: string | null | undefined): boolean {
  return Boolean(value) && isPossiblePhoneNumber(value!);
}

/** Whether a phone number (E.164) is a valid number of its country, by its digits too. */
export function isValidPhone(value: string | null | undefined): boolean {
  return Boolean(value) && isValidPhoneNumber(value!);
}

/**
 * A phone number (E.164) in the international format, `+380 67 123 45 67`; the value as it is
 * when it cannot be formatted.
 */
export function formatPhoneInternational(value: string): string {
  return (value && formatPhoneNumberIntl(value)) || value;
}
