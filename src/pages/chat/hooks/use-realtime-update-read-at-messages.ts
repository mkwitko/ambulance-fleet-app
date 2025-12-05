import {
  GetAuthenticatedUser200,
  GetChatMessages200DataItem,
  GetChatMessages200DataItemPlatform,
} from "@/src/http/generated/api.schemas";
import { useReadChat } from "@/src/http/generated/chat/chat";
import { useAppIsForeground } from "@/src/utils/is-foreground";
import * as Ably from "ably";
import { useEffect } from "react";

export default function useRealTimeUpdateReadAtMessagesHook({
  user,
}: {
  user: GetAuthenticatedUser200 | undefined;
}) {
  const isForeground = useAppIsForeground();
  const { mutateAsync: readChat } = useReadChat();

  const chat = user?.data.ambulance?.chats[0];

  // ------------------------------
  // 1. Função para marcar como lido
  // ------------------------------

  const markChatAsRead = ({
    incomingMessage,
  }: {
    incomingMessage: Ably.InboundMessage;
  }) => {
    if (!chat) return;
    const message = incomingMessage.data as GetChatMessages200DataItem;

    if (
      message.platform === GetChatMessages200DataItemPlatform.WEB &&
      isForeground
    ) {
      readChat({
        id: chat.id,
        data: {
          platform: GetChatMessages200DataItemPlatform.APP,
          unitId: user?.data?.ambulance?.unitId as string,
        },
      });
    }
  };

  // ------------------------------
  // 2. Quando o app volta para foreground → marcar mensagens não lidas
  // ------------------------------

  useEffect(() => {
    if (!chat) return;
    readChat({
      id: chat.id,
      data: {
        platform: GetChatMessages200DataItemPlatform.APP,
        unitId: user?.data?.ambulance?.unitId as string,
      },
    });
  }, [isForeground]);

  // ------------------------------

  return {
    markChatAsRead,
  };
}
