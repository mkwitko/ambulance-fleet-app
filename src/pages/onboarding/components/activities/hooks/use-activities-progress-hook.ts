import { AmbulanceStatus } from "@/src/@types/ambulance-status";
import { useOnboarding } from "@/src/providers/onboarding-context";
import { ExistingContact } from "expo-contacts";
import { useEffect } from "react";

export default function useActivitiesProgressHook({
  contact,
  driverAssociated,
  hasDriverPermission,
  animateProgress,
  isShiftOver,
}: {
  contact: ExistingContact | undefined;
  driverAssociated: boolean;
  hasDriverPermission: boolean;
  animateProgress: (progress: number) => void;
  isShiftOver: boolean;
}) {
  const { shiftConfig, setActivitiesCompleted, selectedStatus } =
    useOnboarding();

  const isValidStatus =
    selectedStatus !== AmbulanceStatus.FA &&
    selectedStatus !== AmbulanceStatus.MN;

  const activeCount = [
    shiftConfig.status && !isShiftOver,
    !!contact,
    !!isValidStatus,
    hasDriverPermission ? driverAssociated : false,
  ].filter(Boolean).length;

  const totalCount = hasDriverPermission ? 4 : 3;
  const progressPercentage = (activeCount / totalCount) * 100;

  useEffect(() => {
    const progress = activeCount / totalCount;
    animateProgress(progress);

    setActivitiesCompleted(activeCount === totalCount);
  }, [
    shiftConfig.status,
    isShiftOver,
    contact,
    driverAssociated,
    hasDriverPermission,
  ]);

  return {
    progressPercentage,
    activeCount,
    totalCount,
  };
}
