import { AmbulanceStatus, STATUS_ORDER } from "@/src/@types/ambulance-status";
import { ModalWrapper } from "@/src/components/modal-wrapper";
import { Button } from "@/src/components/ui/button";
import { Typography } from "@/src/components/ui/typography";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { FlatList, View } from "react-native";
import { StatusListItem } from "./status-list-item";

interface StatusModallProps {
  visible: boolean;
  onSave: (selectedStatus: AmbulanceStatus) => void;
  onClose: () => void;
}

export const StatusModal: React.FC<StatusModallProps> = ({
  visible,
  onSave,
  onClose,
}) => {
  const handleSave = (selectedStatus: AmbulanceStatus) => {
    onSave(selectedStatus);
    onClose();
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title="Selecionar Status da Ambulância"
      icon={
        <View className="relative">
          <View className="absolute inset-0 bg-primary-200/30 rounded-full scale-110" />
          <View className="p-6 rounded-full bg-primary-200/50">
            <MaterialIcons
              name="bookmark"
              size={40}
              color={COLORS.primary.DEFAULT}
            />
          </View>
        </View>
      }
      footer={
        <View className="gap-3">
          <Button variant="primary" title="Fechar" onPress={onClose} />
        </View>
      }
    >
      {/* TEXTO */}
      <View className="mb-6">
        <Typography
          variant="body"
          tone="muted"
          className="text-center leading-6"
        >
          Escolha o status atual da sua ambulância para continuar.
        </Typography>
      </View>

      {/* LISTA DE STATUS */}
      <FlatList
        data={STATUS_ORDER.filter(
          (status) =>
            status !== AmbulanceStatus.FA && status !== AmbulanceStatus.MN
        )}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <StatusListItem
            status={item as AmbulanceStatus}
            onSelect={handleSave}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-[1px] bg-gray-100" />}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      />
    </ModalWrapper>
  );
};
