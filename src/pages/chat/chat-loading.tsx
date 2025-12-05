import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";

export default function ChatLoading() {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotate]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Ícone giratório */}
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <MaterialIcons
          name="refresh"
          size={26}
          color={COLORS.mutedForeground}
        />
      </Animated.View>

      {/* Texto estático */}
      <Text
        style={{
          marginTop: 8,
          color: COLORS.mutedForeground,
          fontSize: 12,
          opacity: 0.8,
        }}
      >
        Carregando mensagens…
      </Text>
    </View>
  );
}
