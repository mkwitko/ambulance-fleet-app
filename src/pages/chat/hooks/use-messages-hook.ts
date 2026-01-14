import useDatabase from "@/src/hooks/use-database";
import {
  GetAuthenticatedUserAmbulance200Data,
  GetChatMessages200DataItem,
  GetChatMessages200DataItemPlatform,
  GetChatMessages200DataItemStatus,
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
import * as Crypto from "expo-crypto";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import Toast from "react-native-toast-message";

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

  const {
    insertMessage,
    convertDatabaseToReturnObject,
    loadMessagesByChat,
    ready,
  } = useDatabase();

  const handleLoadOfflineMessagesByChat = async () => {
    if (!selectedChatId) return;

    const offlineMessages = await loadMessagesByChat(selectedChatId);

    return (offlineMessages as GetChatMessages200DataItem[]) || [];
  };

  const prevScrollHeightRef = useRef<number>(0);
  const scrollAreaRef = useRef<FlatList>(null);
  const messagesEndRef = useRef<View>(null);
  const contentHeightRef = useRef(0);

  const { mutateAsync: sendMessage, isPending } = useSendMessage();

  useEffect(() => {
    if (selectedChatId !== messages[0]?.chatId) {
      setMessages([]);
      setPage(1);
      return;
    }
  }, [selectedChatId]);

  // ▶️ Carregar mensagens e fazer merge
  useEffect(() => {
    if (!chatMessages || !ready) return;

    const newMessages = [...chatMessages.data].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // primeira página → substitui
    if (page === 1) {
      handleLoadOfflineMessagesByChat().then((offlineMessages) => {
        const messages = [
          ...(offlineMessages as GetChatMessages200DataItem[]),
          ...newMessages,
        ].sort((a, b) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
        setMessages(messages); // já invertidas
      });

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
    handleLoadOfflineMessagesByChat().then((offlineMessages) => {
      setMessages((prev) => {
        const merged = [
          ...(offlineMessages as GetChatMessages200DataItem[]),
          ...prev,
          ...newMessages,
        ].sort((a, b) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        const map = new Map(merged.map((m) => [m.id, m]));

        return Array.from(map.values());
      });
    });
  }, [chatMessages, ready]);

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

    if (!online) {
      const offlineId = Crypto.randomUUID();
      const offlineMessage = {
        id: offlineId as string,
        selectedChatId: user?.ambulance?.chats[0].id as string,
        content: message,
        userId: user?.id as string,
        userName: userInfo?.data.name as string,
        userAvatarUrl: userInfo?.data.avatarUrl || null,
        messageType: SendMessageBodyMessageType.TEXT,
        retries: 0,
        status: GetChatMessages200DataItemStatus.PENDING,
        createdAt: new Date().toISOString(),
      };
      insertMessage(offlineMessage);
      Toast.show({
        type: "info",
        text1: "Você está offline",
        text2: "Sua mensagem foi adicionada localmente.",
      });
      setMessages((prev) => {
        return [
          convertDatabaseToReturnObject(offlineMessage as any) as any,
          ...prev,
        ];
      });

      scrollToBottom();
      return;
    }

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
