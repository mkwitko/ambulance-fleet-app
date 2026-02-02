import { useState } from "react";
import { UseActivitiesAnimationHookReturn } from "./use-activities-animation-hook";

import * as SecureStore from "expo-secure-store";

export const CONTATO_CONNECT = "CONTATO";

export default function useContactHook({
  animationState,
  setContactModalVisible,
}: {
  animationState?: UseActivitiesAnimationHookReturn;
  setContactModalVisible: (visible: boolean) => void;
}) {
  const { cardAnims, animateEntrance } = animationState || {};

  const [contact, setContact] = useState<string>();

  const checkContact = async (): Promise<void> => {
    try {
      const contact = await SecureStore.getItemAsync(CONTATO_CONNECT);
      if (contact) {
        setContact(contact);
      }
    } catch (error) {
      console.error("Erro ao verificar contato:", error);
    }
  };

  const handleSaveContact = async (ddd: string, phone: string) => {
    try {
      const formattedPhone = `+55${ddd}${phone}`;

      setContact(formattedPhone);
      await SecureStore.setItemAsync(CONTATO_CONNECT, formattedPhone);

      // Modal + animação
      setContactModalVisible(false);

      setTimeout(() => {
        if (!animationState) return;
        cardAnims?.forEach((anim) => anim.setValue(0));
        animateEntrance && animateEntrance();
      }, 100);
    } catch (error) {
      console.error("Erro ao salvar contato:", error);
    }
  };

  return {
    contact,
    checkContact,
    handleSaveContact,
  };
}
