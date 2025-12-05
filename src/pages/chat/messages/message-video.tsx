import { LinkifyText } from "@/src/components/linkify-text";
import { Typography } from "@/src/components/ui/typography";
import { GetChatMessages200DataItem } from "@/src/http/generated/api.schemas";
import { cn } from "@/src/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { VideoPlayerModal } from "../modals/video-preview-modal";

export default function MessageVideo({
  message,
  isCurrentUser,
  messageTime,
}: {
  message: GetChatMessages200DataItem;
  isCurrentUser: boolean;
  messageTime: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const hasVideo = !!message.file;
  const hasText = !!message.content;

  // Inicializa o player com o vídeo
  const player = useVideoPlayer(message.file || "", (player) => {
    player.loop = false;
    player.muted = false;
  });

  // Monitor player status
  useEffect(() => {
    if (!player) return;

    const statusSubscription = player.addListener("statusChange", () => {
      setIsPlaying(player.playing);
      if (player.duration && player.duration > 0) {
        setIsLoading(false);
      }
    });

    const playingSubscription = player.addListener(
      "playingChange",
      (payload) => {
        setIsPlaying(payload.isPlaying);
        setIsLoading(false);
      }
    );

    const playToEndSubscription = player.addListener("playToEnd", () => {
      setIsPlaying(false);
      setShowControls(true);
      player.pause();
    });

    return () => {
      statusSubscription.remove();
      playingSubscription.remove();
      playToEndSubscription.remove();
    };
  }, [player]);

  const handlePlayPause = () => {
    if (!player) return;

    if (isPlaying) {
      player.pause();
      setShowControls(true);
    } else {
      player.play();
      resetHideControlsTimer();
    }
  };

  const resetHideControlsTimer = () => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    setShowControls(true);
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleVideoPress = () => {
    setShowControls(true);
    if (isPlaying) {
      resetHideControlsTimer();
    }
  };

  const openFullscreen = () => {
    if (player) {
      player.pause();
    }
    setFullscreen(true);
  };

  const closeFullscreen = () => {
    setFullscreen(false);
  };

  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  return (
    <View
      className={`max-w-[75%] mb-2 ${
        isCurrentUser ? "self-end" : "self-start"
      }`}
    >
      {/* ==========================
          BOLHA UNIFICADA
      =========================== */}
      <View
        className={`rounded-2xl overflow-hidden p-1 ${
          isCurrentUser
            ? "bg-primary rounded-tr-none"
            : "bg-white rounded-tl-none"
        }`}
      >
        {/* Vídeo dentro da bolha */}
        {hasVideo && (
          <TouchableOpacity
            onPress={handleVideoPress}
            onLongPress={openFullscreen}
            activeOpacity={1}
            className={cn(
              "rounded-2xl overflow-hidden relative",
              isCurrentUser ? "rounded-tr-none" : "rounded-tl-none",
              isCurrentUser && hasText ? "rounded-b-none" : "",
              !isCurrentUser && hasText ? "rounded-b-none" : ""
            )}
          >
            <VideoView
              player={player}
              style={{
                width: 240,
                height: 240,
              }}
              contentFit="cover"
              nativeControls={false}
            />

            {/* Loading Spinner */}
            {isLoading && (
              <View className="absolute inset-0 items-center justify-center bg-black/30">
                <ActivityIndicator size="large" color="white" />
              </View>
            )}

            {/* Play/Pause Button Overlay */}
            {showControls && !isLoading && (
              <View className="absolute inset-0 items-center justify-center">
                <TouchableOpacity
                  onPress={handlePlayPause}
                  className="bg-black/60 rounded-full p-3"
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={isPlaying ? "pause" : "play-arrow"}
                    size={40}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Video Icon Badge (canto superior esquerdo) */}
            <View className="absolute top-2 left-2 bg-black/50 rounded-full p-1.5">
              <MaterialIcons name="videocam" size={16} color="white" />
            </View>

            {/* Fullscreen Icon Badge (canto superior direito) */}
            {!isLoading && (
              <TouchableOpacity
                onPress={openFullscreen}
                className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5"
                activeOpacity={0.8}
              >
                <MaterialIcons name="fullscreen" size={16} color="white" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}

        {/* Texto dentro da bolha */}
        {hasText && (
          <View className={`px-3 ${hasVideo ? "py-2" : "py-2.5"}`}>
            <LinkifyText
              variant="body"
              className={isCurrentUser ? "text-white" : "text-gray-800"}
              linkClassName={
                isCurrentUser
                  ? "text-white underline"
                  : "text-blue-600 underline"
              }
            >
              {message.content as string}
            </LinkifyText>
            {/* Hora inline no canto direito (estilo WhatsApp) */}
            <View className="flex-row justify-end items-center mt-1">
              <Typography variant="small" className="text-gray-400">
                {messageTime}
              </Typography>
            </View>
          </View>
        )}

        {/* Se só tem vídeo (sem texto), coloca o horário no canto inferior */}
        {hasVideo && !hasText && (
          <View className="absolute bottom-2 right-2 bg-black/50 px-2 py-0.5 rounded-full flex-row items-center">
            <Typography variant="small" className="text-white text-[11px]">
              {messageTime}
            </Typography>
            {isCurrentUser && (
              <Typography variant="small" className="text-white ml-1">
                ✓✓
              </Typography>
            )}
          </View>
        )}
      </View>

      {/* ==========================
          FULLSCREEN PLAYER
      =========================== */}
      {hasVideo && (
        <VideoPlayerModal
          visible={fullscreen}
          videoUri={message.file as string}
          onClose={closeFullscreen}
        />
      )}
    </View>
  );
}
