import { Typography } from "@/src/components/ui/typography";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React, { useEffect } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { UseAudioRecorderHookReturn } from "./hooks/use-audio-hook";

interface AudioRecordingPreviewProps {
  audioRecorderHook: UseAudioRecorderHookReturn;
  onSend: () => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function AudioRecordingPreview({
  audioRecorderHook,
  onSend,
  onCancel,
  isPending = false,
}: AudioRecordingPreviewProps) {
  const { audioRecorder } = audioRecorderHook;

  const player = useAudioPlayer(audioRecorder.uri);
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
      player.seekTo(0);
      player.pause();
    }
  }, [status.currentTime, isSeeking]);

  return (
    <View className="bg-white border-t border-input px-6 py-2">
      <View className="flex-row items-center gap-3">
        {/* Cancelar */}
        <TouchableOpacity
          onPress={onCancel}
          disabled={isPending}
          className="p-2 disabled:opacity-50"
        >
          <MaterialIcons name="delete" size={24} color={COLORS.destructive} />
        </TouchableOpacity>

        {/* PLAYER */}
        <View className="flex-1 bg-gray-100 rounded-xl px-4 py-3">
          <View className="flex-row items-center gap-3">
            {/* Play / Pause */}
            <TouchableOpacity
              onPress={togglePlayPause}
              disabled={isPending}
              className="disabled:opacity-50"
            >
              <MaterialIcons
                name={status.playing ? "pause" : "play-arrow"}
                size={28}
                color={COLORS.primary.DEFAULT}
              />
            </TouchableOpacity>

            {/* Barra + tempo */}
            <View>
              {/* Slider de progresso */}
              <Slider
                style={{ width: 200, height: 20 }}
                minimumValue={0}
                maximumValue={status.duration || 1}
                value={currentTime}
                onValueChange={handleSliderChange}
                onSlidingComplete={handleSliderComplete}
                minimumTrackTintColor={COLORS.primary.DEFAULT}
                maximumTrackTintColor="#D1D5DB"
                thumbTintColor={COLORS.primary.DEFAULT}
                disabled={isPending}
              />
            </View>
          </View>
          {/* Tempo */}
          <Typography
            variant="extraSmall"
            tone="muted"
            className="absolute right-4 bottom-2"
          >
            {formatTime(currentTime)} / {formatTime(status.duration)}
          </Typography>
        </View>

        {/* Enviar */}
        <TouchableOpacity
          onPress={onSend}
          disabled={isPending}
          className="p-3 rounded-full bg-primary disabled:bg-gray-300"
        >
          {isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialIcons name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
