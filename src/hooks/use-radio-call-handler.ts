// src/hooks/useRadioCallHandler.ts
import { AblyEvents, RadioCallTypeEvents } from "@/src/@types/ably-events";
import { useCreateRadioMeeting } from "@/src/http/generated/radio/radio";
import useAbly from "@/src/services/use-ably";
import { useAgora } from "@/src/services/use-agora";
import { useGetAuthenticatedUserAmbulance } from "../http/generated/user/user";

export function useRadioCallHandler() {
  const { join, leave } = useAgora();
  const { data: user } = useGetAuthenticatedUserAmbulance();
  const { mutateAsync: createRadioMeeting } = useCreateRadioMeeting();

  const handleCall = async (ambulanceId: string) => {
    const response = await createRadioMeeting({
      data: { ambulanceId },
    });

    await join({
      token: response.rtcToken,
      channel: response.id,
      uid: response.uid as string,
    });
  };

  const handleLeave = () => {
    leave();
  };

  useAbly({
    events: [AblyEvents.radioCall],
    handleMessageReceived: (message) => {
      if (
        message.name === AblyEvents.radioCall &&
        message.data.ambulanceId === user?.data.ambulance?.id
      ) {
        switch (message.data.type) {
          case RadioCallTypeEvents.calling:
            handleCall(message.data.ambulanceId);
            break;

          case RadioCallTypeEvents.ended:
            handleLeave();
            break;
        }
      }
    },
  });

  return { user };
}
