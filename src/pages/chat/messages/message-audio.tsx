import { Typography } from "@/src/components/ui/typography";
import { GetChatMessages200DataItem } from "@/src/http/generated/api.schemas";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";

interface MessageAudioProps {
  message: GetChatMessages200DataItem;
  isCurrentUser: boolean;
  messageTime: string;
}

export default function MessageAudio({
  message,
  isCurrentUser,
  messageTime,
}: MessageAudioProps) {
  const player = useAudioPlayer(message.file || "");
  const status = useAudioPlayerStatus(player);

  const [currentTime, setCurrentTime] = React.useState(0);
  const [isSeeking, setIsSeeking] = React.useState(false);

  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleSliderChange = (value: number) => {
    setIsSeeking(true);
    setCurrentTime(value);
  };

  const handleSliderComplete = (value: number) => {
    setIsSeeking(false);
    player.seekTo(value);
    setCurrentTime(value);
  };

  // Format time MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!isSeeking) {
      setCurrentTime(status.currentTime);
    }
    if (status.currentTime >= status.duration && status.duration > 0) {
      setCurrentTime(0);
      player.pause();
      player.seekTo(0);
    }
  }, [status.currentTime, isSeeking]);

  return (
    <View
      className={`min-w-[70%] relative ${
        isCurrentUser ? "items-end" : "items-start"
      }`}
    >
      <View
        className={`rounded-2xl px-4 py-3 ${
          isCurrentUser
            ? "bg-primary rounded-tr-sm"
            : "bg-gray-100 rounded-tl-sm"
        }`}
      >
        <View className="flex-row items-center gap-3 w-full">
          {/* Play / Pause */}
          <TouchableOpacity onPress={togglePlayPause}>
            <MaterialIcons
              name={status.playing ? "pause" : "play-arrow"}
              size={32}
              color={isCurrentUser ? "white" : COLORS.primary.DEFAULT}
            />
          </TouchableOpacity>

          {/* Barra + tempo */}
          <View className="flex-1 relative">
            {/* Slider de progresso */}
            <Slider
              style={{ width: "100%", height: 20 }}
              minimumValue={0}
              maximumValue={status.duration || 1}
              value={currentTime}
              onValueChange={handleSliderChange}
              onSlidingComplete={handleSliderComplete}
              minimumTrackTintColor={
                isCurrentUser ? "white" : COLORS.primary.DEFAULT
              }
              maximumTrackTintColor={
                isCurrentUser ? "rgba(255,255,255,0.3)" : "#D1D5DB"
              }
              thumbTintColor={isCurrentUser ? "white" : COLORS.primary.DEFAULT}
            />
            <Typography className="absolute right-4 top-6 text-white text-[0.5rem]">
              {formatTime(currentTime)} / {formatTime(status.duration)}
            </Typography>
          </View>

          <MaterialIcons
            name="mic"
            size={18}
            color={isCurrentUser ? "white" : COLORS.mutedForeground}
          />
        </View>
      </View>
      <Typography variant="small" className="text-gray-400 px-2 mt-1">
        {messageTime}
      </Typography>
    </View>
  );
}
