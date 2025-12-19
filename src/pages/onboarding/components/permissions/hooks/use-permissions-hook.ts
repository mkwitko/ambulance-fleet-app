import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import { Camera } from "expo-camera";
import * as Contacts from "expo-contacts";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { UseAnimationHookReturn } from "./use-animation-hook";

interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

interface PermissionsState {
  location: PermissionStatus;
  locationBackground: PermissionStatus;
  camera: PermissionStatus;
  contacts: PermissionStatus;
  notifications: PermissionStatus;
  microphone: PermissionStatus;
}

export type PermissionType = keyof PermissionsState;

export default function usePermissionsHook({
  animationState,
  setModalVisible,
  setPermissionsCompleted,
}: {
  animationState?: UseAnimationHookReturn;
  setModalVisible: (visible: boolean) => void;
  setPermissionsCompleted?: (completed: boolean) => void;
}) {
  const { animateProgress, animateEntrance, cardAnims } = animationState || {};

  const [permissions, setPermissions] = useState<PermissionsState>({
    location: { granted: false, canAskAgain: true },
    locationBackground: { granted: false, canAskAgain: true },
    camera: { granted: false, canAskAgain: true },
    contacts: { granted: false, canAskAgain: true },
    notifications: { granted: false, canAskAgain: true },
    microphone: { granted: false, canAskAgain: true },
  });

  const [currentPermission, setCurrentPermission] =
    useState<PermissionType | null>(null);

  const permissionDetails = {
    location: {
      icon: "my-location" as const,
      title: "Localização",
      description: "Necessário para rastrear suas atividades e rotas.",
    },
    locationBackground: {
      icon: "location-on" as const,
      title: "Localização em 2º Plano",
      description: "Permite rastreamento mesmo com o app fechado.",
    },
    camera: {
      icon: "camera-alt" as const,
      title: "Câmera",
      description: "Para tirar fotos e vídeos diretamente pelo app.",
    },
    contacts: {
      icon: "contacts" as const,
      title: "Contatos",
      description:
        "Para podermos saber o seu número de telefone e informar à central.",
    },
    notifications: {
      icon: "notifications" as const,
      title: "Notificações",
      description: "Para avisar sobre eventos importantes no app.",
    },
    microphone: {
      icon: "mic" as const,
      title: "Microfone",
      description: "Para gravar áudio e interagir com o app.",
    },
  };

  const activeCount = Object.values(permissions).filter(
    (p) => p.granted
  ).length;

  const totalCount = Object.keys(permissionDetails).length; // agora 5
  const progressPercentage = (activeCount / totalCount) * 100;

  const currentDetail = currentPermission
    ? permissionDetails[currentPermission]
    : null;

  const permissionTypes = Object.keys(permissionDetails) as PermissionType[];

  // -----------------------------
  // CHECK ALL PERMISSIONS
  // -----------------------------
  const checkAllPermissions = async (): Promise<void> => {
    const locationForeground = await Location.getForegroundPermissionsAsync();
    const locationBackground = await Location.getBackgroundPermissionsAsync();
    const camera = await Camera.getCameraPermissionsAsync();
    const contacts = await Contacts.getPermissionsAsync();
    const notifications = await Notifications.getPermissionsAsync();
    const microphone = await getRecordingPermissionsAsync();

    setPermissions({
      location: {
        granted: locationForeground.granted,
        canAskAgain: locationForeground.canAskAgain,
      },
      locationBackground: {
        granted: locationBackground.granted,
        canAskAgain: locationBackground.canAskAgain,
      },
      camera: {
        granted: camera.granted,
        canAskAgain: camera.canAskAgain,
      },
      contacts: {
        granted: contacts.granted,
        canAskAgain: contacts.canAskAgain,
      },
      notifications: {
        granted: notifications.granted,
        canAskAgain: notifications.canAskAgain ?? true,
      },
      microphone: {
        granted: microphone.granted,
        canAskAgain: microphone.canAskAgain,
      },
    });
  };

  // -----------------------------
  // REQUEST PERMISSION
  // -----------------------------
  const requestPermission = async (type: PermissionType): Promise<void> => {
    let result: PermissionStatus;

    switch (type) {
      case "location":
        result = await Location.requestForegroundPermissionsAsync();
        break;

      case "locationBackground":
        const fg = await Location.requestForegroundPermissionsAsync();
        result = fg.granted
          ? await Location.requestBackgroundPermissionsAsync()
          : fg;
        break;

      case "camera":
        result = await Camera.requestCameraPermissionsAsync();
        break;

      case "contacts":
        result = await Contacts.requestPermissionsAsync();
        break;

      case "notifications":
        const notif = await Notifications.requestPermissionsAsync();
        result = {
          granted: notif.granted,
          canAskAgain: notif.canAskAgain ?? true,
        };
        break;

      case "microphone":
        result = await requestRecordingPermissionsAsync();
        break;
    }

    setModalVisible(false);
    await checkAllPermissions();

    setTimeout(() => {
      cardAnims?.forEach((anim) => anim.setValue(0));
      animateEntrance && animateEntrance();
    }, 100);
  };

  const openModal = (type: PermissionType): void => {
    setCurrentPermission(type);
    setModalVisible(true);
  };

  // -----------------------------
  // UPDATE PROGRESS
  // -----------------------------
  useEffect(() => {
    if (!animateProgress) return;

    const activeCount = Object.values(permissions).filter(
      (p) => p.granted
    ).length;

    const progress = activeCount / totalCount;
    animateProgress(progress);

    setPermissionsCompleted &&
      setPermissionsCompleted(activeCount === totalCount);
  }, [permissions]);

  // -----------------------------
  // INIT
  // -----------------------------
  useEffect(() => {
    checkAllPermissions();
    animateEntrance && animateEntrance();
  }, []);

  return {
    activeCount,
    totalCount,
    progressPercentage,
    permissionTypes,
    openModal,
    currentDetail,
    permissionDetails,
    permissions,
    currentPermission,
    requestPermission,
    checkAllPermissions,
  };
}
