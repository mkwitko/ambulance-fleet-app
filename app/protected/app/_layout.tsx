// src/app/app-layout.tsx
import AppGuard from "@/src/guards/app-guard";
import { useForegroundMessageHandler } from "@/src/hooks/use-foreground-message-handler";
import { useRadioCallHandler } from "@/src/hooks/use-radio-call-handler";
import { ChangeAmbulanceProvider } from "@/src/providers/change-ambulance-context";
import { Slot } from "expo-router";
import { useState } from "react";

export default function AppLayout() {
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  useRadioCallHandler();
  useForegroundMessageHandler();

  return (
    <ChangeAmbulanceProvider>
      <AppGuard
        showBlockedModal={showBlockedModal}
        setShowBlockedModal={setShowBlockedModal}
      >
        <Slot />
      </AppGuard>
    </ChangeAmbulanceProvider>
  );
}
