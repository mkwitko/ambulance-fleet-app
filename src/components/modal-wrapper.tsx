// ModalWrapper.tsx
import useModalAnimationHook from "@/src/hooks/use-modal-animation-hook";
import React from "react";
import {
  Animated,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Typography } from "./ui/typography";

interface ModalWrapperProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  maxHeightPct?: number;
  persistent?: boolean;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  visible,
  onClose,
  children,
  title,
  icon,
  footer,
  maxHeightPct = 90,
  persistent = false,
}) => {
  const { fadeAnim, scaleAnim } = useModalAnimationHook({ visible });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      presentationStyle="overFullScreen"
      onRequestClose={() => {
        if (!persistent) onClose();
      }}
    >
      <Animated.View
        className="flex-1 justify-end"
        style={{ opacity: fadeAnim }}
      >
        <TouchableOpacity
          onPress={() => {
            if (!persistent) onClose();
          }}
          activeOpacity={1}
          className="absolute inset-0 bg-black/60"
        />

        <Animated.View
          className="bg-white rounded-t-[32px] overflow-hidden"
          style={{
            transform: [{ scale: scaleAnim }],
            maxHeight: `${maxHeightPct}%`,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="p-6 gap-6">
              {/* ÍCONE */}
              {icon && <View className="items-center">{icon}</View>}

              {/* TÍTULO */}
              {title && (
                <View>
                  <Typography variant="title" weight="bold" align="center">
                    {title}
                  </Typography>
                </View>
              )}

              {/* CONTEÚDO */}
              {children}

              {/* FOOTER */}
              {footer && <View className="mt-4">{footer}</View>}
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
