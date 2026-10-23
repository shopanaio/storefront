export interface ContactFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  phone: string;
  /** Contact email of a guest; a signed-in buyer's email comes from the account. */
  email: string;
}
