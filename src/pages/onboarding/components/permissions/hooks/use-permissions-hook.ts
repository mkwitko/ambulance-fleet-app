import { Camera } from "expo-camera";
import * as Contacts from "expo-contacts";
import * as Location from "expo-location";
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
  };

  const activeCount = Object.values(permissions).filter(
    (p) => p.granted
  ).length;
  const totalCount = 4;
  const progressPercentage = (activeCount / totalCount) * 100;

  const currentDetail = currentPermission
    ? permissionDetails[currentPermission]
    : null;

  const permissionTypes = Object.keys(permissionDetails) as PermissionType[];

  const checkAllPermissions = async (): Promise<void> => {
    const locationForeground = await Location.getForegroundPermissionsAsync();
    const locationBackground = await Location.getBackgroundPermissionsAsync();
    const camera = await Camera.getCameraPermissionsAsync();
    const contacts = await Contacts.getPermissionsAsync();

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
    });
  };

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

  useEffect(() => {
    if (!animateProgress) return;
    const activeCount = Object.values(permissions).filter(
      (p) => p.granted
    ).length;
    const progress = activeCount / 4;
    animateProgress(progress);

    setPermissionsCompleted && setPermissionsCompleted(activeCount === 4);
  }, [permissions]);

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
  };
}
