import { UseActivitiesAnimationHookReturn } from "./use-activities-animation-hook";

export interface ShiftConfig {
  status: boolean;
  entryTime: Date;
  exitTime: Date;
}

export default function useShiftHook({
  animationState,
  setShiftModalVisible,
  shiftConfig,
  setShiftConfig,
}: {
  animationState?: UseActivitiesAnimationHookReturn;
  setShiftModalVisible: (visible: boolean) => void;
  shiftConfig: ShiftConfig;
  setShiftConfig: (config: ShiftConfig) => void;
}) {
  const { cardAnims, animateEntrance } = animationState || {};

  const handleSaveShift = (entryDate: Date, exitDate: Date) => {
    setShiftConfig({
      status: true,
      entryTime: entryDate,
      exitTime: exitDate,
    });
    setShiftModalVisible(false);

    setTimeout(() => {
      cardAnims?.forEach((anim) => anim.setValue(0));
      animateEntrance && animateEntrance();
    }, 100);
  };

  const isShiftOver =
    !!shiftConfig?.status &&
    !!shiftConfig?.exitTime &&
    new Date() > new Date(shiftConfig.exitTime);

  return {
    shiftConfig,
    handleSaveShift,
    isShiftOver,
  };
}
