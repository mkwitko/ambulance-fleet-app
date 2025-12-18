import { HeaderWithSidebar } from "@/src/components/sidebar";
import React, { useEffect } from "react";
import { AppGuardStatus } from "../@types/app-guard";
import BlockedNavigationModal from "../components/blocked-navigation-modal";
import { useAppGuard } from "./use-app-guard";

export default function AppGuard({
  showBlockedModal,
  setShowBlockedModal,
  children,
}: {
  showBlockedModal: boolean;
  setShowBlockedModal: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
}) {
  const { statuses, missingPermissions, isPathExcluded } = useAppGuard();

  const canNavigate = statuses.includes(AppGuardStatus.OK);

  useEffect(() => {
    if (isPathExcluded) return;
    setShowBlockedModal(
      statuses.includes(AppGuardStatus.MISSING_PERMISSIONS) ||
        statuses.includes(AppGuardStatus.INVALID_SHIFT) ||
        statuses.includes(AppGuardStatus.MISSING_DRIVER)
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
      />
    </>
  );
}
