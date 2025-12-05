import { GetChatMessages200DataItemMessageType } from "@/src/http/generated/api.schemas";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { AttachmentModal } from "../onboarding/components/activities/components/attachment-modal";
import { AttachmentPreview } from "./attachment-preview";
import { Attachment } from "./hooks/use-attachments-hook";
import { UseAudioRecorderHookReturn } from "./hooks/use-audio-hook";

export default function ChatInput({
  message,
  setMessage,
  handleSendMessage,
  attachment,
  onPickImage,
  onPickVideo,
  onPickDocument,
  onRemoveAttachment,
  isPendingSendFile,
  isPendingSendMessage,
  audioRecorderHook,
}: {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (message: string, attachment?: Attachment) => void;
  attachment: Attachment | null;
  onPickImage: () => void;
  onPickVideo: () => void;
  onPickDocument: () => void;
  onRemoveAttachment: () => void;
  isPendingSendFile: boolean;
  isPendingSendMessage: boolean;
  audioRecorderHook: UseAudioRecorderHookReturn;
}) {
  const { recorderState, record, stopRecording } = audioRecorderHook;

  const [modalVisible, setModalVisible] = useState(false);

  const handleAttachmentAction = (action: () => void) => {
    action();
    setModalVisible(false);
  };

  const send = () => {
    handleSendMessage(message, attachment || undefined);
    setMessage("");
  };

  const getAttachmentIcon = () => {
    if (!attachment) return "attach-file";
    switch (attachment.type) {
      case GetChatMessages200DataItemMessageType.IMAGE:
        return "image";
      case GetChatMessages200DataItemMessageType.VIDEO:
        return "videocam";
      case GetChatMessages200DataItemMessageType.DOCUMENT:
        return "description";
      default:
        return "attach-file";
    }
  };

  return (
    <View className="bg-white border-t border-gray-200 px-6 py-4">
      <AttachmentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onPickImage={() => handleAttachmentAction(onPickImage)}
        onPickVideo={() => handleAttachmentAction(onPickVideo)}
        onPickDocument={() => handleAttachmentAction(onPickDocument)}
      />

      {/* Preview de Anexo usando AttachmentPreview */}
      {attachment && (
        <View className="mb-3">
          <AttachmentPreview
            attachment={attachment}
            onRemove={onRemoveAttachment}
            size="large"
            isPending={isPendingSendFile}
          />
        </View>
      )}

      <View className="flex-row gap-3 items-center">
        <TouchableOpacity
          disabled={isPendingSendMessage || isPendingSendFile}
          className="p-2 disabled:opacity-50"
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons
            name={getAttachmentIcon()}
            size={24}
            color={attachment ? COLORS.primary.DEFAULT : COLORS.mutedForeground}
          />
        </TouchableOpacity>

        <View className="flex-1 border border-input bg-gray-100 rounded-xl px-4">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={COLORS.mutedForeground}
            className="flex-1 text-sm py-3"
            multiline
            maxLength={2000}
          />
        </View>

        {(message.trim() || !!attachment) && (
          <TouchableOpacity
            onPress={send}
            disabled={
              (message.trim() === "" && !attachment) ||
              isPendingSendMessage ||
              isPendingSendFile
            }
            className="p-3 rounded-full bg-primary disabled:bg-gray-300"
          >
            <MaterialIcons name="send" size={20} color="white" />
          </TouchableOpacity>
        )}

        {!message.trim() && !attachment && (
          <>
            {recorderState.isRecording && (
              <TouchableOpacity
                onPress={stopRecording}
                disabled={isPendingSendMessage || isPendingSendFile}
                className="p-3 rounded-full bg-destructive disabled:bg-gray-300"
              >
                <MaterialIcons name="stop" size={20} color="white" />
              </TouchableOpacity>
            )}
            {!recorderState.isRecording && (
              <TouchableOpacity
                onPress={record}
                disabled={isPendingSendMessage || isPendingSendFile}
                className="p-3 rounded-full bg-primary disabled:bg-gray-300"
              >
                <MaterialIcons name="mic" size={20} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}
