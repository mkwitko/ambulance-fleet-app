import { AmbulanceStatus } from "@/src/@types/ambulance-status";
import {
  useAssociateUserToAmbulance,
  useSwitchAmbulanceShift,
  useSwitchAmbulanceStatus,
} from "@/src/http/generated/ambulance/ambulance";
import { useGetAuthenticatedUser } from "@/src/http/generated/user/user";
import { useOnboarding } from "@/src/providers/onboarding-context";
import { useRouter } from "expo-router";

export default function useFinishOnboardHook() {
  const { data: user } = useGetAuthenticatedUser();
  const { mutateAsync: associateUser, isPending: isAssociating } =
    useAssociateUserToAmbulance();
  const { mutateAsync: switchAmbulanceShift, isPending: isSwitchingShift } =
    useSwitchAmbulanceShift();
  const { mutateAsync: switchAmbulanceStatus, isPending: isSwitchingStatus } =
    useSwitchAmbulanceStatus();

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
    ]);
    router.replace("/protected/app/chat");
  };

  return {
    isFinishingOnboarding,
    handleFinishOnboarding,
  };
}
