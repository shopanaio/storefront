'use client';

import { Spin } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { ScreenTitle } from '../common/heading';
import { MediaCircle, Screen } from '../common/layout';

export interface SigningInScreenProps {
  /** First letter of the buyer's name or email; a spinner until it is known. */
  initial: string | null;
  /** What the buyer signed in with, under the title. */
  destination?: string;
}

/** Signed in: "Signing in…" with the buyer's initial while the session settles. */
export const SigningInScreen = ({
  initial,
  destination,
}: SigningInScreenProps) => {
  const t = useTranslations('Auth.code');
  const { styles } = useStyles();
  return (
    <Screen busy>
      {initial ? (
        <MediaCircle className={styles.initial}>{initial}</MediaCircle>
      ) : (
        <Spin size="large" />
      )}
      <ScreenTitle title={t('signingIn')} subtitle={destination} />
    </Screen>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  initial: css`
    font-size: ${token.fontSizeHeading4}px;
    font-weight: ${token.fontWeightStrong};
  `,
}));
