import { LinkifyText } from "@/src/components/linkify-text";
import { Typography } from "@/src/components/ui/typography";
import {
  GetChatMessages200DataItem,
  GetChatMessages200DataItemMessageType,
} from "@/src/http/generated/api.schemas";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { DocumentViewerModal } from "../modals/document-preview-modal";

export default function MessageDocument({
  message,
  isCurrentUser,
  messageTime,
}: {
  message: GetChatMessages200DataItem;
  isCurrentUser: boolean;
  messageTime: string;
}) {
  const [viewerOpen, setViewerOpen] = useState(false);

  const hasDocument = !!message.file;
  const hasText = !!message.content;

  // Extrai o nome do arquivo da URL ou usa um padrão
  const getFileName = (): string => {
    if (!message.file) return "Documento";

    try {
      const url = new URL(message.file);
      const pathParts = url.pathname.split("/");
      const fileName = pathParts[pathParts.length - 1];
      return decodeURIComponent(fileName) || "Documento";
    } catch {
      return "Documento";
    }
  };

  // Determina a extensão do arquivo
  const getFileExtension = (): string => {
    const fileName = getFileName();
    const parts = fileName.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "DOC";
  };

  // Determina o ícone baseado na extensão
  const getDocumentIcon = (): string => {
    const ext = getFileExtension().toLowerCase();

    if (ext === "pdf") return "picture-as-pdf";
    if (["doc", "docx"].includes(ext)) return "description";
    if (["xls", "xlsx"].includes(ext)) return "table-chart";
    if (["ppt", "pptx"].includes(ext)) return "slideshow";
    if (["txt"].includes(ext)) return "text-snippet";
    return "insert-drive-file";
  };

  // Cor do ícone baseado na extensão
  const getIconColor = (): string => {
    const ext = getFileExtension().toLowerCase();

    if (ext === "pdf") return "#EF4444"; // red
    if (["doc", "docx"].includes(ext)) return "#3B82F6"; // blue
    if (["xls", "xlsx"].includes(ext)) return "#10B981"; // green
    if (["ppt", "pptx"].includes(ext)) return "#F97316"; // orange
    return "#6B7280"; // gray
  };

  const openDocument = () => {
    setViewerOpen(true);
  };

  const closeDocument = () => {
    setViewerOpen(false);
  };

  // Formata o tamanho do arquivo (placeholder - você pode calcular o tamanho real se disponível)
  const fileSize = "PDF"; // Substitua por tamanho real se disponível

  return (
    <View
      className={`w-[75%] mb-2 ${isCurrentUser ? "self-end" : "self-start"}`}
    >
      {/* ==========================
          BOLHA UNIFICADA
      =========================== */}
      <View
        className={`rounded-2xl overflow-hidden ${
          isCurrentUser
            ? "bg-primary rounded-tr-none"
            : "bg-white rounded-tl-none"
        }`}
      >
        {/* Card do Documento */}
        {hasDocument && (
          <TouchableOpacity
            onPress={openDocument}
            activeOpacity={0.7}
            className={`flex-row items-center p-3 ${
              hasText ? "border-b" : ""
            } ${isCurrentUser ? "border-white/20" : "border-gray-200"}`}
          >
            {/* Ícone do Documento */}
            <View
              className="w-12 h-12 rounded-lg items-center justify-center"
              style={{
                backgroundColor: isCurrentUser
                  ? "rgba(255,255,255,0.2)"
                  : "#F3F4F6",
              }}
            >
              <MaterialIcons
                name={getDocumentIcon() as any}
                size={28}
                color={isCurrentUser ? "white" : getIconColor()}
              />
            </View>

            {/* Info do Documento */}
            <View className="flex-1 ml-3 mr-2">
              <Typography
                variant="body"
                className={`font-medium ${
                  isCurrentUser ? "text-white" : "text-gray-800"
                }`}
                numberOfLines={1}
              >
                {getFileName()}
              </Typography>
              <Typography
                variant="small"
                className={`${
                  isCurrentUser ? "text-white/70" : "text-gray-500"
                }`}
              >
                {fileSize}
              </Typography>
            </View>

            {/* Ícone de Download/Visualizar */}
            <MaterialIcons
              name="open-in-new"
              size={20}
              color={isCurrentUser ? "white" : COLORS.primary.DEFAULT}
            />
          </TouchableOpacity>
        )}

        {/* Texto dentro da bolha */}
        {hasText && (
          <View className="px-3 py-2.5">
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
            </View>
          </View>
        )}

        {/* Se só tem documento (sem texto), coloca o horário embaixo do card */}
        {hasDocument && !hasText && (
          <View className="px-3 pb-2 flex-row justify-end">
            <Typography
              variant="small"
              className={`${isCurrentUser ? "text-white/70" : "text-gray-400"}`}
            >
              {messageTime}
            </Typography>
            {isCurrentUser && (
              <Typography variant="small" className="text-white/70 ml-1">
                ✓✓
              </Typography>
            )}
          </View>
        )}
      </View>

      {/* ==========================
          DOCUMENT VIEWER MODAL
      =========================== */}
      {hasDocument && (
        <DocumentViewerModal
          visible={viewerOpen}
          attachment={{
            uri: message.file as string,
            name: getFileName(),
            type: GetChatMessages200DataItemMessageType.DOCUMENT,
          }}
          onClose={closeDocument}
        />
      )}
    </View>
  );
}
