import { useCheckAuth } from "@/src/http/generated/auth/auth";
import {
  useAddRadioParticipant,
  useRemoveRadioParticipant,
} from "@/src/http/generated/radio/radio";
import { COLORS } from "@/src/styles/colors";
import { LinearGradient } from "expo-linear-gradient";
import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProtectedLayout() {
  // const [meeting, initMeeting] = useRealtimeKitClient();

  const { data: checkAuth } = useCheckAuth();
  const { mutateAsync: addRadioParticipant } = useAddRadioParticipant();
  const { mutateAsync: removeRadioParticipant } = useRemoveRadioParticipant();

  // const handleCall = async (ambulanceId: string, meetingId: string) => {
  //   const participant = await addRadioParticipant({
  //     data: {
  //       meetingId,
  //       name: user?.data.name as string,
  //       preset_name: "group_call_participant",
  //       custom_participant_id: user?.data.id as string,
  //       ambulanceId,
  //     },
  //   });
  //   await initMeeting({
  //     authToken: participant.token,
  //     defaults: {
  //       audio: true,
  //       video: false,
  //     },
  //   });
  //   meeting?.join();
  // };

  // const handleLeave = (ambulanceId: string, meetingId: string) => {
  //   removeRadioParticipant({
  //     data: {
  //       meetingId: meetingId as string,
  //       participantId: user?.data.id as string,
  //       ambulanceId,
  //     },
  //   });
  //   meeting?.leaveRoom();
  // };

  const router = useRouter();

  useEffect(() => {
    if (!checkAuth?.isAuthenticated) {
      router.replace("/public/sign-in");
      return;
    }
  }, [checkAuth]);

  // const { user } = useAbly({
  //   events: [AblyEvents.radioCall],
  //   handleMessageReceived: (message) => {
  //     if (
  //       message.name === AblyEvents.radioCall &&
  //       message.data.ambulanceId === user?.data.ambulance?.id
  //     ) {
  //       switch (message.data.type) {
  //         case RadioCallTypeEvents.calling:
  //           handleCall(message.data.ambulanceId, message.data.meetingId);
  //           break;
  //         case RadioCallTypeEvents.ended:
  //           handleLeave(message.data.ambulanceId, message.data.meetingId);
  //           break;
  //       }
  //     }
  //   },
  // });

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
      }}
    >
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
