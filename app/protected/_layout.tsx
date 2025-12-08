import { AblyEvents, RadioCallTypeEvents } from "@/src/@types/ably-events";
import { useCheckAuth } from "@/src/http/generated/auth/auth";
import { useCreateRadioMeeting } from "@/src/http/generated/radio/radio";
import useAbly from "@/src/services/use-ably";
import { useAgora } from "@/src/services/use-agora";
import { LinearGradient } from "expo-linear-gradient";
import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProtectedLayout() {
  const { data: checkAuth } = useCheckAuth();

  const { join, leave, connectionState } = useAgora();

  const { mutateAsync: createRadioMeeting } = useCreateRadioMeeting();

  const handleCall = async (ambulanceId: string) => {
    const response = await createRadioMeeting({
      data: {
        ambulanceId,
      },
    });
    await join({
      token: response.rtcToken,
      channel: response.id,
      uid: response.uid as string,
    });
  };

  const handleLeave = () => {
    console.log("Leaving radio call");
    leave();
  };

  const router = useRouter();

  useEffect(() => {
    if (!checkAuth?.isAuthenticated) {
      router.replace("/public/sign-in");
      return;
    }
  }, [checkAuth]);

  const { user } = useAbly({
    events: [AblyEvents.radioCall],
    handleMessageReceived: (message) => {
      console.log("Ably message received:", message);
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LinearGradient
        className="flex-1"
        colors={[
          "rgba(0,128,0,0.05)",
          "rgba(0,128,0,0.05)",
          "rgba(0,128,0,0.07)",
        ]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
      >
        <Slot />
      </LinearGradient>
    </SafeAreaView>
  );
}
