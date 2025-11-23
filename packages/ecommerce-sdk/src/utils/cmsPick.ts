import { getSDKConfig } from '../config';

export const cmsPick = <T>(mapping: Record<string, T>): T => {
  const { cmsProvider } = getSDKConfig();

  const value = mapping[cmsProvider];
  if (!value) {
    throw new Error(`Provider ${cmsProvider} not found in mapping`);
  }

  return value;
}
