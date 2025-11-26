"use client";

import { Button, Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { TbArrowRight, TbPlayerPlayFilled } from "react-icons/tb";
import ReactPlayer from "react-player/lazy";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { mq } from "@src/components/UI/Theme/breakpoints";

const { Text } = Typography;

export interface VideoBannerSectionProps {
  title: string;
  description: string;
  video: string;
  cover: string;
}

export default function VideoBannerSection({
  title,
  description,
  video,
}: VideoBannerSectionProps) {
  const t = useTranslations("Home");
  const { styles } = useStyles();
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className={styles.container}>
      {!isPlaying ? (
        <Flex className={styles.videoBanner} justify="center" align="center">
          <Flex vertical align="center" gap={28}>
            {!isPlaying && (
              <Button
                className={styles.playButton}
                icon={<TbPlayerPlayFilled size={30} />}
                onClick={() => setIsPlaying(true)}
              />
            )}
            <Flex vertical align="center" gap={12}>
              <Text strong className={styles.videoTitle}>
                {title}
              </Text>
              <Text className={styles.videoDescription}>{description}</Text>
            </Flex>
            <Button icon={<TbArrowRight />} size="large" iconPlacement="end">
              {t("go-to-collections")}
            </Button>
          </Flex>
        </Flex>
      ) : (
        <div className={styles.videoWrapper}>
          <ReactPlayer
            className={styles.video}
            url={video}
            playing
            width="100%"
            height="100%"
            controls
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}

const useStyles = createStyles(({ css, token }) => {
  return {
    videoWrapper: css`
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      border-radius: 16px;
      overflow: hidden;
      background-color: ${token.colorBgContainer};
    `,
    video: css`
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 16px;
      overflow: hidden;
      & iframe {
        border-radius: 16px;
        /* box-shadow removed for linter compliance, if needed — use token.boxShadow */
        border: none;
      }
    `,
    container: css`
      width: 100%;
      height: 100%;
      padding: 0 ${token.padding}px;

      ${mq.xl} {
        margin-right: auto;
        margin-left: auto;

        width: 1280px;
      }

      ${mq.xxl} {
        padding: 0;
        width: 1400px;
      }
    `,
    playButton: css`
      min-width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: ${token.colorBgContainer};
    `,

    videoBanner: css`
      position: relative;
      height: 686px;
      border-radius: ${token.borderRadiusLG}px;
      background-size: cover;
      background-position: center;
      background-image: url("https://images.hindustantimes.com/tech/img/2024/11/08/1600x900/OnePlus_13_launching_on_October_31_1729503323498_1731048803730.jpg");
      background-color: ${token.colorBgLayout};
      overflow: hidden;

      &::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        background: linear-gradient(
          120deg,
          ${token.colorPrimary} 100%,
          ${token.colorPrimary} 100%
        );
        opacity: 0.5;
      }

      & > * {
        position: relative;
        z-index: 1;
      }
    `,

    videoTitle: css`
      font-size: 36px;
      color: ${token.colorTextLightSolid};
    `,

    videoDescription: css`
      font-size: 16px;
      color: ${token.colorTextLightSolid};
    `,
  };
});
