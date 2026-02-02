import { Typography } from "@/src/components/ui/typography";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Animated, Modal, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AttachmentModalProps {
  visible: boolean;
  onClose: () => void;
  onPickImage: () => void;
  onPickVideo: () => void;
  onPickDocument: () => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  visible,
  onClose,
  onPickImage,
  onPickVideo,
  onPickDocument,
}) => {
  const translateY = useState(new Animated.Value(300))[0]; // parte de baixo
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <SafeAreaView className="flex-1">
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={onClose}
            className="absolute inset-0 bg-black/60"
          />

          <Animated.View
            style={{ transform: [{ translateY }] }}
            className="bg-white rounded-t-[32px] overflow-hidden p-6 absolute bottom-0 w-full"
          >
            <Typography variant="title" weight="bold" align="center">
              Anexar Arquivo
            </Typography>
            <Typography
              variant="body"
              tone="muted"
              align="center"
              className="mb-4"
            >
              Escolha o tipo de arquivo para enviar
            </Typography>

            <View className="flex-row justify-around gap-4">
              <TouchableOpacity onPress={onPickImage} className="items-center">
                <View className="p-4 rounded-full bg-gray-100">
                  <MaterialIcons
                    name="image"
                    size={28}
                    color={COLORS.mutedForeground}
                  />
                </View>
                <Typography variant="caption" weight="semibold">
                  Imagem
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity onPress={onPickVideo} className="items-center">
                <View className="p-4 rounded-full bg-gray-100">
                  <MaterialIcons
                    name="videocam"
                    size={28}
                    color={COLORS.mutedForeground}
                  />
                </View>
                <Typography variant="caption" weight="semibold">
                  Vídeo
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onPickDocument}
                className="items-center"
              >
                <View className="p-4 rounded-full bg-gray-100">
                  <MaterialIcons
                    name="description"
                    size={28}
                    color={COLORS.mutedForeground}
                  />
                </View>
                <Typography variant="caption" weight="semibold">
                  Documento
                </Typography>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};
