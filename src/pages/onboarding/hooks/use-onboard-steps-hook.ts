import { GetAmbulances200DataItemStatus } from "@/src/http/generated/api.schemas";
import { useState } from "react";
import { ActivitiesStep } from "../components/activities/activity-step";
import { ShiftConfig } from "../components/activities/hooks/use-shift-hook";
import { AmbulanceStep } from "../components/ambulance/ambulance-step";
import { PermissionsStep } from "../components/permissions/permission-step";

export interface StepProps {
  onNext?: () => void;
  onBack?: () => void;
  handleFinishOnboarding?: (
    ambulanceId: string,
    status: GetAmbulances200DataItemStatus,
    shiftConfig: ShiftConfig
  ) => Promise<void>;
  isFinishingOnboarding?: boolean;
}

export default function useOnboardingStepHook() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: "permissions", label: "Permissões", component: PermissionsStep },
    { id: "ambulance", label: "Ambulância", component: AmbulanceStep },
    { id: "activities", label: "Atividades", component: ActivitiesStep },
  ];

  const isLastStep = currentStep === steps.length - 1;

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    currentStep,
    steps,
    CurrentStepComponent,
    handleNext,
    handleBack,
    setCurrentStep,
    isLastStep,
  };
}
