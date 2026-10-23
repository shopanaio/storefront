'use client';

import { createContext, useContext } from 'react';

/** The overlay a component is rendered in: a drawer, a sheet or a dialog. */
export interface DrawerLayer {
  /** z-index of the overlay's content; what opens from it stands one above. */
  zIndex: number;
  /**
   * The content element of a drawer, which traps the focus and the pointer: a popup opened
   * from the drawer is portalled into it (`getPopupContainer`) to stay usable. `null` in a
   * dialog, whose popups go to the body as usual.
   */
  container: HTMLElement | null;
  /** A vaul sheet, so a sheet opened from it nests in it. */
  sheet: boolean;
}

export const DrawerLayerContext = createContext<DrawerLayer | null>(null);

/**
 * The drawer or dialog of the package the component is rendered in, `null` outside them. An
 * antd popup (`Select`, `DatePicker`, `Modal`) opened from a drawer uses it to stand over it:
 *
 * ```tsx
 * const layer = useDrawerLayer();
 * <Select getPopupContainer={layer?.container ? () => layer.container! : undefined} />
 * <Modal zIndex={layer ? layer.zIndex + 1 : undefined} />
 * ```
 */
export const useDrawerLayer = () => useContext(DrawerLayerContext);
