import { notification } from 'antd';

export const toast = {
  error(message: string) {
    notification.error({ title: message });
  },
  success(message: string) {
    notification.success({ title: message });
  },
  info(message: string) {
    notification.info({ title: message });
  },
};
