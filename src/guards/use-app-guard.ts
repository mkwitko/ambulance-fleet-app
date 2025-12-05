import { useGetAuthenticatedUserShiftValidation } from "@/src/http/generated/user/user";
import {
  AppPermissionType,
  checkAllPermissions,
} from "@/src/utils/check-permissions";
import { useAppIsForeground } from "@/src/utils/is-foreground";
import { Href, usePathname } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppGuardStatus, AppGuardStatusType } from "../@types/app-guard";
import { NAVIGATION_ROUTES } from "../data/blocked-navigation-data";

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

  // -------------------------------------------------------------
  // Função principal que sempre recalcula todos os status do app
  // -------------------------------------------------------------
  const evaluateGuard = useCallback(
    async (forcePermissionsCheck = false) => {
      if (isLoading) return;

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

      // 3) Se nada faltou → OK
      if (newStatuses.length === 0) {
        newStatuses.push(AppGuardStatus.OK);
      }

      setStatuses(newStatuses);
    },
    [isLoading, shiftValidation, missingPermissions.length]
  );

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
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // -------------------------------------------------------------
  // Toda vez que o refetch atualizar os dados → recalcular status
  // -------------------------------------------------------------
  useEffect(() => {
    evaluateGuard();
  }, [shiftValidation, isLoading]);

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
