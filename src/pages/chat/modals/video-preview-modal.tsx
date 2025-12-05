import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface VideoPlayerModalProps {
  visible: boolean;
  videoUri: string;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  visible,
  videoUri,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Inicializa o player apenas quando o modal estiver visível
  const player = useVideoPlayer(visible ? videoUri : "", (player) => {
    player.loop = false;
    player.muted = false;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Track progress continuously
  const startProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    progressInterval.current = setInterval(() => {
      if (player) {
        setCurrentTime(player.currentTime);
        if (player.duration && player.duration > 0 && duration === 0) {
          setDuration(player.duration);
        }
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  // Monitor player status
  useEffect(() => {
    if (!visible || !player) return;

    // Inicia o tracking de progresso
    startProgressTracking();

    // Listener para mudanças de status
    const statusSubscription = player.addListener("statusChange", (status) => {
      setIsPlaying(player.playing);

      if (player.duration && player.duration > 0) {
        setDuration(player.duration);
        setIsLoading(false);
      }
    });

    // Listener para mudanças de playing
    const playingSubscription = player.addListener(
      "playingChange",
      (payload) => {
        setIsPlaying(payload.isPlaying);
        setIsLoading(false);
      }
    );

    // Listener para quando o vídeo terminar
    const playToEndSubscription = player.addListener("playToEnd", () => {
      setIsPlaying(false);
      setShowControls(true);
      player.pause();
      player.currentTime = 0;
      setCurrentTime(0);
    });

    return () => {
      statusSubscription.remove();
      playingSubscription.remove();
      playToEndSubscription.remove();
      stopProgressTracking();
    };
  }, [visible, player]);

  const handlePlayPause = () => {
    if (!player) return;

    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    resetHideControlsTimer();
  };

  const handleSeek = (value: number) => {
    if (!player) return;
    player.currentTime = value;
    setCurrentTime(value);
  };

  const handleRewind = () => {
    if (!player) return;
    const newTime = Math.max(0, currentTime - 10);
    player.currentTime = newTime;
    setCurrentTime(newTime);
    resetHideControlsTimer();
  };

  const handleForward = () => {
    if (!player) return;
    const newTime = Math.min(duration, currentTime + 10);
    player.currentTime = newTime;
    setCurrentTime(newTime);
    resetHideControlsTimer();
  };

  const resetHideControlsTimer = () => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    setShowControls(true);
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleScreenPress = () => {
    setShowControls(!showControls);
    if (!showControls) {
      resetHideControlsTimer();
    }
  };

  const handleClose = () => {
    if (player) {
      player.pause();
      player.currentTime = 0;
    }
    stopProgressTracking();

    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }

    setIsPlaying(false);
    setIsLoading(true);
    setShowControls(true);
    setCurrentTime(0);
    setDuration(0);
    onClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressTracking();
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  // Auto-play quando o modal abrir
  useEffect(() => {
    if (visible && player && !isLoading) {
      // Pequeno delay para garantir que o vídeo carregou
      const timeout = setTimeout(() => {
        player.play();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [visible, isLoading, player]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1">
          {/* Header */}
          {showControls && (
            <View className="absolute top-0 left-0 right-0 z-10">
              <View className="flex-row justify-between items-center px-4 py-3">
                <TouchableOpacity
                  onPress={handleClose}
                  className="bg-white/20 rounded-full p-2"
                >
                  <MaterialIcons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Video Player */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleScreenPress}
            className="flex-1 justify-center items-center"
          >
            <VideoView
              player={player}
              style={{
                width: SCREEN_WIDTH,
                height: "100%",
              }}
              contentFit="contain"
              nativeControls={false}
            />

            {/* Loading Indicator */}
            {isLoading && (
              <View className="absolute">
                <ActivityIndicator size="large" color="white" />
                <Text className="text-white mt-2">Carregando...</Text>
              </View>
            )}

            {/* Center Controls */}
            {!isLoading && showControls && (
              <View className="absolute flex-row items-center gap-8">
                <TouchableOpacity
                  onPress={handleRewind}
                  className="bg-black/60 rounded-full p-3"
                >
                  <MaterialIcons name="replay-10" size={32} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handlePlayPause}
                  className="bg-black/60 rounded-full p-4"
                >
                  <MaterialIcons
                    name={isPlaying ? "pause" : "play-arrow"}
                    size={48}
                    color="white"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleForward}
                  className="bg-black/60 rounded-full p-3"
                >
                  <MaterialIcons name="forward-10" size={32} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>

          {/* Bottom Controls */}
          {!isLoading && showControls && duration > 0 && (
            <View className="absolute bottom-0 left-0 right-0 pb-8">
              <View className="px-4 pt-6">
                {/* Progress Bar */}
                <Slider
                  value={currentTime}
                  minimumValue={0}
                  maximumValue={duration}
                  onSlidingComplete={handleSeek}
                  minimumTrackTintColor="#fff"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#fff"
                  style={{ width: "100%", height: 40 }}
                />

                {/* Time Display */}
                <View className="flex-row justify-between px-2">
                  <Text className="text-white text-sm font-medium">
                    {formatTime(currentTime)}
                  </Text>
                  <Text className="text-white text-sm font-medium">
                    {formatTime(duration)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};
