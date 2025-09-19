import { createStyles } from "antd-style";

interface Props {
  children?: React.ReactNode;
  /** Number of columns in the grid. Defaults to 2. */
  columns?: number;
}

export const OptionsDrawerGrid = ({ children, columns = 2 }: Props) => {
  const { styles } = useStyles({ columns });

  return <div className={styles.container}>{children}</div>;
};

const useStyles = createStyles<{ columns: number }>(
  ({ css, token }, { columns }) => ({
    container: css`
      display: grid;
      grid-template-columns: repeat(${columns}, 1fr);
      gap: ${token.marginSM}px;
      padding: 0 ${token.padding}px;
    `,
  })
);
