import { env } from "@/src/env";
import {
  GetAuthenticatedUserAmbulance200Data,
  GetChatMessages200DataItemMessageType,
  SendMessageBodyPlatform,
} from "@/src/http/generated/api.schemas";
import { useSendMessage } from "@/src/http/generated/chat/chat";
import { useGetPressignedUrl } from "@/src/http/generated/upload/upload";
import { useGetAuthenticatedUser } from "@/src/http/generated/user/user";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { useState } from "react";
import { Attachment } from "./use-attachments-hook";

export default function useFileHook({
  selectedChatId,
  user,
  setMessage,
  setAttachment,
}: {
  selectedChatId: string;
  user: GetAuthenticatedUserAmbulance200Data | undefined;
  setMessage: (value: string) => void;
  setAttachment: (attachment: Attachment | null) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const { data: userInfo } = useGetAuthenticatedUser();

  const { mutateAsync: sendMessage } = useSendMessage();
  const { mutateAsync: getPressignedUrl } = useGetPressignedUrl();

  const handleSendFile = async (
    message: string,
    attachment: Attachment | null
  ) => {
    if (!attachment) return;
    try {
      setIsLoading(true);

      const file =
        attachment.type === GetChatMessages200DataItemMessageType.IMAGE
          ? attachment.image
          : attachment.type === GetChatMessages200DataItemMessageType.VIDEO
          ? attachment.video
          : attachment.document;

      const fileName =
        attachment.document?.name ||
        attachment.image?.fileName ||
        attachment.video?.fileName;

      const mimeType = attachment.mimeType;

      const folder =
        attachment.type === GetChatMessages200DataItemMessageType.IMAGE
          ? "image"
          : attachment.type === GetChatMessages200DataItemMessageType.VIDEO
          ? "video"
          : "document";

      if (!file || !fileName) return;

      const { pressignedUrl } = await getPressignedUrl({
        data: {
          folder,
          fileSize: file.file?.size || 0,
          fileType: file.mimeType || "",
          fileName: `${selectedChatId}/${folder}/${fileName}`,
        },
      });

      const fileData = new FileSystem.File(file.uri);
      const blob = await fileData.arrayBuffer();

      await axios.put(pressignedUrl, blob, {
        headers: {
          "Content-Type": mimeType,
        },
      });

      await sendMessage({
        id: selectedChatId,
        data: {
          content: message,
          messageType: attachment.type,
          file: `${env.EXPO_PUBLIC_STORAGE_URL}/${selectedChatId}/${folder}/${fileName}`,
          user: {
            id: userInfo?.data.id as string,
            name: userInfo?.data.name as string,
            avatarUrl: userInfo?.data.avatarUrl || null,
          },
          platform: SendMessageBodyPlatform.APP,
        },
      });

      setAttachment(null);
      setMessage("");
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending file:", error);
      setIsLoading(false);
    }
  };

  return {
    handleSendFile,
    isLoading,
  };
}
