'use client';

import { useSyncExternalStore } from 'react';
import { isKeyboardUp, onKeyboardChange } from './viewportBox';

const subscribe = (onChange: () => void) => onKeyboardChange(() => onChange());

/**
 * Whether the keyboard is up, as the visual viewport's box takes it; false while no one holds
 * the box (`retainViewportBox`) and on the server.
 */
export const useKeyboardUp = () =>
  useSyncExternalStore(subscribe, isKeyboardUp, () => false);
