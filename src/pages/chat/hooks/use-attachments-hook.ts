import { GetChatMessages200DataItemMessageType } from "@/src/http/generated/api.schemas";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

export type Attachment = {
  uri: string;
  type: GetChatMessages200DataItemMessageType;
  name?: string;
  mimeType?: string;
  image?: ImagePicker.ImagePickerAsset;
  video?: ImagePicker.ImagePickerAsset;
  document?: DocumentPicker.DocumentPickerAsset;
};

export const useAttachmentPicker = () => {
  const [attachment, setAttachment] = useState<Attachment | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setAttachment({
        uri: result.assets[0].uri,
        type: GetChatMessages200DataItemMessageType.IMAGE,
        mimeType: result.assets[0].mimeType,
        image: result.assets[0],
      });
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setAttachment({
        uri: result.assets[0].uri,
        type: GetChatMessages200DataItemMessageType.VIDEO,
        mimeType: result.assets[0].mimeType,
        video: result.assets[0],
      });
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (result.assets && result.assets.length > 0) {
      setAttachment({
        uri: result.assets[0].uri,
        type: GetChatMessages200DataItemMessageType.DOCUMENT,
        name: result.assets[0].name,
        mimeType: result.assets[0].mimeType,
        document: result.assets[0],
      });
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const clearAttachment = () => setAttachment(null);

  return {
    attachment,
    pickImage,
    pickVideo,
    pickDocument,
    removeAttachment,
    clearAttachment,
  };
};
