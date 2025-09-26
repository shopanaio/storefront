import { createStyles, cx } from "antd-style";
import { useEffect, useState } from "react";
import { Header } from "./Header";

export const StickyHeader: React.FC = () => {
  const { styles } = useStyles();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => setMounted(true));

    const onScroll = () => {
      const shouldBeVisible = window.scrollY > 100;
      setVisible(shouldBeVisible);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className={cx(styles.wrapper, mounted && visible && styles.visible)}>
      <Header />
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    wrapper: css`
      width: 100%;
      position: fixed;
      top: 0;
      left: 0;
      transform: translateY(-100%);
      transition: transform 0.3s ease, opacity 0.3s ease;
      opacity: 0;
      z-index: 20;
    `,
    visible: css`
      transform: translateY(0);
      opacity: 1;
    `,
  };
});
