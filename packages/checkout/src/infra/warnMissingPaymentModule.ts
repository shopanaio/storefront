const reported = new Set<string>();

/**
 * Reports, once per method and only outside production, a payment method
 * that the API offers but no UI module renders. Such a method stays hidden.
 */
export function warnMissingPaymentModule(
  provider: string,
  code: string,
  reason: 'provider' | 'method'
): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const key = `${provider}/${code}`;
  if (reported.has(key)) {
    return;
  }
  reported.add(key);

  console.warn(
    reason === 'provider'
      ? `[checkout] Payment method "${code}" is hidden: no payment module is registered for provider "${provider}".`
      : `[checkout] Payment method "${code}" is hidden: payment module "${provider}" does not declare this method.`
  );
}
