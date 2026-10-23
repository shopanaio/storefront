import type { ComponentType } from 'react';
import { CodeScreen, type CodeScreenProps } from '../screens/CodeScreen';
import { ForgotScreen, type ForgotScreenProps } from '../screens/ForgotScreen';
import {
  IdentifyScreen,
  type IdentifyScreenProps,
} from '../screens/IdentifyScreen';
import {
  PasswordScreen,
  type PasswordScreenProps,
} from '../screens/PasswordScreen';
import {
  SocialRedirectScreen,
  VerifyEmailLinkScreen,
  type SocialRedirectScreenProps,
  type VerifyEmailLinkScreenProps,
} from '../screens/ResultScreen';
import { SignUpScreen, type SignUpScreenProps } from '../screens/SignUpScreen';
import {
  SigningInScreen,
  type SigningInScreenProps,
} from '../screens/SigningInScreen';
import type { FlowScreenName } from './navigation';

/** Props the flow gives the component of each screen. */
export interface AuthFlowScreenProps {
  identify: IdentifyScreenProps;
  password: PasswordScreenProps;
  signUp: SignUpScreenProps;
  forgot: ForgotScreenProps;
  code: CodeScreenProps;
  verifyLink: VerifyEmailLinkScreenProps;
  social: SocialRedirectScreenProps;
  signingIn: SigningInScreenProps;
}

/** The component of each screen; a host replaces any of them with `screens` of `AuthFlow`. */
export type AuthFlowScreens = {
  [Name in FlowScreenName]: ComponentType<AuthFlowScreenProps[Name]>;
};

/** The screen shown and the props of its component. */
export type AuthFlowView = {
  [Name in FlowScreenName]: { name: Name; props: AuthFlowScreenProps[Name] };
}[FlowScreenName];

export const DEFAULT_SCREENS: AuthFlowScreens = {
  identify: IdentifyScreen,
  password: PasswordScreen,
  signUp: SignUpScreen,
  forgot: ForgotScreen,
  code: CodeScreen,
  verifyLink: VerifyEmailLinkScreen,
  social: SocialRedirectScreen,
  signingIn: SigningInScreen,
};
