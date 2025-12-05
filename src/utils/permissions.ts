import {
  GetAuthenticatedUser200Data,
  GetAuthenticatedUser200DataRolesItem,
} from "../http/generated/api.schemas";

export function hasPermission(
  user: GetAuthenticatedUser200Data | undefined,
  permission: string,
  bypassAdmin = true
): boolean {
  if (!user) return false;
  if (
    bypassAdmin &&
    user.roles.includes(
      GetAuthenticatedUser200DataRolesItem["sys_admin:accessAll"]
    )
  )
    return true;

  return user.roles.includes(
    permission as GetAuthenticatedUser200DataRolesItem
  );
}
