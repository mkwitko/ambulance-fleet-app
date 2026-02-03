import {
  useGetAuthenticatedUserAmbulance,
  useGetAuthenticatedUserPermissions,
  useGetAuthenticatedUserShiftValidation,
} from "@/src/http/generated/user/user";
import {
  AppPermissionType,
  checkAllPermissions,
} from "@/src/utils/check-permissions";
import { useAppIsForeground } from "@/src/utils/is-foreground";
import { Href, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { AppGuardStatus, AppGuardStatusType } from "../@types/app-guard";
import { Role } from "../@types/roles";
import { NAVIGATION_ROUTES } from "../data/blocked-navigation-data";
import {
  useGetCurrentDriver,
  useHasDriversIntegration,
} from "../http/generated/drivers/drivers";
import { hasPermission } from "../utils/permissions";

export function useAppGuard() {
  const [statuses, setStatuses] = useState<AppGuardStatusType[]>([
    AppGuardStatus.OK,
  ]);
  const [missingPermissions, setMissingPermissions] = useState<
    AppPermissionType[]
  >([]);

  const isForeground = useAppIsForeground();

  const pathname = usePathname();
  const pathExcludesGuard = NAVIGATION_ROUTES.map((item) => item.route);

  const isPathExcluded = pathExcludesGuard.includes(pathname as Href);

  const {
    data: shiftValidation,
    isLoading,
    refetch,
  } = useGetAuthenticatedUserShiftValidation();

  const { data: user, isLoading: isLoadingUser } =
    useGetAuthenticatedUserPermissions();
  const { data: userInfo } = useGetAuthenticatedUserAmbulance();

  const { data: hasDriversIntegration } = useHasDriversIntegration();
  const {
    data: currentDriver,
    isLoading: isLoadingCurrentDriver,
    refetch: refetchGetCurrentDriver,
  } = useGetCurrentDriver(
    {
      ambulanceId: userInfo?.data.ambulance?.id as string,
    },
    {
      query: {
        enabled:
          !!userInfo?.data.ambulance?.id &&
          hasPermission(user?.data, Role["driver:associateDriver"]) &&
          !!hasDriversIntegration?.hasIntegration,
      },
    },
  );

  // -------------------------------------------------------------
  // Função principal que sempre recalcula todos os status do app
  // -------------------------------------------------------------
  const evaluateGuard = async (forcePermissionsCheck = false) => {
    if (isLoading || isLoadingUser || isLoadingCurrentDriver) return;

    const newStatuses: AppGuardStatusType[] = [];

    // 1) Verificar permissões (apenas se solicitado ou se ainda não calculado)
    const permissionsResult =
      forcePermissionsCheck || missingPermissions.length > 0
        ? await checkAllPermissions()
        : await checkAllPermissions(); // se quiser manter sempre consistente

    if (!permissionsResult.ok) {
      newStatuses.push(AppGuardStatus.MISSING_PERMISSIONS);
      setMissingPermissions(permissionsResult.missing);
    }

    // 2) Validar turno
    if (!shiftValidation?.data.shift.isValid) {
      newStatuses.push(AppGuardStatus.INVALID_SHIFT);
    }

    // 3) Validar motorista associado
    if (
      hasDriversIntegration?.hasIntegration &&
      hasPermission(user?.data, Role["driver:associateDriver"]) &&
      !currentDriver
    ) {
      newStatuses.push(AppGuardStatus.MISSING_DRIVER);
    }

    // 4) Se nada faltou → OK
    if (newStatuses.length === 0) {
      newStatuses.push(AppGuardStatus.OK);
    }

    setStatuses(newStatuses);
  };

  // -------------------------------------------------------------
  // Revalida quando volta para foreground
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isForeground || isPathExcluded) return;
    refetch();
  }, [isForeground]);

  // -------------------------------------------------------------
  // Revalida turno a cada 60s
  // -------------------------------------------------------------
  useEffect(() => {
    const id = setInterval(() => {
      if (isPathExcluded) return;
      refetch();
      refetchGetCurrentDriver();
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // -------------------------------------------------------------
  // Toda vez que o refetch atualizar os dados → recalcular status
  // -------------------------------------------------------------
  useEffect(() => {
    evaluateGuard();
  }, [shiftValidation, isLoading, isLoadingCurrentDriver, currentDriver]);

  // -------------------------------------------------------------
  // Retry manual de permissões (ex: botão "Conceder permissões")
  // -------------------------------------------------------------
  const retryPermissions = async () => {
    await evaluateGuard(true);
  };

  return {
    statuses,
    missingPermissions,
    retryPermissions,
    isPathExcluded,
  };
}
