import * as Crypto from "expo-crypto";

export const generateAudioFileName = ({
  title,
  type,
}: {
  title: string;
  type: string;
}): string => {
  const timestamp = Date.now();
  const randomId = Crypto.randomUUID().slice(0, 8);
  // return `audio_${timestamp}_${randomId}.m4a`;
  return `${title
    .replace(/\s+/g, "_")
    .toLowerCase()}_${timestamp}_${randomId}.${type.split("/")[1]}`;
};
