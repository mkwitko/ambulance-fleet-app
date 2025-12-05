import * as Contacts from "expo-contacts";
import { useState } from "react";
import { UseActivitiesAnimationHookReturn } from "./use-activities-animation-hook";

export const CONTATO_CONNECT = "Central Connect";

export default function useContactHook({
  animationState,
  setContactModalVisible,
}: {
  animationState?: UseActivitiesAnimationHookReturn;
  setContactModalVisible: (visible: boolean) => void;
}) {
  const { cardAnims, animateEntrance } = animationState || {};

  const [contact, setContact] = useState<
    Contacts.ExistingContact | undefined
  >();

  const checkContact = async (): Promise<void> => {
    try {
      const { status } = await Contacts.getPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });

        const exists = data.find((c) => c.name === CONTATO_CONNECT);
        setContact(exists);
      }
    } catch (error) {
      console.error("Erro ao verificar contato:", error);
    }
  };

  const handleSaveContact = async (ddd: string, phone: string) => {
    try {
      const formattedPhone = `+55${ddd}${phone}`;

      // --- SE EXISTE → ATUALIZA ---
      if (contact) {
        const updated: Contacts.ExistingContact = {
          ...contact,
          [Contacts.Fields.FirstName]: CONTATO_CONNECT,
          [Contacts.Fields.PhoneNumbers]: [
            { label: "mobile", number: formattedPhone },
          ],
          name: CONTATO_CONNECT,
        };

        await Contacts.updateContactAsync(updated);
        setContact(updated);
      }
      // --- SE NÃO EXISTE → CRIA ---
      else {
        const newContact: Contacts.Contact = {
          [Contacts.Fields.FirstName]: CONTATO_CONNECT,
          [Contacts.Fields.PhoneNumbers]: [
            { label: "mobile", number: formattedPhone },
          ],
          contactType: "person",
          name: CONTATO_CONNECT,
        };

        const id = await Contacts.addContactAsync(newContact);
        setContact({ ...newContact, id } as Contacts.ExistingContact);
      }

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
