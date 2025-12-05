import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Image, Modal, TouchableOpacity, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

interface ImageViewerModalProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  imageUri,
  onClose,
}) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
        savedScale.value = 3;
      } else {
        savedScale.value = scale.value;
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleClose = () => {
    scale.value = 1;
    savedScale.value = 1;
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <SafeAreaView className="flex-1 bg-black">
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View className="flex-1">
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 py-3">
              <TouchableOpacity
                onPress={handleClose}
                className="bg-white/10 rounded-full p-2"
              >
                <MaterialIcons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Image with pinch zoom */}
            <View className="flex-1 justify-center items-center">
              <GestureDetector gesture={pinchGesture}>
                <Animated.View style={animatedStyle}>
                  <Image
                    source={{ uri: imageUri }}
                    style={{
                      width: SCREEN_WIDTH,
                      height: SCREEN_HEIGHT * 0.8,
                    }}
                    resizeMode="contain"
                  />
                </Animated.View>
              </GestureDetector>
            </View>
          </View>
        </GestureHandlerRootView>
      </SafeAreaView>
    </Modal>
  );
};
