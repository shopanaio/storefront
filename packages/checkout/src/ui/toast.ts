import { notification } from 'antd';

export const toast = {
  error(message: string) {
    notification.error({ message });
  },
  success(message: string) {
    notification.success({ message });
  },
  info(message: string) {
    notification.info({ message });
  },
};
