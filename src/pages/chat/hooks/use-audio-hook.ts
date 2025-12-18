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
}: {
  selectedChatId: string;
  user: GetAuthenticatedUserAmbulance200Data | undefined;
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
    setIsLoading(true);
    // const offlineId = crypto.randomUUID();

    // if (!online) {
    //   const offlineMessage = {
    //     id: offlineId,
    //     chatId: selectedChat?.id as string,
    //     user: {
    //       id: user?.id as string,
    //       name: user?.name as string,
    //       avatarUrl: user?.avatarUrl || null,
    //     },
    //     file: "",
    //     fileToUpload: audioBlob,
    //     messageType: SendMessageBodyMessageType.TEXT,
    //     createdAt: new Date().toISOString(),
    //     content: "",
    //     status: "PENDING",
    //   };
    //   await connectDatabase.messages.insert(offlineMessage);
    //   return;
    // }

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
