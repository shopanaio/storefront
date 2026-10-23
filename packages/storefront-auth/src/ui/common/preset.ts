'use client';

import { createContext, useContext } from 'react';

/**
 * What the stories of a design board show typed into a screen: its own state, which the props
 * of a screen do not set. Internal to the package; a screen starts empty without it.
 */
export interface ScreenPreset {
  password?: string;
  code?: string;
  firstName?: string;
  lastName?: string;
  /** The form was submitted once: the fields show what does not pass. */
  submitted?: boolean;
  /** The country list of the phone is open. */
  countryPickerOpen?: boolean;
}

export const ScreenPresetContext = createContext<ScreenPreset>({});

export const useScreenPreset = () => useContext(ScreenPresetContext);
