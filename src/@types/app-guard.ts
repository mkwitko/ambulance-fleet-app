// -------------------------------------
// AppGuardStatus
// -------------------------------------
export const AppGuardStatus = {
  OK: "ok",
  MISSING_PERMISSIONS: "missing-permissions",
  INVALID_SHIFT: "invalid-shift",
} as const;

export type AppGuardStatusType =
  (typeof AppGuardStatus)[keyof typeof AppGuardStatus];
