'use client';

import type { ComponentType, ReactNode } from 'react';
import { AuthIntlProvider } from '../i18n/AuthIntlProvider';
import type { FlowScreenName } from './navigation';
import {
  DEFAULT_SCREENS,
  type AuthFlowScreenProps,
  type AuthFlowScreens,
  type AuthFlowView,
} from './screens';
import {
  useAuthFlow,
  type AuthFlowNavigation,
  type AuthFlowOptions,
} from './useAuthFlow';

export interface AuthFlowProps extends AuthFlowOptions {
  /** Header of the container (back, close, logo), given the navigation of the flow. */
  renderHeader?: (navigation: AuthFlowNavigation) => ReactNode;
  /** Components of its own for some screens; they get the same props as the default ones. */
  screens?: Partial<AuthFlowScreens>;
}

/**
 * The whole headless sign-in in one component: `useAuthFlow()` picks the screen and its props,
 * the same in a dialog, a drawer and inline; this renders it with the component of that screen.
 */
export function AuthFlow(props: AuthFlowProps) {
  return (
    <AuthIntlProvider>
      <AuthFlowScreens {...props} />
    </AuthIntlProvider>
  );
}

function AuthFlowScreens({ renderHeader, screens, ...options }: AuthFlowProps) {
  const { view, navigation } = useAuthFlow(options);
  return (
    // A host may render the flow inside its own form (the checkout) or portal it out of one:
    // the submits of the sign-in never reach the host's form.
    <div
      style={{ display: 'contents' }}
      onSubmit={(event) => event.stopPropagation()}
    >
      {renderHeader?.(navigation)}
      <FlowView view={view} screens={screens} />
    </div>
  );
}

function FlowView({
  view,
  screens,
}: {
  view: AuthFlowView;
  screens: Partial<AuthFlowScreens> | undefined;
}) {
  const Screen = (screens?.[view.name] ??
    DEFAULT_SCREENS[view.name]) as ComponentType<
    AuthFlowScreenProps[FlowScreenName]
  >;
  return <Screen {...view.props} />;
}
