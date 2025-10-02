/**
 * Returns the sum of two numbers.
 *
 * @param a - The first addend.
 * @param b - The second addend.
 * @returns The arithmetic sum of a and b.
 */
export function sum(a: number, b: number): number {
  return a + b;
}

/**
 * A no-op assert utility that narrows the provided value at runtime.
 *
 * @param condition - The condition that must be true.
 * @param message - The error message to throw if the condition is false.
 */
export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
