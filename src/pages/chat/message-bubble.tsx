import { Typography } from "@/src/components/ui/typography";
import {
  GetChatMessages200DataItem,
  GetChatMessages200DataItemMessageType,
} from "@/src/http/generated/api.schemas";
import { format } from "date-fns";
import React, { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import MessageAudio from "./messages/message-audio";
import MessageDocument from "./messages/message-document";
import MessageImageText from "./messages/message-image";
import MessageText from "./messages/message-text";
import MessageVideo from "./messages/message-video";
import ResendWrapper from "./resend-wrapper";

interface MessageBubbleProps {
  message: GetChatMessages200DataItem;
  isCurrentUser: boolean;
  onResend: (msg: GetChatMessages200DataItem) => void;
  onDelete: (msg: GetChatMessages200DataItem) => void;
  online: boolean;
}

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  onResend,
  onDelete,
  online,
}) => {
  // Memoriza o texto do avatar
  const avatarText = useMemo(() => {
    return message.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [message.user.name]);

  // Memoriza a hora formatada da mensagem
  const messageTime = useMemo(() => {
    return format(new Date(message.createdAt), "HH:mm");
  }, [message.createdAt]);

  return (
    <View className={`mb-4 ${isCurrentUser ? "items-end" : "items-start"}`}>
      {/* User name (tiny) */}
      {!isCurrentUser && (
        <Typography
          variant="superSmall"
          className="mb-1"
          tone="muted"
          weight="light"
        >
          {message.user.name}
        </Typography>
      )}

      <View
        className={`flex-row gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
      >
        {/* Avatar */}
        {!isCurrentUser && (
          <TouchableOpacity activeOpacity={0.7}>
            <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
              <Typography variant="body" weight="bold" className="text-white">
                {avatarText}
              </Typography>
            </View>
          </TouchableOpacity>
        )}

        <ResendWrapper
          isCurrentUser={isCurrentUser}
          message={message}
          onResend={onResend}
          onDelete={onDelete}
          online={online}
        >
          {/* Message Content */}
          {message.messageType ===
            GetChatMessages200DataItemMessageType.TEXT && (
            <MessageText
              isCurrentUser={isCurrentUser}
              message={message}
              messageTime={messageTime}
            />
          )}
          {message.messageType ===
            GetChatMessages200DataItemMessageType.IMAGE && (
            <MessageImageText
              isCurrentUser={isCurrentUser}
              message={message}
              messageTime={messageTime}
            />
          )}
          {message.messageType ===
            GetChatMessages200DataItemMessageType.AUDIO && (
            <MessageAudio
              isCurrentUser={isCurrentUser}
              message={message}
              messageTime={messageTime}
            />
          )}
          {message.messageType ===
            GetChatMessages200DataItemMessageType.VIDEO && (
            <MessageVideo
              isCurrentUser={isCurrentUser}
              message={message}
              messageTime={messageTime}
            />
          )}
          {message.messageType ===
            GetChatMessages200DataItemMessageType.DOCUMENT && (
            <MessageDocument
              isCurrentUser={isCurrentUser}
              message={message}
              messageTime={messageTime}
            />
          )}
        </ResendWrapper>
      </View>
    </View>
  );
};

// Memo para evitar re-renders desnecessários
export const MessageBubble = React.memo(
  MessageBubbleComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.isCurrentUser === nextProps.isCurrentUser
    );
  }
);
