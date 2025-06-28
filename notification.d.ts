import { AppNotificationVariants } from "@/hooks/useToast";

declare global {
  namespace Notificated {
    interface CustomVariants extends AppNotificationVariants {}
  }
}

export {};
