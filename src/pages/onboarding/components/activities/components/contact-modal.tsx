import KeyboardSpacer from "@/src/components/keyboard-spacer";
import { ModalWrapper } from "@/src/components/modal-wrapper";
import { Button } from "@/src/components/ui/button";
import { Typography } from "@/src/components/ui/typography";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { TextInput, View } from "react-native";

interface ContactModalProps {
  visible: boolean;
  onSave: (ddd: string, phone: string) => void;
  onClose: () => void;
  contact: string | undefined;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  visible,
  onSave,
  onClose,
  contact,
}) => {
  const [phoneComplete, setPhoneComplete] = useState("");

  const formatPhoneComplete = (text: string): string => {
    const numbers = text.replace(/\D/g, "");

    if (numbers.length > 11) return phoneComplete;

    if (numbers.length === 0) return "";
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;

    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
      7,
    )}`;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneComplete(text);
    setPhoneComplete(formatted);
  };

  const extractDDDAndPhone = () => {
    const numbers = phoneComplete.replace(/\D/g, "");
    if (numbers.length !== 11) return { ddd: "", phone: "" };

    const ddd = numbers.slice(0, 2);
    const phone = numbers.slice(2);

    return { ddd, phone };
  };

  const { ddd, phone } = extractDDDAndPhone();
  const phoneNumbers = phoneComplete.replace(/\D/g, "");
  const canSave = phoneNumbers.length === 11;

  const handleSave = () => {
    if (canSave) {
      onSave(ddd, phone);
      setPhoneComplete("");
    }
  };

  const handleCloseModal = () => {
    setPhoneComplete("");
    onClose();
  };

  useEffect(() => {
    if (!contact) return;

    let raw = contact || "";
    raw = raw.replace(/^\+55/, "");
    raw = raw.replace(/[\s()-]/g, "");

    handlePhoneChange(raw);
  }, [contact]);

  return (
    <ModalWrapper
      visible={visible}
      onClose={handleCloseModal}
      title="Adicionar Contato da Central"
      icon={
        <View className="relative">
          <View className="absolute inset-0 bg-primary-200/30 rounded-full scale-110" />
          <View className="p-6 rounded-full bg-primary-200/50">
            <MaterialIcons
              name="phone-iphone"
              size={40}
              color={COLORS.primary.DEFAULT}
            />
          </View>
        </View>
      }
      footer={
        <View className="gap-3">
          <Button
            title={!!contact ? "Atualizar Contato" : "Adicionar Contato"}
            onPress={handleSave}
            disabled={!canSave}
          />
          <Button
            variant="secondary"
            title="Cancelar"
            onPress={handleCloseModal}
          />
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
          Informe o número do celular da central
        </Typography>
      </View>

      {/* CAMPO DE TELEFONE */}
      <View className="gap-4 mb-8">
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Typography variant="extraSmall" weight="semibold">
              Celular com DDD
            </Typography>

            {phoneNumbers.length > 0 && phoneNumbers.length < 11 && (
              <Typography
                variant="extraSmall"
                className="text-primary font-semibold"
              >
                {phoneNumbers.length}/11
              </Typography>
            )}
          </View>

          <View className="bg-gray-100 rounded-xl px-4 py-4 flex-row items-center">
            <MaterialIcons
              name="phone-android"
              size={20}
              color={COLORS.mutedForeground}
            />
            <TextInput
              value={phoneComplete}
              onChangeText={handlePhoneChange}
              placeholder="(00) 00000-0000"
              keyboardType="number-pad"
              returnKeyType="done"
              className="flex-1 ml-3 text-base font-medium"
              placeholderTextColor={COLORS.mutedForeground}
            />
            {canSave && (
              <MaterialIcons
                name="check-circle"
                size={20}
                color={COLORS.success.DEFAULT}
              />
            )}
          </View>
        </View>

        {/* PREVIEW */}
        {canSave && (
          <View className="bg-primary-50 rounded-xl px-4 py-3 border border-primary-100">
            <View className="flex-row items-center gap-2 mb-2">
              <MaterialIcons
                name="check-circle"
                size={16}
                color={COLORS.success.DEFAULT}
              />
              <Typography
                variant="small"
                className="text-primary-700 font-semibold"
              >
                Número completo!
              </Typography>

              <View className="bg-primary-100 rounded-lg px-2 py-1">
                <Typography
                  variant="extraSmall"
                  weight="semibold"
                  className="text-primary-700"
                >
                  DDD {ddd}
                </Typography>
              </View>

              <View className="bg-primary-100 rounded-lg px-2 py-1">
                <Typography
                  variant="extraSmall"
                  weight="semibold"
                  className="text-primary-700"
                >
                  📱 Celular
                </Typography>
              </View>
            </View>

            <Typography variant="small" weight="semibold">
              Tudo certo para adicionar o contato: {phoneComplete}
            </Typography>
          </View>
        )}

        {/* DICA */}
        {!phoneComplete && (
          <View className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
            <View className="flex-row items-center gap-2 mb-2">
              <MaterialIcons
                name="lightbulb-outline"
                size={18}
                color={COLORS.mutedForeground}
              />
              <Typography variant="small" weight="semibold" tone="muted">
                Como digitar
              </Typography>
            </View>

            <Typography variant="extraSmall" tone="muted" className="ml-6">
              Digite apenas números. A formatação é automática.
            </Typography>
            <Typography variant="extraSmall" tone="muted" className="ml-6 mt-1">
              Exemplo: 48999887766 vira (48) 99988-7766
            </Typography>
          </View>
        )}
      </View>

      <KeyboardSpacer />
    </ModalWrapper>
  );
};
