import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect } from "react";
import { useAppIsForeground } from "../utils/is-foreground";

const audioSource = require("./../../assets/sounds/notification.mp3");

export default function useMessageNotificationHook() {
  const isForeground = useAppIsForeground();
  const player = useAudioPlayer(audioSource);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (isForeground && player.playing) {
      stopSound();
    }
  }, [isForeground]);

  useEffect(() => {
    if (status.currentTime >= status.duration && status.duration > 0) {
      player.seekTo(0);
      player.pause();
    }
  }, [status.currentTime]);

  const playSound = () => {
    console.log("Tocando som de notificação");
    if (player.playing) return;
    player.loop = true;
    player.play();
  };

  const stopSound = () => {
    player.pause();
    player.seekTo(0);
  };

  return {
    playSound,
    stopSound,
  };
}
