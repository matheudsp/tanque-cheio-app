//SINGLETON PATTERN
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { router } from "expo-router";

// Define como as notificações devem se comportar quando o app está em primeiro plano.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class PushNotificationService {
  /**
   * Registra o dispositivo para receber push notifications e retorna o token.
   * Lida com as permissões necessárias para iOS e Android.
   * @returns O ExpoPushToken ou null se a permissão for negada.
   */
  public async registerForPushNotificationsAsync(): Promise<string | null> {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      // Idealmente, você informaria ao usuário que ele não receberá notificações.
      console.warn("Push notification permission denied.");
      return null;
    }

    // Garante que temos um projectId válido, que é necessário para obter o token.
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.error(
        "Expo project ID not found. Make sure it is set in app.json."
      );
      return null;
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
        .data;
      console.log("Expo Push Token:", token);
      return token;
    } catch (error) {
      console.error("Error getting Expo Push Token:", error);
      return null;
    }
  }

  /**
   * Configura os listeners para reagir a notificações.
   * - O primeiro listener é para quando o usuário toca na notificação.
   * - O segundo é para quando uma notificação é recebida com o app aberto.
   */
  public setupNotificationListeners(): void {
    // Listener para quando o usuário interage com a notificação (toca nela)
    const interactionSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("Notification Response Data:", data);

        // Exemplo de navegação baseada nos dados da notificação
        if (data?.url) {
          router.push(data.url as any);
        } else if (data?.gas_station_id) {
          router.push(`/gas-station/${data.gas_station_id}` as any);
        }
      });

    // Listener para quando uma notificação é recebida enquanto o app está em primeiro plano
    // (O comportamento de exibição já é definido em `setNotificationHandler`)
    const receiveSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(
          "Notification Received:",
          notification.request.content.title
        );
        // Aqui você poderia, por exemplo, atualizar uma lista de notificações no app
      }
    );

    // Retorna uma função para remover os listeners quando o componente for desmontado
    // ou quando o usuário fizer logout.
    const cleanup = () => {
      interactionSubscription.remove();
      receiveSubscription.remove();
    };

    // Armazenamos a função de cleanup para poder chamá-la externamente (ex: no logout)
    this.cleanupListeners = cleanup;
  }

  // Variável para guardar a função de limpeza
  private cleanupListeners: () => void = () => {};

  /**
   * Executa a limpeza dos listeners de notificação.
   */
  public removeListeners(): void {
    this.cleanupListeners();
    this.cleanupListeners = () => {}; // Reseta a função de cleanup
  }
}

// Exporta uma instância singleton do serviço.
export const pushNotificationService = new PushNotificationService();
