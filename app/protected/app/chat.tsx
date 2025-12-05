import { AblyEvents } from "@/src/@types/ably-events";
import KeyboardSpacer from "@/src/components/keyboard-spacer";
import { GetChatMessages200DataItem } from "@/src/http/generated/api.schemas";
import { AudioRecordingPreview } from "@/src/pages/chat/audio-recording-preview";
import ChatInput from "@/src/pages/chat/chat-input";
import { ChatOverlay } from "@/src/pages/chat/chat-overlay";
import {
  Attachment,
  useAttachmentPicker,
} from "@/src/pages/chat/hooks/use-attachments-hook";
import { useAudioRecorderHook } from "@/src/pages/chat/hooks/use-audio-hook";
import useFileHook from "@/src/pages/chat/hooks/use-file-hook";
import useMessageHook from "@/src/pages/chat/hooks/use-messages-hook";
import { realtTimeUpdateChatMessage } from "@/src/pages/chat/hooks/use-realtime-update-messages";
import useRealTimeUpdateReadAtMessagesHook from "@/src/pages/chat/hooks/use-realtime-update-read-at-messages";
import { MessageBubble } from "@/src/pages/chat/message-bubble";
import RecordingChatInput from "@/src/pages/chat/recording-chat-input";
import useAbly from "@/src/services/use-ably";
import { InboundMessage } from "ably";
import { useRef, useState } from "react";
import { FlatList, View, ViewToken } from "react-native";

export default function Chat() {
  const [messages, setMessages] = useState<GetChatMessages200DataItem[]>([]);
  const [currentDateOnScreen, setCurrentDateOnScreen] = useState<string | null>(
    null
  );
  const [incomingMessage, setIncomingMessage] = useState<InboundMessage | null>(
    null
  );

  const { user } = useAbly({
    events: [AblyEvents.messages, AblyEvents.status, AblyEvents.readChat],
    handleMessageReceived: (message) => {
      setIncomingMessage(message);

      if (message.name === AblyEvents.messages) {
        // Atualiza a lista de mensagens em tempo real
        realtTimeUpdateChatMessage({
          incomingMessage: message,
          selectedChatId: user?.data.ambulance?.chats[0].id as string,
          setMessages,
        });

        // Marca a mensagem como lida em tempo real
        markChatAsRead({
          incomingMessage: message,
        });
      }
    },
  });

  const { markChatAsRead } = useRealTimeUpdateReadAtMessagesHook({
    user,
  });

  const { attachment, pickImage, pickVideo, pickDocument, removeAttachment } =
    useAttachmentPicker();

  const {
    handleSendMessage,
    isPending,
    setMessage,
    message,
    isFetching,
    scrollAreaRef,
    setPage,
    chatMessages,
  } = useMessageHook({
    selectedChatId: user?.data.ambulance?.chats[0].id as string,
    user: user?.data,
    online: true,
    messages,
    setMessages,
    incomingMessage,
    setIncomingMessage,
  });

  const { handleSendFile, isLoading } = useFileHook({
    selectedChatId: user?.data.ambulance?.chats[0].id as string,
    user: user?.data,
    setMessage,
    setAttachment: removeAttachment,
  });

  const audioRecorderHook = useAudioRecorderHook({
    selectedChatId: user?.data.ambulance?.chats[0].id as string,
    user: user?.data,
  });
  const {
    audioRecorder,
    recorderState,
    cancelRecording,
    handleSendAudioMessage,
    recordedUri,
    isLoading: isLoadingAudio,
  } = audioRecorderHook;

  // Função que será chamada quando os itens visíveis mudarem
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length === 0) return;

      // Como a lista está invertida (inverted), o primeiro item visível é o mais recente
      const lastVisibleMessage = viewableItems[0]
        .item as GetChatMessages200DataItem;

      if (lastVisibleMessage?.createdAt) {
        // Formate a data como quiser, aqui só convertendo para string simples
        const dateString = new Date(
          lastVisibleMessage.createdAt
        ).toLocaleDateString();
        setCurrentDateOnScreen(dateString);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // Considera o item visível se 50% dele estiver na tela
  }).current;

  const onSendMessage = async (message: string, attachment?: Attachment) => {
    if (!attachment) {
      await handleSendMessage(message);
      return;
    }

    await handleSendFile(message, attachment);
  };

  return (
    <View className="flex-1">
      {/* LISTA DE MENSAGENS */}
      <FlatList
        ref={scrollAreaRef}
        data={messages}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isCurrentUser={item.user?.id === user?.data.id}
          />
        )}
        keyExtractor={(item) => item.id}
        className="flex-1 px-6"
        inverted
        onEndReachedThreshold={0.1}
        onEndReached={() => {
          if (chatMessages?.pagination.hasNextPage && !isFetching) {
            setPage((prev) => prev + 1);
          }
        }}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <ChatOverlay
        isFetching={isFetching}
        currentDateOnScreen={currentDateOnScreen}
      />

      {/* INPUT FIXO INFERIOR */}
      {recorderState.isRecording && (
        <RecordingChatInput audioRecorderHook={audioRecorderHook} />
      )}
      {!recorderState.isRecording && !!recordedUri && (
        <AudioRecordingPreview
          audioRecorderHook={audioRecorderHook}
          onSend={() => {
            handleSendAudioMessage(audioRecorder);
          }}
          onCancel={cancelRecording}
          isPending={isLoadingAudio}
        />
      )}
      {!recorderState.isRecording && !recordedUri && (
        <ChatInput
          message={message}
          setMessage={setMessage}
          handleSendMessage={onSendMessage}
          attachment={attachment}
          onPickImage={pickImage}
          onPickVideo={pickVideo}
          onPickDocument={pickDocument}
          onRemoveAttachment={removeAttachment}
          isPendingSendFile={isLoading}
          isPendingSendMessage={isPending}
          audioRecorderHook={audioRecorderHook}
        />
      )}

      <KeyboardSpacer />
    </View>
  );
}
