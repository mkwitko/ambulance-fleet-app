import AppGuard from "@/src/guards/app-guard";
import { ChangeAmbulanceProvider } from "@/src/providers/change-ambulance-context";
import { Slot } from "expo-router";

export default function AppLayout() {
  return (
    <ChangeAmbulanceProvider>
      <AppGuard>
        <Slot />
      </AppGuard>
    </ChangeAmbulanceProvider>
  );
}
