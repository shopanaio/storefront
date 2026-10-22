import { isPossiblePhoneNumber } from '@shopana/storefront-ui';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (value: string) => EMAIL.test(value.trim());

/** E.164 the phone field gives back, of a possible length for its country. */
export const isPhone = (value: string | undefined) =>
  Boolean(value) && isPossiblePhoneNumber(value!);
