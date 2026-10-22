import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ComponentProps } from 'react';
import { AuthError } from '../../core/AuthError';
import type { AuthMethods } from '../../core/types';
import { AuthIntlProvider } from '../i18n/AuthIntlProvider';
import { IdentifyScreen } from './IdentifyScreen';
import { PasswordScreen } from './PasswordScreen';
import { contextCopy, type AuthContext } from './types';

afterEach(cleanup);

const methods: AuthMethods = {
  password: { signIn: true, signUp: true, reset: true, minLength: 10, maxLength: 128 },
  emailOtp: { signIn: true, signUp: true, codeLength: 6 },
  phoneOtp: { signIn: true, signUp: true, codeLength: 6 },
  social: [{ provider: 'google', signUp: true }],
};

const noop = () => undefined;

function renderIdentify(
  context: AuthContext,
  overrides: Partial<ComponentProps<typeof IdentifyScreen>> = {}
) {
  return render(
    <NextIntlClientProvider locale="uk" messages={{}}>
      <AuthIntlProvider>
        <IdentifyScreen
          context={context}
          status="ready"
          methods={methods}
          channel="email"
          onChannelChange={noop}
          phone={undefined}
          onPhoneChange={noop}
          email=""
          onEmailChange={noop}
          pending={false}
          error={null}
          notice={null}
          onSubmit={noop}
          onPassword={noop}
          onSignUp={noop}
          onSocial={noop}
          {...overrides}
        />
      </AuthIntlProvider>
    </NextIntlClientProvider>
  );
}

describe('contextCopy', () => {
  it('asks to sign in to continue only in the account-only checkout', () => {
    expect(contextCopy('store').identifyTitle).toBe('identify.title');
    expect(contextCopy('checkoutGuest').identifyTitle).toBe('identify.title');
    expect(contextCopy('checkoutRequired').identifyTitle).toBe('identify.titleRequired');
  });

  it('offers guest checkout when sign-in fails in the guest checkout', () => {
    expect(contextCopy('checkoutGuest').unavailable).toBe('alerts.unavailableGuest');
    expect(contextCopy('checkoutRequired').unavailable).toBe('alerts.unavailable');
    expect(contextCopy('store').accountsDisabled).toBe('alerts.accountsDisabled.store');
  });

  it('offers a password account on store pages only', () => {
    expect(contextCopy('store').offersPasswordSignUp).toBe(true);
    expect(contextCopy('checkoutGuest').offersPasswordSignUp).toBe(false);
    expect(contextCopy('checkoutRequired').offersPasswordSignUp).toBe(false);
  });
});

describe('IdentifyScreen texts', () => {
  it('shows the title of each context', () => {
    renderIdentify('store');
    expect(screen.getByRole('heading', { name: 'Увійдіть або зареєструйтеся' })).toBeInTheDocument();
    expect(screen.getByText('Зареєструватися з паролем')).toBeInTheDocument();
    cleanup();

    renderIdentify('checkoutRequired');
    expect(screen.getByRole('heading', { name: 'Увійдіть, щоб продовжити' })).toBeInTheDocument();
    expect(screen.getByText('Для оформлення замовлення потрібен акаунт.')).toBeInTheDocument();
    expect(screen.queryByText('Зареєструватися з паролем')).not.toBeInTheDocument();
  });

  it('adds guest checkout to the unavailable alert of the guest checkout', () => {
    renderIdentify('checkoutGuest', {
      error: new AuthError('unavailable', 'down', 503),
    });
    expect(
      screen.getByText('Щось пішло не так. Спробуйте пізніше. Або оформіть замовлення як гість.')
    ).toBeInTheDocument();
  });

  it('says accounts are off in the words of the context', () => {
    renderIdentify('checkoutGuest', {
      status: 'unavailable',
      methods: null,
      error: new AuthError('disabled', 'off', 404),
    });
    expect(
      screen.getByText('Вхід до акаунта зараз недоступний. Оформіть замовлення як гість.')
    ).toBeInTheDocument();
  });

  it('shows Phone | Email tabs only when both codes are on', () => {
    renderIdentify('store');
    expect(screen.getByText('Телефон')).toBeInTheDocument();
    cleanup();
    renderIdentify('store', {
      methods: { ...methods, phoneOtp: { ...methods.phoneOtp, signIn: false } },
    });
    expect(screen.queryByText('Телефон')).not.toBeInTheDocument();
  });

  it('makes the password the main button without a code', () => {
    renderIdentify('store', {
      methods: {
        ...methods,
        emailOtp: { ...methods.emailOtp, signIn: false },
        phoneOtp: { ...methods.phoneOtp, signIn: false },
      },
    });
    expect(screen.getByRole('button', { name: 'Увійти з паролем' })).toHaveClass('ant-btn-primary');
    expect(screen.getByText('Оберіть спосіб входу.')).toBeInTheDocument();
  });
});

describe('PasswordScreen texts', () => {
  it('offers the password sign-up on store pages only', () => {
    const props = {
      methods,
      email: 'olena@example.com',
      onEmailChange: noop,
      pending: false,
      error: null,
      notice: null,
      onSubmit: noop,
      onForgot: noop,
      onCode: noop,
      onSignUp: noop,
      onResendVerification: noop,
    };
    render(
      <NextIntlClientProvider locale="uk" messages={{}}>
        <AuthIntlProvider>
          <PasswordScreen context="checkoutGuest" {...props} />
        </AuthIntlProvider>
      </NextIntlClientProvider>
    );
    expect(screen.queryByText('Зареєструватися з паролем')).not.toBeInTheDocument();
    expect(screen.getByText('Увійти за кодом')).toBeInTheDocument();
  });
});
