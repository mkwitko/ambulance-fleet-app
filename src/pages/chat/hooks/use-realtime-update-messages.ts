import { GetChatMessages200DataItem } from "@/src/http/generated/api.schemas";
import * as Ably from "ably";

export const realtTimeUpdateChatMessage = ({
  incomingMessage,
  selectedChatId,
  setMessages,
}: {
  incomingMessage: Ably.InboundMessage;
  selectedChatId: string;
  setMessages: React.Dispatch<
    React.SetStateAction<GetChatMessages200DataItem[]>
  >;
}) => {
  const message = incomingMessage.data as GetChatMessages200DataItem;
  setMessages((prevMessages) => {
    // Verifica se a mensagem já existe na lista
    if (
      message &&
      message.chatId === selectedChatId &&
      !prevMessages.some((msg) => msg.id === message.id)
    ) {
      return [message, ...prevMessages];
    }
    return prevMessages;
  });
};
