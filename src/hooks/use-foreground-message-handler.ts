// src/hooks/useRadioCallHandler.ts
import { AblyEvents } from "@/src/@types/ably-events";
import useAbly from "@/src/services/use-ably";
import { useEffect, useRef } from "react";
import { useAppIsForeground } from "../utils/is-foreground";
import useMessageNotificationHook from "./use-message-notification-hook";

export function useForegroundMessageHandler() {
  const isForeground = useAppIsForeground();
  const isForegroundRef = useRef(isForeground);

  const { playSound } = useMessageNotificationHook();

  useEffect(() => {
    isForegroundRef.current = isForeground;
  }, [isForeground]);

  const { user } = useAbly({
    events: [AblyEvents.messages],
    handleMessageReceived: (message) => {
      if (
        message.name === AblyEvents.messages &&
        !isForegroundRef.current &&
        message.data.userId !== user?.data.id
      ) {
        playSound();
      }
    },
  });

  return { user };
}
