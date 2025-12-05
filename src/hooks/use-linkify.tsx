import React from "react";
import { Alert, Linking, Text } from "react-native";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export const useLinkify = () => {
  const handleLinkPress = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Erro", "Não foi possível abrir o link");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir o link");
    }
  };

  const linkify = (
    text: string,
    linkClassName?: string,
    textClassName?: string
  ) => {
    const parts = text.split(URL_REGEX);

    return parts.map((part, index) => {
      if (part.match(URL_REGEX)) {
        return (
          <Text
            key={index}
            onPress={() => handleLinkPress(part)}
            className={linkClassName}
            style={{ textDecorationLine: "underline" }}
          >
            {part}
          </Text>
        );
      }

      return (
        <Text key={index} className={textClassName}>
          {part}
        </Text>
      );
    });
  };

  return { linkify };
};
