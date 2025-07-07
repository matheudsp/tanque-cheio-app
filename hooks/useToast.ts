import { createNotifications } from "react-native-notificated";
import {
  NotificationCard,
  type ToastCardProps,
} from "@/components/ui/ToastCard";

import { DURATION_MS } from "@/constants/toast.config";

const {
  NotificationsProvider,
  useNotifications,
  notify,
  CustomVariantsTypeHelper,
} = createNotifications({
  duration: DURATION_MS,
  notificationPosition: "top",

  variants: {
    customSuccess: {
      component: NotificationCard,
      defaultProps: { type: "success" },
    },
    customError: {
      component: NotificationCard,
      defaultProps: { type: "error" },
    },
    customInfo: {
      component: NotificationCard,
      defaultProps: { type: "info" },
    },
    customWarning: {
      component: NotificationCard,
      defaultProps: { type: "warning" },
    },
  },
});

type NotificationServiceParams = Omit<ToastCardProps, "type">;

export const toast = {
  success: (params: NotificationServiceParams) => {
    notify("customSuccess", { params: { ...params, type: "success" } });
  },
  error: (params: NotificationServiceParams) => {
    notify("customError", { params: { ...params, type: "error" } });
  },
  info: (params: NotificationServiceParams) => {
    notify("customInfo", { params: { ...params, type: "info" } });
  },
  warning: (params: NotificationServiceParams) => {
    notify("customWarning", { params: { ...params, type: "warning" } });
  },
};
export { NotificationsProvider as ToastProvider, useNotifications as useToast };

export type AppNotificationVariants = typeof CustomVariantsTypeHelper;
