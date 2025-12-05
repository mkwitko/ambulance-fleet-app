import { GetChatMessages200DataItemMessageType } from "@/src/http/generated/api.schemas";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Attachment } from "./hooks/use-attachments-hook";
import { DocumentViewerModal } from "./modals/document-preview-modal";
import { ImageViewerModal } from "./modals/image-viewer-modal";
import { VideoPlayerModal } from "./modals/video-preview-modal";

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove: () => void;
  size?: "small" | "medium" | "large";
  isPending?: boolean;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachment,
  onRemove,
  size = "medium",
  isPending,
}) => {
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [videoPlayerVisible, setVideoPlayerVisible] = useState(false);
  const [documentViewerVisible, setDocumentViewerVisible] = useState(false);

  const handlePress = () => {
    if (isPending) return; // bloquear interação enquanto está pendente
    switch (attachment.type) {
      case GetChatMessages200DataItemMessageType.IMAGE:
        setImageViewerVisible(true);
        break;
      case GetChatMessages200DataItemMessageType.VIDEO:
        setVideoPlayerVisible(true);
        break;
      case GetChatMessages200DataItemMessageType.DOCUMENT:
        setDocumentViewerVisible(true);
        break;
    }
  };

  const getDimensions = () => {
    switch (size) {
      case "small":
        return { width: 60, height: 60 };
      case "medium":
        return { width: 120, height: 120 };
      case "large":
        return { width: "100%", height: 200 };
      default:
        return { width: 120, height: 120 };
    }
  };

  const dimensions = getDimensions();

  return (
    <>
      <View className="relative">
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          {attachment.type === GetChatMessages200DataItemMessageType.IMAGE ? (
            <Image
              source={{ uri: attachment.uri }}
              style={{
                width: dimensions.width as number,
                height: dimensions.height as number,
                borderRadius: 12,
              }}
              resizeMode="cover"
            />
          ) : attachment.type ===
            GetChatMessages200DataItemMessageType.VIDEO ? (
            <View
              className="bg-gray-900 rounded-xl items-center justify-center relative"
              style={{
                width: dimensions.width as number,
                height: dimensions.height as number,
              }}
            >
              <Image
                source={{ uri: attachment.uri }}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 12,
                }}
                resizeMode="cover"
              />
              <View className="absolute">
                <MaterialIcons
                  name="play-circle-filled"
                  size={size === "small" ? 32 : 48}
                  color="white"
                />
              </View>
            </View>
          ) : (
            <View
              className="bg-gray-100 rounded-xl items-center justify-center p-3"
              style={{
                width: dimensions.width as number,
                height: dimensions.height,
              }}
            >
              <MaterialIcons
                name="description"
                size={size === "small" ? 28 : 40}
                color={COLORS.primary.DEFAULT}
              />
              {size !== "small" && attachment.name && (
                <Text
                  className="text-xs text-gray-600 text-center mt-2"
                  numberOfLines={2}
                >
                  {attachment.name}
                </Text>
              )}
            </View>
          )}

          {/* Overlay de carregamento */}
          {isPending && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: dimensions.width as number,
                height: dimensions.height,
                backgroundColor: "rgba(0,0,0,0.4)",
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator size="large" color="white" />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRemove}
          disabled={isPending}
          className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 shadow-lg disabled:opacity-50"
        >
          <MaterialIcons name="close" size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modals */}
      {attachment.type === GetChatMessages200DataItemMessageType.IMAGE && (
        <ImageViewerModal
          visible={imageViewerVisible}
          imageUri={attachment.uri}
          onClose={() => setImageViewerVisible(false)}
        />
      )}

      {attachment.type === GetChatMessages200DataItemMessageType.VIDEO && (
        <VideoPlayerModal
          visible={videoPlayerVisible}
          videoUri={attachment.uri}
          onClose={() => setVideoPlayerVisible(false)}
        />
      )}

      {attachment.type === GetChatMessages200DataItemMessageType.DOCUMENT && (
        <DocumentViewerModal
          visible={documentViewerVisible}
          attachment={attachment}
          onClose={() => setDocumentViewerVisible(false)}
        />
      )}
    </>
  );
};
