"use client";

import { Button, Divider, Flex, Rate, Tooltip, Typography } from "antd";
import { createStyles } from "antd-style";
import { ShowMoreBtn } from "../../atoms/ShowMoreBtn";
import { TbInfoCircle, TbThumbUp, TbThumbDown } from "react-icons/tb";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { model } from "@shopana/storefront-sdk";
import { useModalStore } from "@src/store/appStore";
import { useSession } from "@src/hooks/useSession";
import { useVoteReviewHelpful } from "@src/hooks/useVoteReviewHelpful";
import { useReportReviewAbuse } from "@src/hooks/useReportReviewAbuse";

const { Text, Paragraph } = Typography;

interface Props {
  node: model.Review;
}

export const ProductRateItem = ({ node }: Props) => {
  const { styles } = useStyles() as { styles: Record<string, string> };
  const t = useTranslations("Product");

  const session = useSession((state) => state.session);
  const user = session?.user;

  const setIsAuthModalVisible = useModalStore(
    (state) => state.setIsAuthModalVisible
  );
  const { voteReviewHelpful, loading } = useVoteReviewHelpful();
  const { reportReviewAbuse, loading: reportLoading } = useReportReviewAbuse();

  const [meHelpful, setMeHelpful] = useState<true | false>(node.meHelpful);

  const handleVote = (helpful: boolean) => {
    if (!user) return setIsAuthModalVisible(true);
    voteReviewHelpful({ reviewId: node.id, helpful }, () => {
      setMeHelpful(helpful);
    });
  };

  const [ellipsis, setEllipsis] = useState(false);

  const formatDate = (rawDate: string) => {
    const date = new Date(rawDate);

    return date
      .toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", "")
      .replace(", ", " at ");
  };

  return (
    <Flex vertical gap={8} className={styles.container}>
      <Flex gap={20} align="center" wrap>
        <Rate value={node.rating} allowHalf disabled />
        {node.verifiedPurchase && (
          <Tooltip title={t("reviewer-bought-this-item")}>
            <Button
              className={styles.verifiedBtn}
              type="text"
              icon={<TbInfoCircle />}
              iconPlacement="end"
            >
              {t("verified-purchase")}
            </Button>
          </Tooltip>
        )}
      </Flex>

      <Flex vertical gap={4}>
        <Text strong>{node.displayName ? node.displayName : "Customer"}</Text>
        <Text type="secondary">{formatDate(node.createdAt)}</Text>
      </Flex>

      <Flex vertical>
        <Paragraph
          className={styles.reviewText}
          ellipsis={ellipsis ? false : { rows: 2 }}
        >
          {node.message}

          {ellipsis && (
            <Flex className={styles.reviewProsConsBox} vertical>
              <span>
                <Text strong>{t("pros")}</Text>: <Text>{node.pros}</Text>
              </span>
              <span>
                <Text strong>{t("cons")}</Text>: <Text>{node.cons}</Text>
              </span>
            </Flex>
          )}
        </Paragraph>

        <ShowMoreBtn
          full={ellipsis}
          onClick={() => setEllipsis((prev) => !prev)}
        />
      </Flex>

      <Flex align="center" gap={12} wrap>
        <Text>{t("helpful")}</Text>

        <Flex gap={4} align="center">
          <Button
            className={styles.helpfulBtn}
            type={meHelpful === true ? "link" : "text"}
            icon={<TbThumbUp size={16} />}
            loading={loading && meHelpful !== false}
            onClick={() => handleVote(true)}
          >
            {node.helpfulYes}
          </Button>

          <Button
            className={styles.helpfulBtn}
            type={/* meHelpful === false ? "link" : "text" */ "text"}
            icon={<TbThumbDown size={16} />}
            loading={loading && meHelpful !== true}
            onClick={() => handleVote(false)}
          >
            {node.helpfulNo}
          </Button>
        </Flex>

        <Divider className={styles.divider} type="vertical" />

        <Button
          className={styles.reportBtn}
          type="text"
          loading={reportLoading}
          onClick={() => reportReviewAbuse(node.id, node.message)}
        >
          {t("report")}
        </Button>
      </Flex>
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: ${token.padding}px;
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorBorder};
  `,
  verifiedBtn: css`
    align-items: center;
    font-weight: 500;
    padding: 0;
  `,
  divider: css`
    font-size: 32px;
    font-weight: 500;
  `,
  reportBtn: css`
    padding: 0;
  `,
  reviewText: css`
    margin-bottom: 0 !important;
  `,
  reviewProsConsBox: css`
    margin-top: ${token.marginSM}px;
  `,
  helpfulBtn: css`
    padding: 0;
  `,
}));
