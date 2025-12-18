// -------------------------------------
// AppGuardStatus
// -------------------------------------
export const AppGuardStatus = {
  OK: "ok",
  MISSING_PERMISSIONS: "missing-permissions",
  INVALID_SHIFT: "invalid-shift",
  MISSING_DRIVER: "missing-driver",
} as const;

export type AppGuardStatusType =
  (typeof AppGuardStatus)[keyof typeof AppGuardStatus];
