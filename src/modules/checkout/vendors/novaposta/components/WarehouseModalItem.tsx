import { Button, Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { WarehouseData } from "../api/NovaPoshta.types";
import { fallbackImageBase64 } from "@src/components/Listing/fallbackImageBase64";
const IMAGES = {
  NOVA_POSHTA_LOGO:
    "https://play-lh.googleusercontent.com/mtyOm0Rp0PeG_BWE7M5j9gBWuU1Du34LLj-dLdSE1-006_BkFg32W3Cca00l2BBvNM0",
  MEEST_LOGO:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuU_AVAbb-WjL9W7YTIVt4IxDCNxgvs1Xz8Q&s",
} as const;

interface Prop {
  item: WarehouseData | null;
  changeWarehouse: (warehouse: WarehouseData) => void;
}

const formatSchedule = (schedule: Record<string, string> | string): string => {
  if (typeof schedule === "string") return schedule;

  if (typeof schedule === "object" && schedule !== null) {
    const timeGroups: { [time: string]: string[] } = {};

    Object.entries(schedule).forEach(([day, time]) => {
      if (time && time !== "0") {
        if (!timeGroups[time]) {
          timeGroups[time] = [];
        }
        timeGroups[time].push(day);
      }
    });

    const formattedGroups = Object.entries(timeGroups).map(([time, days]) => {
      const dayNames: { [key: string]: string } = {
        Monday: "Mon",
        Tuesday: "Tue",
        Wednesday: "Wed",
        Thursday: "Thu",
        Friday: "Fri",
        Saturday: "Sat",
        Sunday: "Sun",
      };

      const sortedDays = days.sort((a, b) => {
        const order = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        return order.indexOf(a) - order.indexOf(b);
      });

      let result = "";
      let startDay = sortedDays[0];
      let endDay = sortedDays[0];

      for (let i = 1; i < sortedDays.length; i++) {
        const currentDay = sortedDays[i];
        const prevDay = sortedDays[i - 1];

        if (
          sortedDays.indexOf(currentDay) ===
          sortedDays.indexOf(prevDay) + 1
        ) {
          endDay = currentDay;
        } else {
          if (startDay === endDay) {
            result += `${dayNames[startDay]}-${dayNames[endDay]}: ${time} `;
          } else {
            result += `${dayNames[startDay]}-${dayNames[endDay]}: ${time} `;
          }
          startDay = currentDay;
          endDay = currentDay;
        }
      }

      if (startDay === endDay) {
        result += `${dayNames[startDay]}: ${time} `;
      } else {
        result += `${dayNames[startDay]}-${dayNames[endDay]}: ${time} `;
      }

      return result.trim();
    });

    return formattedGroups.join(" ") || "Schedule not specified";
  }

  return "Schedule not specified";
};

export const WarehouseModalItem = ({ item, changeWarehouse }: Prop) => {
  const { styles } = useStyles();

  if (!item) return null;
  return (
    <Button
      type="text"
      icon={
        <div className={styles.postLogoWrapper}>
          <img
            className={styles.postLogo}
            src={IMAGES.NOVA_POSHTA_LOGO || fallbackImageBase64}
            alt=""
          />
        </div>
      }
      key={item?.Ref}
      className={styles.item}
      onClick={() => changeWarehouse(item)}
    >
      <Flex vertical align="start" gap={4}>
        <Typography.Text className={styles.type} type="secondary">
          {item?.RegionCity}
        </Typography.Text>
        <Typography.Text
          className={styles.warehouseMain}
          strong
          ellipsis={{ rows: 1 }}
        >
          {`№${item?.Number} ${item?.ShortAddress}`}
        </Typography.Text>
        <Typography.Text className={styles.workTime} type="secondary">
          {formatSchedule(item?.Schedule)}
        </Typography.Text>
      </Flex>
    </Button>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    postLogoWrapper: css`
      height: 46px;
      padding: ${token.paddingXXS}px;
      border-radius: ${token.borderRadius}px;
      border: 1px solid ${token.colorBorderSecondary};
    `,

    postLogo: css`
      height: 100%;
      border-radius: ${token.borderRadius}px;
    `,

    type: css`
      line-height: 1;
      font-size: ${token.fontSizeSM}px;
    `,

    warehouseMain: css`
      max-width: 300px !important;
      line-height: 1;
      font-size: ${token.fontSizeLG}px;
    `,

    workTime: css`
      font-size: ${token.fontSizeSM}px;
      line-height: 1;
    `,

    item: css`
      display: flex;
      justify-content: flex-start;
      padding-left: 0;
      height: 60px;
    `,
  };
});
