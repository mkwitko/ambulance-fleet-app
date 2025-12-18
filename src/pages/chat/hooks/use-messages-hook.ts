import {
  GetAuthenticatedUserAmbulance200Data,
  GetChatMessages200DataItem,
  GetChatMessages200DataItemPlatform,
  SendMessageBodyMessageType,
  SendMessageBodyPlatform,
} from "@/src/http/generated/api.schemas";
import {
  useGetChatMessages,
  useReadChat,
  useSendMessage,
} from "@/src/http/generated/chat/chat";
import { useGetAuthenticatedUser } from "@/src/http/generated/user/user";
import { InboundMessage } from "ably";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, View } from "react-native";

export default function useMessageHook({
  selectedChatId,
  user,
  online,
  messages,
  setMessages,
  incomingMessage,
  setIncomingMessage,
}: {
  selectedChatId: string;
  user: GetAuthenticatedUserAmbulance200Data | undefined;
  online: boolean;
  messages: GetChatMessages200DataItem[];
  setMessages: React.Dispatch<
    React.SetStateAction<GetChatMessages200DataItem[]>
  >;
  incomingMessage: InboundMessage | null;
  setIncomingMessage: React.Dispatch<
    React.SetStateAction<InboundMessage | null>
  >;
}) {
  const [message, setMessage] = useState("");

  const { data: userInfo } = useGetAuthenticatedUser();

  const [page, setPage] = useState(1);

  const { mutateAsync: readChat } = useReadChat();

  const { data: chatMessages, isFetching } = useGetChatMessages(
    selectedChatId,
    {
      page,
      perPage: 20,
    },
    {
      query: {
        enabled: !!selectedChatId,
      },
    }
  );

  const prevScrollHeightRef = useRef<number>(0);
  const scrollAreaRef = useRef<FlatList>(null);
  const messagesEndRef = useRef<View>(null);
  const contentHeightRef = useRef(0);

  const { mutateAsync: sendMessage, isPending } = useSendMessage();

  useEffect(() => {
    if (user?.ambulance?.chats[0]?.id !== messages[0]?.chatId) {
      setMessages([]);
      setPage(1);
      return;
    }
  }, [user?.ambulance?.chats[0]?.id]);

  // ▶️ Carregar mensagens e fazer merge
  useEffect(() => {
    if (!chatMessages) return;

    const newMessages = [...chatMessages.data].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // primeira página → substitui
    if (page === 1) {
      setMessages(newMessages); // já invertidas

      // Marca todas como lidas ao carregar a primeira página
      readChat({
        id: selectedChatId,
        data: {
          platform: GetChatMessages200DataItemPlatform.APP,
          unitId: user?.ambulance?.unitId as string,
        },
      });
      return;
    }

    // páginas seguintes → append (pois o FlatList tá invertido!)
    setMessages((prev) => {
      const merged = [...prev, ...newMessages];

      const map = new Map(merged.map((m) => [m.id, m]));
      return Array.from(map.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [chatMessages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollAreaRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 500);
  };

  // 🔥 Ajustado para React Native
  useEffect(() => {
    if (!scrollAreaRef.current) return;

    const latestMessage = messages[0];

    if (latestMessage && incomingMessage) {
      const isLatestMessageIncoming =
        latestMessage.id === incomingMessage.data.id;

      if (isLatestMessageIncoming) {
        // Nova mensagem recebida, rolar para o final
        scrollToBottom();
        setIncomingMessage(null);
        return;
      }
    }
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setMessage("");

    // const offlineId = crypto.randomUUID();

    // if (!online) {
    //   const offlineMessage: GetChatMessages200DataItem = {
    //     id: offlineId,
    //     chatId: selectedChat?.id as string,
    //     user: {
    //       id: user?.id as string,
    //       name: user?.name as string,
    //       avatarUrl: user?.avatarUrl || null,
    //     },
    //     file: "",
    //     messageType: SendMessageBodyMessageType.TEXT,
    //     createdAt: new Date().toISOString(),
    //     content: message,
    //     status: "PENDING",
    //   };
    //   await connectDatabase.messages.insert(offlineMessage);
    //   return;
    // }

    return await sendMessage({
      id: selectedChatId,
      data: {
        content: message,
        messageType: SendMessageBodyMessageType.TEXT,
        user: {
          id: userInfo?.data.id as string,
          name: userInfo?.data.name as string,
          avatarUrl: userInfo?.data.avatarUrl || null,
        },
        platform: SendMessageBodyPlatform.APP,
      },
    });
  };

  return {
    handleSendMessage,
    setMessage,
    message,
    messages,
    isFetching,
    scrollAreaRef,
    messagesEndRef,
    contentHeightRef,
    setPage,
    chatMessages,
    prevScrollHeightRef,
    scrollToBottom,
    isPending,
  };
}
