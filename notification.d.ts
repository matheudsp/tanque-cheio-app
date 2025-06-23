import { AppNotificationVariants } from "@/hooks/useNotifications";

declare global {
  namespace Notificated {
    interface CustomVariants extends AppNotificationVariants {}
  }
}

export {};
