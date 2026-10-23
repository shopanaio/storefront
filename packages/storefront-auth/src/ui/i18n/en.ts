import type { AuthMessages } from './uk';

export const en: AuthMessages = {
  common: {
    back: 'Back',
    close: 'Close',
    or: 'or',
    continue: 'Continue',
    pending: 'Please wait…',
    change: 'Change',
    changeEmail: 'Change email',
    changePhone: 'Change number',
    email: 'Email',
    phone: 'Phone number',
    password: 'Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    invalidEmail: 'Enter a valid email address.',
    invalidPhone: 'Enter a valid phone number.',
    signIn: 'Sign in',
    backToSignIn: 'Back to sign in',
    loadingMethods: 'Loading sign-in methods',
    loading: 'Loading',
    retry: 'Retry',
    resendIn: 'Send again in {time}',
    passwordRule: 'From {min} to {max} characters',
    rulePassed: 'Passed:',
    ruleFailed: 'Not passed:',
    legal:
      'By signing in, you agree to the <privacy>terms of personal data processing</privacy>.',
    country: {
      title: 'Choose a country',
      trigger: 'Country: {country}, +{code}',
    },
  },
  social: {
    group: 'Sign in with a social account',
    signUpGroup: 'Sign up with a social account',
    signIn: 'Sign in with {provider}',
    signUp: 'Continue with {provider}',
    redirectTitle: 'Going to {provider}…',
    redirectSubtitle:
      'The {provider} sign-in page opens now. You will come back here after signing in.',
  },
  alerts: {
    sessionExpired: 'Your session has ended. Sign in again to continue.',
    socialCancelled:
      'Social sign-in was cancelled. Try again or choose another way to sign in.',
    socialFailed:
      'Could not sign in with the social account. Try later or choose another way to sign in.',
    accountNotLinked:
      'This email is already registered with another way to sign in. Sign in with it and connect the social account in your profile.',
    expired: 'The sign-in has timed out. Start again.',
    rateLimited: 'Too many attempts. Try again in <b>{time}</b>.',
    deliveryUnavailable:
      'Could not send the code. Try again or choose another way to sign in.',
    deliveryUnavailableResend: 'Could not send the code again. Try again.',
    methodDisabled: 'This way to sign in is turned off. Choose another one.',
    passwordDisabled:
      'Password sign-in is turned off. Choose another way to sign in.',
    unavailable: 'Something went wrong. Try again later.',
    unavailableGuest:
      'Something went wrong. Try again later. Or check out as a guest.',
    accountsDisabled: {
      store: 'Accounts are not available in this store.',
      checkoutGuest: 'Signing in is not available now. Check out as a guest.',
      checkoutRequired: 'Checking out with an account is not available now.',
    },
  },
  identify: {
    title: 'Sign in',
    subtitleNoCode: 'Choose how to sign in.',
    subtitleRequired: 'An account is required to place the order.',
    tabs: 'Way to sign in',
    tabPhone: 'Phone',
    tabEmail: 'Email',
    withPassword: 'Sign in with password',
  },
  password: {
    title: 'Sign in with password',
    submit: 'Sign in',
    submitPending: 'Signing in…',
    missing: 'Enter your password.',
    invalidCredentials: 'Wrong email or password.',
    verificationLink:
      'Confirm your email: we sent a link to <b>{email}</b>. Follow it and sign in again.',
    resend: 'Send again',
    resent: 'Email sent',
    signInRequired: 'Account created. Sign in with your new password.',
    forgot: 'Forgot password?',
    withCode: 'Sign in with a code',
    signUpPrompt: 'No password? <link>Sign up with password</link>',
  },
  signUp: {
    title: 'Create an account',
    firstName: 'First name',
    lastName: 'Last name',
    lastNameMissing: 'Enter your last name.',
    firstNameMissing: 'Enter your first name.',
    submit: 'Create account',
    userExists:
      'An account with this email already exists. <link>Sign in</link>',
    signUpDisabled:
      'Signing up with a password is not available. <link>Sign in with a code</link>',
    signInPrompt: 'Already have an account? <link>Sign in</link>',
  },
  code: {
    title: 'Enter the code',
    titleVerifyEmail: 'Confirm your email',
    sentEmail: 'We sent a {length}-digit code to your email.',
    sentPhone: 'We sent a {length}-digit code by SMS.',
    label:
      'Confirmation code, {length, plural, one {# digit} other {# digits}}',
    verifying: 'Checking…',
    invalid: 'Wrong or expired code. Try again.',
    invalidNoSignUpEmail:
      'Wrong or expired code. If there is no account with this email yet, sign in another way.',
    invalidNoSignUpPhone:
      'Wrong or expired code. If there is no account with this number yet, sign in another way.',
    resend: 'Send the code again',
    signingIn: 'Signing in…',
  },
  forgot: {
    title: 'Reset password',
    subtitle: 'We will send a link to create a new password.',
    submit: 'Send link',
    sentTitle: 'Check your email',
    sentSubtitle:
      'If an account with this address exists, we sent a link to create a new password.',
    resent: 'Email sent again.',
    notReceived: 'No email?',
    resend: 'Send again',
    resendPending: 'Sending…',
  },
  verifyLink: {
    title: 'Confirm your email',
    subtitle: 'Follow the link in the email, then sign in.',
    sent: 'Email sent again.',
    resend: 'Send the email again',
    hint: 'No email? Check the spam folder.',
  },
  reset: {
    title: 'New password',
    subtitle:
      'After changing the password you will be signed out on all devices.',
    label: 'New password',
    submit: 'Save password',
    linkInvalid:
      'The link is invalid or already used. <link>Send a new one</link>',
    doneTitle: 'Password changed',
    doneSubtitle:
      'You are signed out on all devices. Sign in with the new password.',
  },
  linkExpired: {
    title: 'Link is invalid',
    resetSubtitle: 'The link has expired or has already been used.',
    resetAction: 'Send a new link',
    verifySubtitle:
      'The link has expired. We will send a new email to confirm your address.',
    verifySentSubtitle:
      'A new email is sent. Follow the link in it, then sign in.',
    verifyAction: 'Send a new email',
  },
  emailVerified: {
    title: 'Email confirmed',
    subtitle: 'Now sign in to your account.',
  },
  connections: {
    title: 'Connected accounts',
    subtitle: 'Sign in with social accounts without a password.',
    reauthenticate: 'Sign in again to change the connections.',
    reauthenticateAction: 'Sign in again',
    unavailable: 'Could not load the connections.',
    connected: 'Connected',
    conflict: 'Conflict',
    connect: 'Connect',
    disconnect: 'Disconnect',
    subConnected: 'Sign in with {provider}',
    subNotConnected: 'Not connected',
    subConflict: 'Connected more than once or to another profile.',
    subDisabled: 'No longer supported. It can only be disconnected.',
    footNote: 'Connections can be changed within 10 minutes of signing in.',
    linked: '{provider} is connected.',
    accessDenied: 'The connection was cancelled on the {provider} page.',
    emailMismatch:
      'The email of the {provider} account does not match the email of your profile.',
    accountConflict:
      'This {provider} account is already connected to another profile.',
    lastLoginMethod:
      '{provider} is your only way to sign in, so it cannot be disconnected. Connect another one first.',
    linkingFailed: 'Could not change the {provider} connection. Try again.',
  },
};
