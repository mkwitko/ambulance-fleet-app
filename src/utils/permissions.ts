import {
  GetAuthenticatedUserPermissions200Data,
  GetAuthenticatedUserPermissions200DataRolesItem,
} from "../http/generated/api.schemas";

export function hasPermission(
  user: GetAuthenticatedUserPermissions200Data | undefined,
  permission: string,
  bypassAdmin = true
): boolean {
  if (!user) return false;
  if (
    bypassAdmin &&
    user.roles.includes(
      GetAuthenticatedUserPermissions200DataRolesItem["sys_admin:accessAll"]
    )
  )
    return true;

  return user.roles.includes(
    permission as GetAuthenticatedUserPermissions200DataRolesItem
  );
}
