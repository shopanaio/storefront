'use client';

import { useImperativeHandle, useRef } from 'react';
import type { CSSProperties, Ref } from 'react';
import { AuthFlow, type AuthFlowProps } from '../flow/AuthFlow';
import { AuthInlineSurface } from './surfaces';

/** What a host does with the inline sign-in from outside, e.g. "Log in" elsewhere on the page. */
export interface AuthInlineHandle {
  /** Focuses the first field of the screen (the phone or the email), else its first button. */
  focus(options?: FocusOptions): void;
  /** The panel, e.g. to scroll it into view. */
  element: HTMLDivElement | null;
}

export interface AuthInlineProps extends AuthFlowProps {
  ref?: Ref<AuthInlineHandle>;
  className?: string;
  style?: CSSProperties;
}

/** Fields of a screen: past the method tabs (radios) and the hidden inputs of the country. */
const FIELD = 'input:not([type="radio"]):not([type="hidden"]):not(:disabled)';

/**
 * Sign-in in the page itself, in a panel; the screens bring their own ways back.
 * `checkoutRequired` by default: the checkout of a store that takes orders from accounts only.
 */
export const AuthInline = ({
  ref,
  context = 'checkoutRequired',
  className,
  style,
  ...flowProps
}: AuthInlineProps) => {
  const panel = useRef<HTMLDivElement>(null);
  useImperativeHandle(
    ref,
    () => ({
      focus: (options) => {
        const root = panel.current;
        const target =
          root?.querySelector<HTMLElement>(FIELD) ??
          root?.querySelector<HTMLElement>('button');
        target?.focus(options);
      },
      get element() {
        return panel.current;
      },
    }),
    []
  );
  return (
    <AuthInlineSurface ref={panel} className={className} style={style}>
      <AuthFlow {...flowProps} context={context} />
    </AuthInlineSurface>
  );
};
