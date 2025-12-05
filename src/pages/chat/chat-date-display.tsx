import { COLORS } from "@/src/styles/colors";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";

export default function ChatDateDisplay({ date }: { date: string }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View
      style={{
        width: "100%",
        alignItems: "center",
        paddingVertical: 10,
        marginTop: -5, // levanta só um pouquinho
      }}
    >
      <Animated.View
        style={{
          opacity: fade,
          transform: [{ translateY: slide }],
        }}
      >
        <View
          style={{
            backgroundColor: COLORS.muted,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 16,
          }}
        >
          <Text
            style={{
              color: COLORS.mutedForeground,
              fontSize: 11,
              letterSpacing: 0.3,
              textAlign: "center",
            }}
          >
            {date}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
