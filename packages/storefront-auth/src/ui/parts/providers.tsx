import type { ReactNode } from 'react';

/**
 * How a social provider is shown: the configuration gives only its id (`google`), so names and
 * logos live here. An unknown provider shows its id with a capital and its first letter.
 */
export interface SocialProviderView {
  provider: string;
  name: string;
  icon: ReactNode;
}

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" width="1em" height="1em" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
    <path
      fill="#1877F2"
      d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.931-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
    />
    <path
      fill="#FFFFFF"
      d="m16.671 15.563.532-3.49h-3.328V9.809c0-.955.465-1.886 1.956-1.886h1.513V4.952s-1.374-.236-2.686-.236c-2.741 0-4.533 1.672-4.533 4.697v2.66H7.078v3.49h3.047V24a12.1 12.1 0 0 0 3.75 0v-8.437z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
    <path
      fill="currentColor"
      d="M16.365 1.43c0 1.14-.42 2.2-1.12 2.98-.76.86-1.99 1.52-3 1.44-.13-1.1.42-2.25 1.1-2.99.76-.84 2.06-1.47 3.02-1.43zM20.5 17.27c-.55 1.27-.81 1.84-1.52 2.96-.99 1.56-2.38 3.5-4.11 3.52-1.53.01-1.93-1-4.01-.99-2.08.01-2.52 1.01-4.05 1-1.73-.02-3.05-1.77-4.04-3.33C.01 16.07-.28 11 1.47 8.33c1.24-1.9 3.2-3.01 5.04-3.01 1.87 0 3.05 1.02 4.6 1.02 1.5 0 2.42-1.02 4.58-1.02 1.64 0 3.38.89 4.62 2.43-4.06 2.23-3.4 8.03.19 9.52z"
    />
  </svg>
);

const KNOWN: Record<string, { name: string; icon: () => ReactNode }> = {
  google: { name: 'Google', icon: GoogleIcon },
  facebook: { name: 'Facebook', icon: FacebookIcon },
  apple: { name: 'Apple', icon: AppleIcon },
};

const Initial = ({ letter }: { letter: string }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '1em',
      height: '1em',
      fontWeight: 600,
      fontSize: '0.9em',
    }}
  >
    {letter}
  </span>
);

export function socialProviderView(provider: string): SocialProviderView {
  const known = KNOWN[provider.toLowerCase()];
  if (known) {
    const Icon = known.icon;
    return { provider, name: known.name, icon: <Icon /> };
  }
  const name = provider
    ? provider[0]!.toUpperCase() + provider.slice(1)
    : provider;
  return { provider, name, icon: <Initial letter={name.slice(0, 1)} /> };
}
