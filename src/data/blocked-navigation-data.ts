import { AppGuardStatus } from "../@types/app-guard";
import { NavigationRoute } from "../@types/navigation";

export const NAVIGATION_ROUTES: NavigationRoute[] = [
  {
    route: "/protected/app/status",
    label: "Configurações Essenciais",
    icon: "settings",
    description: AppGuardStatus.MISSING_DRIVER
      ? "Configure, renove seu turno e vincule motorista."
      : "Configure ou renove seu turno",
    status: [AppGuardStatus.INVALID_SHIFT, AppGuardStatus.MISSING_DRIVER],
  },
  {
    route: "/protected/app/permissions",
    label: "Permissões",
    icon: "admin-panel-settings",
    description: "Gerencie as permissões necessárias",
    status: [AppGuardStatus.MISSING_PERMISSIONS],
  },
];
