import { LinkifyText } from "@/src/components/linkify-text";
import { Typography } from "@/src/components/ui/typography";
import { GetChatMessages200DataItem } from "@/src/http/generated/api.schemas";
import { cn } from "@/src/lib/utils";
import React, { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { ImageViewerModal } from "../modals/image-viewer-modal";

export default function MessageImageText({
  message,
  isCurrentUser,
  messageTime,
}: {
  message: GetChatMessages200DataItem;
  isCurrentUser: boolean;
  messageTime: string;
}) {
  const [fullscreen, setFullscreen] = useState(false);

  const openFullscreen = () => setFullscreen(true);
  const closeFullscreen = () => setFullscreen(false);

  const hasImage = !!message.file;
  const hasText = !!message.content;

  return (
    <View
      className={`max-w-[75%] mb-2 ${
        isCurrentUser ? "self-end" : "self-start"
      }`}
    >
      {/* ==========================
          BOLHA UNIFICADA
      =========================== */}
      <View
        className={`rounded-2xl overflow-hidden p-1 ${
          isCurrentUser
            ? "bg-primary rounded-tr-none"
            : "bg-white rounded-tl-none"
        }`}
      >
        {/* Imagem dentro da bolha */}
        {hasImage && (
          <TouchableOpacity
            onPress={openFullscreen}
            activeOpacity={0.8}
            className="overflow-hidden"
          >
            <Image
              source={{ uri: message.file as string }}
              className={cn(
                "rounded-2xl",
                isCurrentUser
                  ? hasText
                    ? "rounded-b-none rounded-tr-none"
                    : "rounded-tr-none"
                  : hasText
                  ? "rounded-b-none rounded-tl-none"
                  : "rounded-tl-none"
              )}
              style={{
                width: 240,
                height: 240,
                resizeMode: "cover",
              }}
            />
          </TouchableOpacity>
        )}

        {/* Texto dentro da bolha */}
        {hasText && (
          <View className={`px-3 ${hasImage ? "py-2" : "py-2.5"}`}>
            <LinkifyText
              variant="body"
              className={isCurrentUser ? "text-white" : "text-gray-800"}
              linkClassName={
                isCurrentUser
                  ? "text-white underline"
                  : "text-blue-600 underline"
              }
            >
              {message.content as string}
            </LinkifyText>

            {/* Hora inline no canto direito (estilo WhatsApp) */}
            <View className="flex-row justify-end items-center mt-1">
              <Typography variant="small" className="text-gray-400">
                {messageTime}
              </Typography>

              {/* Ícone de status (apenas para mensagens do usuário) */}
              {/* {isCurrentUser && (
                <View className="ml-1">
                  <Typography variant="small" className="text-blue-500">
                    ✓✓
                  </Typography>
                </View>
              )} */}
            </View>
          </View>
        )}

        {/* Se só tem imagem (sem texto), coloca o horário no canto inferior */}
        {hasImage && !hasText && (
          <View className="absolute bottom-2 right-2 bg-black/50 px-2 py-0.5 rounded-full flex-row items-center">
            <Typography variant="small" className="text-white text-[11px]">
              {messageTime}
            </Typography>
            {isCurrentUser && (
              <Typography variant="small" className="text-white ml-1">
                ✓✓
              </Typography>
            )}
          </View>
        )}
      </View>

      {/* ==========================
          FULLSCREEN VIEWER
      =========================== */}
      {hasImage && (
        <ImageViewerModal
          visible={fullscreen}
          imageUri={message.file as string}
          onClose={closeFullscreen}
        />
      )}
    </View>
  );
}
