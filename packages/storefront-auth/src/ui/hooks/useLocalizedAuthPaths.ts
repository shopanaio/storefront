'use client';

import { useLocalization } from '@shopana/storefront-sdk/modules/localization/react';
import {
  DEFAULT_EMAIL_VERIFICATION_PATH,
  DEFAULT_PASSWORD_RESET_PATH,
} from '../../core/types';

/** Pages the verification and reset links open, in the locale the buyer is browsing. */
export function useLocalizedAuthPaths(paths: {
  verifyPath?: string;
  resetPath?: string;
}): { verifyPath: string; resetPath: string } {
  const { buildHref } = useLocalization();
  return {
    verifyPath: paths.verifyPath ?? buildHref(DEFAULT_EMAIL_VERIFICATION_PATH),
    resetPath: paths.resetPath ?? buildHref(DEFAULT_PASSWORD_RESET_PATH),
  };
}
