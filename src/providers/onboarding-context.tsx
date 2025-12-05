import React, { createContext, ReactNode, useContext, useState } from "react";
import {
  GetAmbulances200DataItem,
  GetAmbulances200DataItemStatus,
} from "../http/generated/api.schemas";
import { ShiftConfig } from "../pages/onboarding/components/activities/hooks/use-shift-hook";

interface OnboardingContextData {
  permissionsCompleted: boolean;
  setPermissionsCompleted: (value: boolean) => void;
  activitiesCompleted: boolean;
  setActivitiesCompleted: (value: boolean) => void;
  shiftConfig: ShiftConfig;
  setShiftConfig: (config: ShiftConfig) => void;
  ambulance: GetAmbulances200DataItem | null;
  setAmbulance: (ambulance: GetAmbulances200DataItem | null) => void;
  selectedStatus: GetAmbulances200DataItemStatus;
  setSelectedStatus: (status: GetAmbulances200DataItemStatus) => void;
}

const OnboardingContext = createContext<OnboardingContextData>(
  {} as OnboardingContextData
);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [permissionsCompleted, setPermissionsCompleted] = useState(false);
  const [activitiesCompleted, setActivitiesCompleted] = useState(false);

  const [ambulance, setAmbulance] = useState<GetAmbulances200DataItem | null>(
    null
  );
  const [shiftConfig, setShiftConfig] = useState<ShiftConfig>(() => {
    const entry = new Date(); // agora

    const exit = new Date(entry);
    exit.setHours(entry.getHours() + 8); // +8 horas

    return {
      status: false,
      entryTime: entry,
      exitTime: exit,
    };
  });

  const [selectedStatus, setSelectedStatus] =
    useState<GetAmbulances200DataItemStatus>(GetAmbulances200DataItemStatus.FA);

  return (
    <OnboardingContext.Provider
      value={{
        permissionsCompleted,
        setPermissionsCompleted,
        activitiesCompleted,
        setActivitiesCompleted,
        shiftConfig,
        setShiftConfig,
        ambulance,
        setAmbulance,
        selectedStatus,
        setSelectedStatus,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
