import type { SectionConfig } from '@shopana/storefront-sdk/core/types';
import { Header } from './Header';
import {
  HEADER_SETTINGS_VERSION,
  type DeepPartial,
  type HeaderSettings,
  type HeaderSettingsOverrides,
  type HeaderTextBreakpoint,
} from './HeaderSection.types';

export const defaultHeaderSettings = {
  version: HEADER_SETTINGS_VERSION,
  colors: {
    background: 'var(--ant-color-primary)',
    text: '#ffffff',
    icon: '#ffffff',
    border: 'rgba(255, 255, 255, 0.18)',
    divider: 'rgba(255, 255, 255, 0.4)',
    control: {
      background: 'transparent',
      hoverBackground: 'rgba(255, 255, 255, 0.14)',
    },
    search: {
      background: '#ffffff',
      border: '#ffffff',
      text: '#1f1f1f',
      icon: '#8c8c8c',
      placeholder: '#8c8c8c',
    },
    primaryButton: {
      background: 'var(--ant-color-primary)',
      text: '#ffffff',
    },
    badge: {
      background: '#ffffff',
      text: 'var(--ant-color-primary)',
    },
  },
  layout: {
    sticky: true,
    showShadow: true,
    controlHeight: 42,
    maxWidth: {
      xl: 1280,
      xxl: 1400,
    },
  },
  logo: {
    enabled: true,
    theme: 'light',
    mobileSize: 40,
    desktopSize: 44,
  },
  menu: {
    enabled: true,
    iconSize: 24,
  },
  search: {
    enabled: true,
    iconSize: 18,
    showSubmitButton: true,
  },
  support: {
    enabled: true,
    iconSize: 24,
    showTextFrom: 'xl',
    phoneNumber: '+1 (999) 111-11-11',
    href: 'tel:+19991111111',
  },
  wishlist: {
    enabled: true,
    iconSize: 24,
    showTextFrom: 'md',
  },
  account: {
    enabled: true,
    iconSize: 24,
    showTextFrom: 'md',
  },
  cart: {
    enabled: true,
    iconSize: 24,
    showTextFrom: 'md',
  },
} satisfies HeaderSettings;

const mergeGroup = <T extends object>(
  defaults: T,
  overrides: DeepPartial<T> | undefined
): T => ({ ...defaults, ...overrides }) as T;

const textBreakpoints: HeaderTextBreakpoint[] = ['md', 'lg', 'xl', 'never'];

const assertNumberInRange = (
  value: number,
  name: string,
  min: number,
  max: number
) => {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${name} must be between ${min} and ${max}`);
  }
};

const assertBoolean = (value: boolean, name: string) => {
  if (typeof value !== 'boolean') {
    throw new TypeError(`${name} must be a boolean`);
  }
};

const assertOptionalString = (value: string | undefined, name: string) => {
  if (value !== undefined && typeof value !== 'string') {
    throw new TypeError(`${name} must be a string when provided`);
  }
};

export const validateHeaderSettings = (settings: HeaderSettings) => {
  if (settings.version !== HEADER_SETTINGS_VERSION) {
    throw new Error(
      `Unsupported header settings version: ${String(settings.version)}`
    );
  }

  const colorValues = [
    settings.colors.background,
    settings.colors.text,
    settings.colors.icon,
    settings.colors.border,
    settings.colors.divider,
    settings.colors.control.background,
    settings.colors.control.hoverBackground,
    settings.colors.search.background,
    settings.colors.search.border,
    settings.colors.search.text,
    settings.colors.search.icon,
    settings.colors.search.placeholder,
    settings.colors.primaryButton.background,
    settings.colors.primaryButton.text,
    settings.colors.badge.background,
    settings.colors.badge.text,
  ];

  if (
    colorValues.some(
      (value) =>
        typeof value !== 'string' || !value.trim() || /[;{}]/.test(value)
    )
  ) {
    throw new TypeError(
      'Header colors must be safe, non-empty CSS color values'
    );
  }

  assertNumberInRange(settings.layout.controlHeight, 'controlHeight', 32, 96);
  assertNumberInRange(settings.layout.maxWidth.xl, 'maxWidth.xl', 320, 4096);
  assertNumberInRange(settings.layout.maxWidth.xxl, 'maxWidth.xxl', 320, 4096);

  if (settings.layout.maxWidth.xxl < settings.layout.maxWidth.xl) {
    throw new RangeError(
      'maxWidth.xxl must be greater than or equal to maxWidth.xl'
    );
  }

  assertBoolean(settings.layout.sticky, 'layout.sticky');
  assertBoolean(settings.layout.showShadow, 'layout.showShadow');
  assertBoolean(settings.logo.enabled, 'logo.enabled');
  assertBoolean(settings.menu.enabled, 'menu.enabled');
  assertBoolean(settings.search.enabled, 'search.enabled');
  assertBoolean(settings.search.showSubmitButton, 'search.showSubmitButton');

  if (settings.logo.theme !== 'dark' && settings.logo.theme !== 'light') {
    throw new TypeError('logo.theme must be either dark or light');
  }

  assertNumberInRange(settings.logo.mobileSize, 'logo.mobileSize', 16, 200);
  assertNumberInRange(settings.logo.desktopSize, 'logo.desktopSize', 16, 200);
  assertNumberInRange(settings.menu.iconSize, 'menu.iconSize', 12, 64);
  assertNumberInRange(settings.search.iconSize, 'search.iconSize', 12, 64);

  const actions = [
    ['support', settings.support],
    ['wishlist', settings.wishlist],
    ['account', settings.account],
    ['cart', settings.cart],
  ] as const;

  actions.forEach(([name, action]) => {
    assertBoolean(action.enabled, `${name}.enabled`);
    assertNumberInRange(action.iconSize, `${name}.iconSize`, 12, 64);
    if (!textBreakpoints.includes(action.showTextFrom)) {
      throw new TypeError(`${name}.showTextFrom is not a supported breakpoint`);
    }
  });

  if (
    typeof settings.support.phoneNumber !== 'string' ||
    typeof settings.support.href !== 'string' ||
    !settings.support.phoneNumber.trim() ||
    !settings.support.href.trim()
  ) {
    throw new TypeError('Support phoneNumber and href must be non-empty');
  }

  if (!/^(?:tel:|mailto:|https?:\/\/|\/)/i.test(settings.support.href)) {
    throw new TypeError(
      'Support href must use tel, mailto, http, https, or a relative URL'
    );
  }

  assertOptionalString(settings.search.placeholder, 'search.placeholder');
  assertOptionalString(settings.search.submitLabel, 'search.submitLabel');

  return settings;
};

export const resolveHeaderSettings = (
  overrides: HeaderSettingsOverrides = {}
): HeaderSettings => {
  const colors = mergeGroup<HeaderSettings['colors']>(
    defaultHeaderSettings.colors,
    overrides.colors
  );
  const layout = mergeGroup<HeaderSettings['layout']>(
    defaultHeaderSettings.layout,
    overrides.layout
  );

  const settings: HeaderSettings = {
    version: overrides.version ?? defaultHeaderSettings.version,
    colors: {
      ...colors,
      control: mergeGroup<HeaderSettings['colors']['control']>(
        defaultHeaderSettings.colors.control,
        overrides.colors?.control
      ),
      search: mergeGroup<HeaderSettings['colors']['search']>(
        defaultHeaderSettings.colors.search,
        overrides.colors?.search
      ),
      primaryButton: mergeGroup<HeaderSettings['colors']['primaryButton']>(
        defaultHeaderSettings.colors.primaryButton,
        overrides.colors?.primaryButton
      ),
      badge: mergeGroup<HeaderSettings['colors']['badge']>(
        defaultHeaderSettings.colors.badge,
        overrides.colors?.badge
      ),
    },
    layout: {
      ...layout,
      maxWidth: mergeGroup<HeaderSettings['layout']['maxWidth']>(
        defaultHeaderSettings.layout.maxWidth,
        overrides.layout?.maxWidth
      ),
    },
    logo: mergeGroup<HeaderSettings['logo']>(
      defaultHeaderSettings.logo,
      overrides.logo
    ),
    menu: mergeGroup<HeaderSettings['menu']>(
      defaultHeaderSettings.menu,
      overrides.menu
    ),
    search: mergeGroup<HeaderSettings['search']>(
      defaultHeaderSettings.search,
      overrides.search
    ),
    support: mergeGroup<HeaderSettings['support']>(
      defaultHeaderSettings.support,
      overrides.support
    ),
    wishlist: mergeGroup<HeaderSettings['wishlist']>(
      defaultHeaderSettings.wishlist,
      overrides.wishlist
    ),
    account: mergeGroup<HeaderSettings['account']>(
      defaultHeaderSettings.account,
      overrides.account
    ),
    cart: mergeGroup<HeaderSettings['cart']>(
      defaultHeaderSettings.cart,
      overrides.cart
    ),
  };

  return validateHeaderSettings(settings);
};

export const headerSection = {
  component: Header,
  settings: defaultHeaderSettings,
} satisfies SectionConfig<HeaderSettings, null>;
