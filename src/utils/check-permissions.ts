import { MaterialIcons } from "@expo/vector-icons";
import * as Audio from "expo-audio"; // ✅ novo expo-audio
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

// -------------------------------------
// AppPermission (enum-like com const)
// -------------------------------------
export const AppPermission = {
  LOCATION_FOREGROUND: "locationForeground",
  LOCATION_BACKGROUND: "locationBackground",
  CAMERA: "camera",
  NOTIFICATIONS: "notifications",

  // 🔥 Agora voice call
  RECORD_AUDIO: "recordAudio",
  FOREGROUND_SERVICE: "foregroundService",
  WAKE_LOCK: "wakeLock",
} as const;

// Deriva o tipo automaticamente
export type AppPermissionType =
  (typeof AppPermission)[keyof typeof AppPermission];

// -------------------------------------
// Função de checagem
// -------------------------------------
export const checkAllPermissions = async (): Promise<{
  ok: boolean;
  missing: AppPermissionType[];
}> => {
  const locationForeground = await Location.getForegroundPermissionsAsync();
  const locationBackground = await Location.getBackgroundPermissionsAsync();
  const camera = await Camera.getCameraPermissionsAsync();
  const audio = await Audio.getRecordingPermissionsAsync(); // ✅ correto
  const notifications = await Notifications.getPermissionsAsync();

  const missing: AppPermissionType[] = [];

  if (!locationForeground.granted)
    missing.push(AppPermission.LOCATION_FOREGROUND);

  if (!locationBackground.granted)
    missing.push(AppPermission.LOCATION_BACKGROUND);

  if (!camera.granted) missing.push(AppPermission.CAMERA);

  if (!audio.granted) missing.push(AppPermission.RECORD_AUDIO);

  if (!notifications.granted) missing.push(AppPermission.NOTIFICATIONS);

  return {
    ok: missing.length === 0,
    missing,
  };
};

export const PERMISSION_LABELS: Record<
  AppPermissionType,
  {
    label: string;
    description: string;
    icon: keyof typeof MaterialIcons.glyphMap;
  }
> = {
  [AppPermission.LOCATION_FOREGROUND]: {
    label: "Localização (Uso do App)",
    description: "Necessária para registrar sua localização durante o uso",
    icon: "location-on",
  },
  [AppPermission.LOCATION_BACKGROUND]: {
    label: "Localização (Segundo Plano)",
    description: "Necessária para rastrear sua localização continuamente",
    icon: "my-location",
  },
  [AppPermission.CAMERA]: {
    label: "Câmera",
    description: "Necessária para tirar fotos e escanear documentos",
    icon: "camera-alt",
  },
  [AppPermission.NOTIFICATIONS]: {
    label: "Notificações",
    description: "Necessária para enviar notificações importantes",
    icon: "notifications",
  },
  [AppPermission.RECORD_AUDIO]: {
    label: "Microfone",
    description: "Necessária para chamadas de voz (Agora WebRTC)",
    icon: "mic",
  },
  [AppPermission.FOREGROUND_SERVICE]: {
    label: "Serviço em Primeiro Plano",
    description:
      "Necessária para manter chamadas de voz ativas quando o app está minimizado",
    icon: "notifications-active",
  },
  [AppPermission.WAKE_LOCK]: {
    label: "Wake Lock",
    description:
      "Mantém o processamento ativo durante chamadas de voz em segundo plano",
    icon: "lock",
  },
};
