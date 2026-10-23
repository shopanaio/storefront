const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Whether the text looks like an email address (`name@domain.tld`), spaces around it aside. A
 * check of the form only: the server decides whether the address is real.
 */
export function isEmail(value: string | null | undefined): boolean {
  return Boolean(value) && EMAIL.test(value!.trim());
}
