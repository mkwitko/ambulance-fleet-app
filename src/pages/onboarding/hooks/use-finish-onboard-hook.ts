import { AblyEvents } from "@/src/@types/ably-events";
import { AmbulanceStatus } from "@/src/@types/ambulance-status";
import {
  useAssociateUserToAmbulance,
  useSwitchAmbulanceShift,
  useSwitchAmbulanceStatus,
} from "@/src/http/generated/ambulance/ambulance";
import { useUpdateChat } from "@/src/http/generated/chat/chat";
import { useGetAuthenticatedUser } from "@/src/http/generated/user/user";
import { useOnboarding } from "@/src/providers/onboarding-context";
import useAbly from "@/src/services/use-ably";
import { useRouter } from "expo-router";

export default function useFinishOnboardHook({
  handleAssociateDriver,
  contact,
}: {
  handleAssociateDriver: () => Promise<void>;
  contact: string | undefined;
}) {
  const { data: user } = useGetAuthenticatedUser();
  const { mutateAsync: associateUser, isPending: isAssociating } =
    useAssociateUserToAmbulance();
  const { mutateAsync: switchAmbulanceShift, isPending: isSwitchingShift } =
    useSwitchAmbulanceShift();
  const { mutateAsync: switchAmbulanceStatus, isPending: isSwitchingStatus } =
    useSwitchAmbulanceStatus();

  const { publish } = useAbly({});

  const { mutateAsync: updateChat } = useUpdateChat({
    mutation: {
      onSuccess: () => {
        publish(AblyEvents.updatePhone, {
          chatId: ambulance?.chats[0].id as string,
          currentPhone: contact as string,
        });
      },
    },
  });

  const { ambulance, shiftConfig, selectedStatus } = useOnboarding();

  const router = useRouter();

  const isFinishingOnboarding =
    isAssociating || isSwitchingShift || isSwitchingStatus;

  const handleFinishOnboarding = async () => {
    await associateUser({
      data: {
        ambulanceId: ambulance?.id as string,
        userId: user?.data.id as string,
      },
    });
    await Promise.all([
      switchAmbulanceStatus({
        id: ambulance?.id as string,
        data: {
          status: selectedStatus as AmbulanceStatus,
        },
      }),
      switchAmbulanceShift({
        id: ambulance?.id as string,
        data: {
          shiftStart: shiftConfig.entryTime.toISOString(),
          shiftEnd: shiftConfig.exitTime.toISOString(),
        },
      }),
      handleAssociateDriver(),
      updateChat({
        id: ambulance?.chats[0].id as string,
        data: {
          currentPhone: contact as string,
        },
      }),
    ]);
    router.replace("/protected/app/chat");
  };

  return {
    isFinishingOnboarding,
    handleFinishOnboarding,
  };
}
