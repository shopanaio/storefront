import type { AuthStep } from '../../core/types';
import {
  canGoBack,
  currentScreen,
  flowReducer,
  initialFlow,
  reactToStep,
  type FlowScreen,
} from './navigation';

const otpSent: AuthStep = {
  type: 'otpSent',
  channel: 'email',
  resendAfter: 60,
  expiresIn: 600,
};
const identify: FlowScreen = { name: 'identify' };
const password: FlowScreen = { name: 'password', notice: null };
const signUp: FlowScreen = { name: 'signUp' };

describe('reactToStep', () => {
  it('opens the sign-in code after a code is sent from the first screen', () => {
    expect(reactToStep(identify, otpSent)).toEqual({
      type: 'open',
      screen: { name: 'code', purpose: 'signIn' },
    });
  });

  it('asks for the email code after a password step sent one', () => {
    expect(reactToStep(password, otpSent)).toEqual({
      type: 'open',
      screen: { name: 'code', purpose: 'verifyEmail' },
    });
    expect(reactToStep(signUp, otpSent)).toMatchObject({
      screen: { purpose: 'verifyEmail' },
    });
  });

  it('keeps the code screen when the code is sent again', () => {
    expect(reactToStep({ name: 'code', purpose: 'signIn' }, otpSent)).toEqual({
      type: 'none',
    });
  });

  it('sends a verification code for an unconfirmed email confirmed by code', () => {
    expect(
      reactToStep(password, { type: 'verificationRequired', method: 'otp' })
    ).toEqual({ type: 'sendVerificationCode' });
  });

  it('waits for the link on the password screen and opens the link screen after a sign-up', () => {
    const link: AuthStep = { type: 'verificationRequired', method: 'link' };
    expect(reactToStep(password, link)).toEqual({
      type: 'update',
      screen: { name: 'password', notice: 'verificationLink' },
    });
    expect(reactToStep(signUp, link)).toEqual({
      type: 'open',
      screen: { name: 'verifyLink', sent: false },
    });
  });

  it('asks to sign in with the new password when the account is created without a session', () => {
    expect(reactToStep(signUp, { type: 'signInRequired' })).toEqual({
      type: 'update',
      screen: { name: 'password', notice: 'signInRequired' },
    });
  });

  it('shows the sent and the resent reset link', () => {
    const forgot: FlowScreen = { name: 'forgot', sent: false, resent: false };
    expect(reactToStep(forgot, { type: 'resetLinkSent' })).toEqual({
      type: 'update',
      screen: { name: 'forgot', sent: true, resent: false },
    });
    expect(
      reactToStep(
        { name: 'forgot', sent: true, resent: false },
        { type: 'resetLinkSent' }
      )
    ).toEqual({
      type: 'update',
      screen: { name: 'forgot', sent: true, resent: true },
    });
  });

  it('marks the verification email as sent again', () => {
    expect(
      reactToStep(
        { name: 'password', notice: 'verificationLink' },
        { type: 'verificationSent' }
      )
    ).toEqual({
      type: 'update',
      screen: { name: 'password', notice: 'verificationResent' },
    });
    expect(
      reactToStep(
        { name: 'verifyLink', sent: false },
        { type: 'verificationSent' }
      )
    ).toEqual({ type: 'update', screen: { name: 'verifyLink', sent: true } });
  });

  it('completes on a session', () => {
    expect(
      reactToStep({ name: 'code', purpose: 'signIn' }, {
        type: 'completed',
      } as AuthStep)
    ).toEqual({ type: 'completed' });
  });
});

describe('flowReducer', () => {
  it('opens a screen on the stack and goes back to the one before', () => {
    let state = initialFlow();
    state = flowReducer(state, { type: 'open', screen: password });
    expect(canGoBack(state)).toBe(true);
    state = flowReducer(state, { type: 'back' });
    expect(currentScreen(state)).toEqual(identify);
    expect(canGoBack(state)).toBe(false);
  });

  it('returns to a screen already on the stack instead of looping', () => {
    let state = initialFlow();
    state = flowReducer(state, { type: 'open', screen: password });
    state = flowReducer(state, {
      type: 'open',
      screen: { name: 'forgot', sent: false, resent: false },
    });
    state = flowReducer(state, {
      type: 'open',
      screen: { name: 'password', notice: null },
    });
    expect(state.stack.map((screen) => screen.name)).toEqual([
      'identify',
      'password',
    ]);
  });

  it('starts over on the first screen', () => {
    let state = initialFlow('password');
    state = flowReducer(state, {
      type: 'open',
      screen: { name: 'code', purpose: 'verifyEmail' },
    });
    state = flowReducer(state, { type: 'restart' });
    expect(state.stack).toEqual([identify]);
  });

  it('offers no way back while signing in or leaving for a provider', () => {
    let state = initialFlow();
    state = flowReducer(state, {
      type: 'open',
      screen: { name: 'social', provider: 'google' },
    });
    expect(canGoBack(state)).toBe(false);
  });

  it('opens on a screen with the first screen under it', () => {
    expect(initialFlow('forgot').stack.map((screen) => screen.name)).toEqual([
      'identify',
      'forgot',
    ]);
  });
});
