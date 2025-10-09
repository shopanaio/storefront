import {
  Alert,
  Button,
  Flex,
  Image,
  Input,
  Rate,
  Tooltip,
  Typography,
} from "antd";
import { createStyles } from "antd-style";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { TbInfoCircle } from "react-icons/tb";
import TextArea from "antd/es/input/TextArea";
import type { Entity } from "@shopana/entity";
import { useCreateReview } from "@src/hooks/useCreateReview";
import { fallbackImageBase64 } from "@src/components/Listing/fallbackImageBase64";
const { Text, Paragraph } = Typography;

interface Prop {
  product: Entity.Product;
  onSwitchContent: (content: "success") => void;
}

export const CreateReview = ({ product, onSwitchContent }: Prop) => {
  const t = useTranslations("Product");
  const error = null;

  const { createReview, loading } = useCreateReview();

  const { styles } = useStyles();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{
    rating: number;
    review: string;
    pros: string;
    cons: string;
    displayName: string;
  }>({
    defaultValues: {
      rating: 0,
      review: "",
      pros: "",
      cons: "",
      displayName: "",
    },
  });

  const onSubmit = (data: {
    rating: number;
    review: string;
    pros: string;
    cons: string;
    displayName: string;
  }) => {
    createReview(
      {
        productId: product.id,
        rating: data.rating,
        message: data.review,
        pros: data.pros,
        cons: data.cons,
        title: "",
        displayName: data.displayName,
      },
      (response, errors) => {
        if (!errors) {
          reset();
          onSwitchContent("success");
        } else {
          console.log(errors);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  };

  return (
    <Flex vertical>
      <Text strong>{t("rate-our-product")}</Text>

      <Flex vertical className={styles.modalContent} gap={28}>
        <Flex gap={12} align="center">
          <Image
            className={styles.productImg}
            src={product.cover?.url}
            alt={product.title}
            fallback={fallbackImageBase64}
          />
          <Paragraph
            className={styles.productTitle}
            ellipsis={{ rows: 2 }}
            strong
          >
            {product.title}
          </Paragraph>
        </Flex>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="rating"
            control={control}
            rules={{
              validate: (value) => value > 0 || t("rating-is-required"),
            }}
            render={({ field }) => (
              <Flex vertical>
                <label htmlFor="rate">{t("rating")}</label>
                <Flex wrap align="center" gap={20}>
                  <Rate
                    id="rate"
                    {...field}
                    value={field.value}
                    onChange={field.onChange}
                    allowHalf
                  />
                  {errors.rating && (
                    <Typography.Text type="danger">
                      {String(errors.rating.message)}
                    </Typography.Text>
                  )}
                </Flex>
              </Flex>
            )}
          />

          <Controller
            name="review"
            control={control}
            rules={{ required: t("product-review-is-required") }}
            render={({ field }) => (
              <div>
                <label htmlFor="review-text">{t("product-review")}</label>
                <TextArea
                  id="review-text"
                  {...field}
                  size="large"
                  placeholder={t("product-review")}
                  status={errors.review ? "error" : ""}
                  showCount
                  style={{ height: 64, resize: "none" }}
                  maxLength={200}
                />
                {errors.review && (
                  <Typography.Text type="danger">
                    {String(errors.review.message)}
                  </Typography.Text>
                )}
              </div>
            )}
          />

          <Controller
            name="pros"
            control={control}
            render={({ field }) => (
              <div>
                <label htmlFor="pros">{t("pros")}</label>
                <Input
                  id="pros"
                  {...field}
                  size="large"
                  placeholder={t("pros")}
                  showCount
                  maxLength={100}
                />
              </div>
            )}
          />

          <Controller
            name="cons"
            control={control}
            render={({ field }) => (
              <div>
                <label htmlFor="cons">{t("cons")}</label>
                <Input
                  id="cons"
                  {...field}
                  size="large"
                  placeholder={t("cons")}
                  showCount
                  maxLength={100}
                />
              </div>
            )}
          />

          <Controller
            name="displayName"
            control={control}
            rules={{ required: t("display-name-is-required") }}
            render={({ field }) => (
              <div>
                <label htmlFor="display-name">{t("display-name")}</label>
                <Input
                  id="display-name"
                  {...field}
                  size="large"
                  placeholder={t("display-name")}
                  status={errors.displayName ? "error" : ""}
                  showCount
                  maxLength={100}
                />
                {errors.displayName && (
                  <Typography.Text type="danger">
                    {String(errors.displayName.message)}
                  </Typography.Text>
                )}
              </div>
            )}
          />

          {error && <Alert message={error} type="error" showIcon closable />}

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
          >
            {t("submit-your-review")}
          </Button>

          <Flex align="center">
            <Text className={styles.infoBtn}>{t("send-review-info-text")}</Text>
            <Tooltip title={t("send-review-additional-test")}>
              <Button
                shape="circle"
                className={styles.infoBtn}
                type="text"
                icon={<TbInfoCircle />}
                iconPosition="end"
              />
            </Tooltip>
          </Flex>
        </form>
      </Flex>
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => {
  return {
    modalContent: css`
      padding-top: ${token.paddingLG}px;
    `,

    form: css`
      display: flex;
      flex-direction: column;
      gap: ${token.margin}px;
    `,

    productImg: css`
      max-width: 64px;
      max-height: 64px;
      border-radius: ${token.borderRadius}px;
    `,

    productTitle: css`
      max-width: 250px;
      font-size: ${token.fontSizeHeading5}px;
      margin-bottom: 0 !important;
    `,

    infoBtn: css`
      color: ${token.colorTextSecondary};
    `,
  };
});
