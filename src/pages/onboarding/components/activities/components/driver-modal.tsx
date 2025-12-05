import { ModalWrapper } from "@/src/components/modal-wrapper";
import { Button } from "@/src/components/ui/button";
import { Typography } from "@/src/components/ui/typography";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TextInput, View } from "react-native";

interface DriverModalProps {
  visible: boolean;
  onAssociate: (driverName: string) => void;
  onClose: () => void;
}

export const DriverModal: React.FC<DriverModalProps> = ({
  visible,
  onAssociate,
  onClose,
}) => {
  const [driverName, setDriverName] = useState("");

  const canSave = driverName.trim().length >= 3;

  const handleAssociate = () => {
    if (canSave) {
      onAssociate(driverName.trim());
      setDriverName("");
      onClose();
    }
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      maxHeightPct={90}
      icon={
        <View className="items-center mb-6">
          <View className="relative">
            <View className="absolute inset-0 bg-primary-200/30 rounded-full scale-110" />
            <View className="p-6 rounded-full bg-primary-200/50">
              <MaterialIcons
                name="badge"
                size={40}
                color={COLORS.primary.DEFAULT}
              />
            </View>
          </View>
        </View>
      }
      footer={
        <View className="gap-3">
          <Button
            title="Associar Motorista"
            onPress={handleAssociate}
            disabled={!canSave}
          />
          <Button variant="secondary" title="Cancelar" onPress={onClose} />
        </View>
      }
    >
      {/* HANDLE */}
      <View className="pt-4 pb-2 items-center">
        <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
      </View>

      {/* TÍTULO + DESCRIÇÃO */}
      <View className="mb-6">
        <Typography variant="title" weight="bold" className="mb-3 text-center">
          Associar Motorista
        </Typography>
        <Typography
          variant="body"
          tone="muted"
          className="text-center leading-6"
        >
          Informe o nome do motorista para vincular ao seu perfil
        </Typography>
      </View>

      {/* CAMPO DE NOME */}
      <View className="gap-4 mb-8">
        <View>
          <Typography variant="small" weight="semibold" className="mb-2">
            Nome do Motorista
          </Typography>
          <View className="bg-gray-100 rounded-xl px-4 py-4 flex-row items-center">
            <MaterialIcons
              name="person"
              size={20}
              color={COLORS.mutedForeground}
            />
            <TextInput
              value={driverName}
              onChangeText={setDriverName}
              placeholder="Digite o nome completo"
              className="flex-1 ml-3 text-base"
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* INFO */}
        <View className="bg-amber-50 rounded-xl px-4 py-3 flex-row gap-2">
          <MaterialIcons
            name="info-outline"
            size={16}
            color={COLORS.warning.DEFAULT}
          />
          <Typography
            variant="extraSmall"
            className="text-amber-900 flex-1 leading-5"
          >
            O motorista receberá uma notificação sobre a associação
          </Typography>
        </View>
      </View>
    </ModalWrapper>
  );
};
