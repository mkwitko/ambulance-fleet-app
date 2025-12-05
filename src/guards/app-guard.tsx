import BlockedNavigationModal from "@/src/components/blocked-navigation-modal";
import { HeaderWithSidebar } from "@/src/components/sidebar";
import React, { useEffect } from "react";
import { AppGuardStatus } from "../@types/app-guard";
import { useAppGuard } from "./use-app-guard";

export default function AppGuard({ children }: { children: React.ReactNode }) {
  const [showBlockedModal, setShowBlockedModal] = React.useState(false);

  const { statuses, missingPermissions, retryPermissions, isPathExcluded } =
    useAppGuard();

  const canNavigate = statuses.includes(AppGuardStatus.OK);

  useEffect(() => {
    if (isPathExcluded) return;
    setShowBlockedModal(
      statuses.includes(AppGuardStatus.MISSING_PERMISSIONS) ||
        statuses.includes(AppGuardStatus.INVALID_SHIFT)
    );
  }, [statuses]);

  return (
    <>
      <HeaderWithSidebar
        canNavigate={canNavigate}
        setShowBlockedModal={setShowBlockedModal}
      />

      {children}

      <BlockedNavigationModal
        showBlockedModal={showBlockedModal}
        setShowBlockedModal={setShowBlockedModal}
        statuses={statuses}
        missingPermissions={missingPermissions}
        retryPermissions={retryPermissions}
      />
    </>
  );
}
