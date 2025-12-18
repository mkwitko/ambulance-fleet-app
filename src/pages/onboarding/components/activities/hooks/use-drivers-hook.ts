import { Role } from "@/src/@types/roles";
import { GetDriversIntegration200Item } from "@/src/http/generated/api.schemas";
import {
  useAssociateDriver,
  useGetCurrentDriver,
  useGetDriversIntegration,
  useLogoutDriver,
} from "@/src/http/generated/drivers/drivers";
import {
  useGetAuthenticatedUserAmbulance,
  useGetAuthenticatedUserPermissions,
} from "@/src/http/generated/user/user";
import { queryClient } from "@/src/lib/react-query";
import { hasPermission } from "@/src/utils/permissions";
import { useEffect, useState } from "react";

export default function useDriversHook({
  setDriverModalVisible,
}: {
  setDriverModalVisible: (visible: boolean) => void;
}) {
  const { data: user } = useGetAuthenticatedUserAmbulance();
  const { data: userPermissions } = useGetAuthenticatedUserPermissions();
  const [driverAssociated, setDriverAssociated] = useState<string>();

  const { data: currentDriver, queryKey } = useGetCurrentDriver(
    {
      ambulanceId: user?.data.ambulance?.id as string,
    },
    {
      query: {
        enabled:
          !!user?.data.ambulance?.id &&
          hasPermission(userPermissions?.data, Role["driver:associateDriver"]),
      },
    }
  );

  useEffect(() => {
    if (currentDriver) setDriverAssociated(String(currentDriver.driverId));
  }, [currentDriver]);

  const { mutateAsync: associateDriver } = useAssociateDriver();
  const { mutateAsync: logoutDriver } = useLogoutDriver();

  const hasDriverPermission = hasPermission(
    userPermissions?.data,
    Role["driver:associateDriver"]
  );

  const { data: drivers } = useGetDriversIntegration(
    {
      ambulanceId: user?.data.ambulance?.id as string,
    },
    {
      query: {
        enabled: !!user?.data.ambulance?.id && hasDriverPermission,
      },
    }
  );

  const foundDriver = drivers?.find(
    (d) => String(d.IdSocorrista) === (driverAssociated as string)
  );

  const handleSetDriver = (driver: GetDriversIntegration200Item) => {
    setDriverAssociated(String(driver.IdSocorrista));
    setDriverModalVisible(false);
  };

  const handleUnsetDriver = () => {
    setDriverAssociated("");
    setDriverModalVisible(false);
  };

  const handleAssociateDriver = async () => {
    await associateDriver({
      data: {
        driverId: driverAssociated as string,
        ambulanceId: user?.data.ambulance?.id as string,
      },
    });
    await queryClient.invalidateQueries({
      queryKey: queryKey,
    });
  };

  const handleLogoutDriver = async () => {
    if (!currentDriver) return;
    await logoutDriver({
      data: {
        id: currentDriver.id,
        idTurno: currentDriver.idTurno,
        ambulanceId: user?.data.ambulance?.id as string,
      },
    });
    setDriverAssociated(undefined);
    await queryClient.invalidateQueries({
      queryKey: queryKey,
    });
  };

  return {
    driverAssociated,
    hasDriverPermission,
    handleSetDriver,
    handleUnsetDriver,
    handleAssociateDriver,
    handleLogoutDriver,
    drivers,
    foundDriver,
    currentDriver,
  };
}
