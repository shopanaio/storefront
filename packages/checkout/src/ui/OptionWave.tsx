import { ConfigProvider } from 'antd';
import { createStyles } from 'antd-style';
import { useContext, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
// antd does not export its click wave; it is the one its buttons, radios and switches use, so
// the options answer a click as the buttons do and follow the `wave` setting of ConfigProvider.
// Private paths: if an antd update moves them, only this file changes.
import Wave from 'antd/es/_util/wave';
import showWaveEffect from 'antd/es/_util/wave/WaveEffect';
import type { ShowWaveEffect } from 'antd/es/_util/wave/interface';

/**
 * The click wave of antd buttons around an option with a border (a delivery or payment method,
 * a loyalty source, a Nova Poshta branch), in the primary color as on a button. Turn it off
 * where a click changes nothing: on the chosen option, whose form is clicked into, and on one
 * that cannot be chosen.
 */
export function OptionWave({
  disabled,
  children,
}: {
  disabled: boolean;
  children: ReactNode;
}) {
  const { styles } = useStyles();
  const { wave } = useContext(ConfigProvider.ConfigContext);
  const frame = useRef<HTMLDivElement>(null);
  // antd runs a wave on the first radio inside the element rather than on the element, so the
  // option's own wave is pointed back at its frame; the radio keeps its own.
  const scoped = useMemo(() => {
    const show: ShowWaveEffect = wave?.showEffect ?? showWaveEffect;
    const showEffect: ShowWaveEffect = (node, info) =>
      show(
        info.component === 'Button' && frame.current ? frame.current : node,
        info
      );
    return { ...wave, showEffect };
  }, [wave]);

  return (
    <ConfigProvider wave={scoped}>
      <Wave component="Button" disabled={disabled}>
        <div ref={frame} className={styles.frame}>
          {children}
        </div>
      </Wave>
    </ConfigProvider>
  );
}

const useStyles = createStyles(({ css, token }) => ({
  // No color of its own (a border color defaults to the text color, which the wave would take),
  // so the wave takes the primary one; the corners of the option.
  frame: css`
    position: relative;
    border-color: transparent;
    border-radius: ${token.borderRadius}px;
  `,
}));
