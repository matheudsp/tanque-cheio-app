import { createNotifications } from "react-native-notificated";
import {
  NotificationCard,
  type NotificationCardProps,
} from "@/components/ui/NotificationCard";

const {
  NotificationsProvider,
  useNotifications,
  notify,
  CustomVariantsTypeHelper,
} = createNotifications({
  duration: 4000,
  notificationPosition: "top",
  defaultStylesSettings: {
    globalConfig: {
      borderRadius: 8,
    },
  },
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

type NotificationServiceParams = Omit<NotificationCardProps, "type">;

export const notificationService = {
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
export { NotificationsProvider, useNotifications };

export type AppNotificationVariants = typeof CustomVariantsTypeHelper;
