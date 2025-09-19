import { NotificationInstance } from "antd/es/notification/interface";
import { MdCheckCircle, MdOutlineError } from "react-icons/md";

let api: NotificationInstance | null = null;

export const setNotificationApi = (apiRef: NotificationInstance) => {
  api = apiRef;
};

export const toast = {
  error: (msg: string) => {
    api?.open({
      message: msg,
      icon: <MdOutlineError color="var(--ant-red-6)" />,
      className: "error-notification",
      style: {
        padding: "var(--ant-padding-sm)",
        paddingBottom: "var(--ant-padding-xs)",
      },
    });
  },
  internalError: () => {
    api?.open({
      message: "Internal error",
      icon: <MdOutlineError color="var(--ant-red-6)" />,
      style: {
        padding: "var(--ant-padding-sm)",
        paddingBottom: "var(--ant-padding-xs)",
      },
    });
  },
  success: (msg: string) => {
    api?.open({
      message: msg,
      icon: <MdCheckCircle color="var(--ant-green-6)" />,
      style: {
        padding: "var(--ant-padding-sm)",
        paddingBottom: "var(--ant-padding-xs)",
      },
    });
  },
  info: (msg: string) => {
    api?.open({
      message: msg,
      style: {
        padding: "var(--ant-padding-sm)",
        paddingBottom: "var(--ant-padding-xs)",
      },
    });
  },
};
