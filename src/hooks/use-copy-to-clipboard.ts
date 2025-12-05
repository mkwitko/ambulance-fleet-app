import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Alert } from "react-native";

export const useCopyToClipboard = () => {
  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);

      // Haptic feedback: tremor de sucesso
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Haptic feedback: tremor de erro
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", "Não foi possível copiar");
    }
  };

  return { copyToClipboard };
};
