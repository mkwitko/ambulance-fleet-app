import { env } from "@/src/env";
import {
  GetAuthenticatedUserAmbulance200Data,
  SendMessageBodyMessageType,
  SendMessageBodyPlatform,
} from "@/src/http/generated/api.schemas";
import { useSendMessage } from "@/src/http/generated/chat/chat";
import { useGetPressignedUrl } from "@/src/http/generated/upload/upload";
import { useGetAuthenticatedUser } from "@/src/http/generated/user/user";
import { generateAudioFileName } from "@/src/utils/generate-file-name";
import axios from "axios";
import {
  RecorderState,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  type AudioRecorder,
} from "expo-audio";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export interface UseAudioRecorderHookReturn {
  audioRecorder: AudioRecorder;
  recorderState: RecorderState;
  record: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  handleSendAudioMessage: (audioRecorder: AudioRecorder) => Promise<void>;
  isLoading: boolean;
  recordedUri: string | null;
}

export function useAudioRecorderHook({
  selectedChatId,
  user,
  online,
}: {
  selectedChatId: string;
  user: GetAuthenticatedUserAmbulance200Data | undefined;
  online: boolean;
}): UseAudioRecorderHookReturn {
  const { data: userInfo } = useGetAuthenticatedUser();
  const audioRecorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY,
    (status) => {
      setRecordedUri(status.url);
    }
  );
  const recorderState = useAudioRecorderState(audioRecorder);

  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: sendMessage } = useSendMessage();
  const { mutateAsync: getPressignedUrl } = useGetPressignedUrl();

  const record = async (): Promise<void> => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async (): Promise<void> => {
    await audioRecorder.stop();
  };

  const cancelRecording = (): void => {
    setRecordedUri(null);
  };

  const handleSendAudioMessage = async (audioRecorder: AudioRecorder) => {
    if (!audioRecorder.uri) return;
    if (!online) {
      Toast.show({
        type: "info",
        text1: "Você está offline",
        text2: "Tente enviar novamente quando estiver online.",
      });
      return;
    }
    setIsLoading(true);

    const type = "audio/m4a";

    const fileData = new FileSystem.File(audioRecorder.uri);
    const blob = await fileData.arrayBuffer();
    const fileName = generateAudioFileName({
      title: `audio_message_${selectedChatId}`,
      type,
    });

    const { pressignedUrl } = await getPressignedUrl({
      data: {
        folder: "audio",
        fileSize: 0,
        fileType: type,
        fileName: `${selectedChatId}/audio/${fileName}`,
      },
    });

    await axios.put(pressignedUrl, blob, {
      headers: {
        "Content-Type": type,
      },
    });

    await sendMessage({
      id: selectedChatId,
      data: {
        content: "",
        messageType: SendMessageBodyMessageType.AUDIO,
        file: `${env.EXPO_PUBLIC_STORAGE_URL}/${selectedChatId}/audio/${fileName}`,
        user: {
          id: userInfo?.data.id as string,
          name: userInfo?.data.name as string,
          avatarUrl: userInfo?.data.avatarUrl || null,
        },
        platform: SendMessageBodyPlatform.WEB,
      },
    });

    setIsLoading(false);

    await cancelRecording();
  };

  useEffect(() => {
    (async () => {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  return {
    audioRecorder,
    recorderState,
    record,
    stopRecording,
    cancelRecording,
    handleSendAudioMessage,
    isLoading,
    recordedUri,
  };
}
