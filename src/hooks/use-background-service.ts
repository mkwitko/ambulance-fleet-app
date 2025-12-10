// src/hooks/useBackgroundService.ts
import BackgroundConnection from "expo-background-connection-plugin";
import { useEffect } from "react";

export function useBackgroundService({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;

    let isUnmounted = false;

    const startService = async () => {
      try {
        const isRunning = await BackgroundConnection.isServiceRunning();
        console.log("Background connection is running:", isRunning);

        if (!isRunning) {
          const result = await BackgroundConnection.startService({
            notificationTitle: "Connect",
            notificationBody: "Aplicativo rodando em segundo plano",
          });

          console.log("Background connection started:", result);
        }
      } catch (err) {
        console.error("Error starting background connection:", err);
      }
    };

    startService();

    return () => {
      if (!isUnmounted) {
        BackgroundConnection.stopService();
      }
      isUnmounted = true;
    };
  }, [enabled]);
}
