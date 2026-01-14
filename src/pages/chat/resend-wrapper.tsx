// ResendWrapper.tsx
import { ModalWrapper } from "@/src/components/modal-wrapper";
import {
  GetChatMessages200DataItem,
  GetChatMessages200DataItemStatus,
} from "@/src/http/generated/api.schemas";
import { EvilIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ResendWrapperProps {
  isCurrentUser: boolean;
  message: GetChatMessages200DataItem;
  onResend?: (msg: GetChatMessages200DataItem) => void;
  onDelete: (msg: GetChatMessages200DataItem) => void;
  children: React.ReactNode;
  online: boolean;
}

export default function ResendWrapper({
  isCurrentUser,
  message,
  onResend,
  onDelete,
  children,
  online,
}: ResendWrapperProps) {
  const notSent = message.status === GetChatMessages200DataItemStatus.PENDING;
  const [modalAction, setModalAction] = React.useState<
    "resend" | "delete" | null
  >(null);

  const handleResendClick = () => {
    if (online) {
      setModalAction("resend");
    }
  };

  const handleDeleteClick = () => {
    setModalAction("delete");
  };

  const handleConfirmResend = () => {
    onResend && onResend(message);
    setModalAction(null);
  };

  const handleConfirmDelete = () => {
    onDelete(message);
    setModalAction(null);
  };

  const handleCancel = () => {
    setModalAction(null);
  };

  return (
    <>
      <View
        className={`flex-row items-start gap-4 ${
          isCurrentUser ? "justify-end" : "justify-start"
        }`}
      >
        {/* Botões de ação (reenvio e exclusão) */}
        {notSent && isCurrentUser && onResend && (
          <View className="flex-row items-center gap-2">
            {/* Botão de excluir */}
            <View>
              <TouchableOpacity
                onPress={handleDeleteClick}
                className="p-3 rounded-full bg-red-500/70 border border-gray-300 active:bg-red-600 shadow-sm"
                activeOpacity={0.7}
              >
                <EvilIcons name="trash" size={14} color="white" />
              </TouchableOpacity>
            </View>

            {/* Botão de reenviar */}
            <View>
              <TouchableOpacity
                onPress={handleResendClick}
                disabled={!online}
                className={`p-3 rounded-full bg-white/70 border border-gray-300 shadow-sm ${
                  online ? "active:bg-white" : "opacity-50"
                }`}
                activeOpacity={online ? 0.7 : 1}
              >
                <EvilIcons name="refresh" size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Conteúdo da mensagem */}
        <View
          className={`flex-row items-center justify-end ${
            notSent ? "opacity-60" : "opacity-100"
          }`}
        >
          {children}
        </View>
      </View>

      {/* Modal de confirmação de reenvio */}
      <ModalWrapper
        visible={modalAction === "resend"}
        onClose={handleCancel}
        title="Reenviar mensagem"
        maxHeightPct={40}
        footer={
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 py-3 px-4 rounded-xl bg-gray-100 active:bg-gray-200"
              activeOpacity={0.7}
            >
              <Text className="text-center text-gray-700 font-medium text-base">
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirmResend}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-500 active:bg-blue-600"
              activeOpacity={0.7}
            >
              <Text className="text-center text-white font-medium text-base">
                Reenviar
              </Text>
            </TouchableOpacity>
          </View>
        }
      >
        <Text className="text-gray-600 text-base leading-relaxed">
          Deseja tentar reenviar esta mensagem? Ela será enviada novamente para
          o destinatário.
        </Text>
      </ModalWrapper>

      {/* Modal de confirmação de exclusão */}
      <ModalWrapper
        visible={modalAction === "delete"}
        onClose={handleCancel}
        title="Excluir mensagem"
        maxHeightPct={40}
        footer={
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 py-3 px-4 rounded-xl bg-gray-100 active:bg-gray-200"
              activeOpacity={0.7}
            >
              <Text className="text-center text-gray-700 font-medium text-base">
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirmDelete}
              className="flex-1 py-3 px-4 rounded-xl bg-red-500 active:bg-red-600"
              activeOpacity={0.7}
            >
              <Text className="text-center text-white font-medium text-base">
                Excluir
              </Text>
            </TouchableOpacity>
          </View>
        }
      >
        <Text className="text-gray-600 text-base leading-relaxed">
          Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser
          desfeita.
        </Text>
      </ModalWrapper>
    </>
  );
}
