import { Role } from "@/src/@types/roles";
import { useGetAuthenticatedUser } from "@/src/http/generated/user/user";
import { hasPermission } from "@/src/utils/permissions";
import { useState } from "react";
import { UseActivitiesAnimationHookReturn } from "./use-activities-animation-hook";

export default function useDriversHook({
  animationState,
  setDriverModalVisible,
}: {
  animationState?: UseActivitiesAnimationHookReturn;
  setDriverModalVisible: (visible: boolean) => void;
}) {
  const { data: user } = useGetAuthenticatedUser();
  const { cardAnims, animateEntrance } = animationState || {};
  const [driverAssociated, setDriverAssociated] = useState(false);
  const hasDriverPermission = hasPermission(
    user?.data,
    Role["driver:create"],
    false
  );

  const handleAssociateDriver = (driverName: string) => {
    setDriverAssociated(true);
    setDriverModalVisible(false);

    setTimeout(() => {
      cardAnims?.forEach((anim) => anim.setValue(0));
      animateEntrance && animateEntrance();
    }, 100);
  };

  return {
    driverAssociated,
    hasDriverPermission,
    handleAssociateDriver,
  };
}
