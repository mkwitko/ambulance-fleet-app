import { Typography } from "@/src/components/ui/typography";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import ChatLoading from "./chat-loading";

const fadeDuration = 200;

export const ChatOverlay: React.FC<{
  isFetching: boolean;
  currentDateOnScreen: string | null;
}> = ({ isFetching, currentDateOnScreen }) => {
  const loadingOpacity = useRef(new Animated.Value(isFetching ? 1 : 0)).current;
  const dateOpacity = useRef(
    new Animated.Value(currentDateOnScreen ? 1 : 0)
  ).current;

  useEffect(() => {
    Animated.timing(loadingOpacity, {
      toValue: isFetching ? 1 : 0,
      duration: fadeDuration,
      useNativeDriver: true,
    }).start();

    Animated.timing(dateOpacity, {
      toValue: isFetching ? 0 : currentDateOnScreen ? 1 : 0,
      duration: fadeDuration,
      useNativeDriver: true,
    }).start();
  }, [isFetching, currentDateOnScreen]);

  return (
    <View
      style={{
        position: "absolute",
        top: 16,
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Ícone de loading */}
      <Animated.View style={{ opacity: loadingOpacity, position: "absolute" }}>
        <ChatLoading />
      </Animated.View>

      {/* Data na tela */}
      <Animated.View style={{ opacity: dateOpacity }}>
        <View
          style={{
            backgroundColor: "#f0f0f0", // substitua pelo seu bg-muted
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Typography variant="small">{currentDateOnScreen || ""}</Typography>
        </View>
      </Animated.View>
    </View>
  );
};
