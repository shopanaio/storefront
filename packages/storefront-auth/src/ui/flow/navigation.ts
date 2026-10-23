import type { AuthStep } from '../../core/types';
import type { OtpPurpose, PasswordNotice } from '../screens/types';

/** Digits of a one-time code when the configuration does not say. */
export const DEFAULT_CODE_LENGTH = 6;

/** A screen of the flow and what it shows; `name` picks its component. */
export type FlowScreen =
  | { name: 'identify' }
  | { name: 'password'; notice: PasswordNotice | null }
  | { name: 'signUp' }
  | { name: 'forgot'; sent: boolean; resent: boolean }
  | { name: 'code'; purpose: OtpPurpose }
  | { name: 'verifyLink'; sent: boolean }
  | { name: 'social'; provider: string }
  | { name: 'signingIn' };

export type FlowScreenName = FlowScreen['name'];

/** Screens a flow may open on. */
export type InitialScreen = 'identify' | 'password' | 'signUp' | 'forgot';

export interface FlowState {
  /** Screens the buyer went through; the last one is shown, "Back" returns to the one before. */
  stack: readonly FlowScreen[];
}

export type FlowAction =
  | { type: 'open'; screen: FlowScreen }
  | { type: 'update'; screen: FlowScreen }
  | { type: 'back' }
  | { type: 'restart' };

export function screenOf(name: InitialScreen): FlowScreen {
  switch (name) {
    case 'password':
      return { name, notice: null };
    case 'forgot':
      return { name, sent: false, resent: false };
    default:
      return { name };
  }
}

export function initialFlow(name: InitialScreen = 'identify'): FlowState {
  return {
    stack:
      name === 'identify'
        ? [screenOf(name)]
        : [screenOf('identify'), screenOf(name)],
  };
}

export const currentScreen = (state: FlowState): FlowScreen =>
  state.stack[state.stack.length - 1]!;

/** "Back" is offered while there is a screen to return to and the screen is not progress. */
export const canGoBack = (state: FlowState): boolean => {
  const screen = currentScreen(state);
  return (
    state.stack.length > 1 &&
    screen.name !== 'signingIn' &&
    screen.name !== 'social'
  );
};

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'open': {
      // Opening a screen already in the stack returns to it, so the stack never loops.
      const index = state.stack.findIndex(
        (screen) => screen.name === action.screen.name
      );
      const base = index === -1 ? state.stack : state.stack.slice(0, index);
      return { stack: [...base, action.screen] };
    }
    case 'update':
      return { stack: [...state.stack.slice(0, -1), action.screen] };
    case 'back':
      return state.stack.length > 1
        ? { stack: state.stack.slice(0, -1) }
        : state;
    case 'restart':
      return { stack: [state.stack[0] ?? screenOf('identify')] };
  }
}

/** What the flow does when a step of `screen` answered `step`. */
export type StepReaction =
  | { type: 'open'; screen: FlowScreen }
  | { type: 'update'; screen: FlowScreen }
  /** The email must be confirmed by a code: send one to it, then ask for it. */
  | { type: 'sendVerificationCode' }
  | { type: 'completed' }
  | { type: 'none' };

export function reactToStep(screen: FlowScreen, step: AuthStep): StepReaction {
  switch (step.type) {
    case 'completed':
      return { type: 'completed' };
    case 'otpSent':
      // A code sent again from the code screen keeps it; otherwise the code screen opens.
      if (screen.name === 'code') return { type: 'none' };
      return {
        type: 'open',
        screen: {
          name: 'code',
          purpose:
            screen.name === 'password' || screen.name === 'signUp'
              ? 'verifyEmail'
              : 'signIn',
        },
      };
    case 'verificationRequired':
      if (step.method === 'otp') return { type: 'sendVerificationCode' };
      if (screen.name === 'password')
        return {
          type: 'update',
          screen: { name: 'password', notice: 'verificationLink' },
        };
      return { type: 'open', screen: { name: 'verifyLink', sent: false } };
    case 'signInRequired':
      // The account is created without a session: sign in with the same password.
      return {
        type: 'update',
        screen: { name: 'password', notice: 'signInRequired' },
      };
    case 'resetLinkSent':
      return screen.name === 'forgot'
        ? {
            type: 'update',
            screen: { name: 'forgot', sent: true, resent: screen.sent },
          }
        : {
            type: 'open',
            screen: { name: 'forgot', sent: true, resent: false },
          };
    case 'verificationSent':
      if (screen.name === 'password')
        return {
          type: 'update',
          screen: { name: 'password', notice: 'verificationResent' },
        };
      if (screen.name === 'verifyLink')
        return { type: 'update', screen: { name: 'verifyLink', sent: true } };
      return { type: 'none' };
    case 'passwordReset':
    case 'redirect':
      return { type: 'none' };
  }
}
