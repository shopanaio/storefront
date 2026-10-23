/**
 * The headless sign-in without a server, for the stories and tests of a storefront:
 * `@shopana/storefront-auth/testing`. `createMockAuth()` is a `useAuth()` that answers like
 * IAM; the fixtures are the methods, identifiers and errors of the design boards.
 */
export {
  createMockAuth,
  type MockAuth,
  type MockAuthOptions,
  type MockAuthState,
} from './createMockAuth';
export {
  EMAIL,
  MOCK_CODE,
  MOCK_METHODS,
  PHONE,
  WRONG_PASSWORD,
  configurationOf,
  errorOf,
  methodsOf,
  type MethodArgs,
  type MethodsArg,
} from './fixtures';
