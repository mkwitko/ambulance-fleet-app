import { StepIndicator } from "@/src/pages/onboarding/components/steps-indicator";
import useOnboardingStepHook from "@/src/pages/onboarding/hooks/use-onboard-steps-hook";
import { OnboardingProvider } from "@/src/providers/onboarding-context";
import React from "react";
import { View } from "react-native";

export default function OnboardingScreen(): React.JSX.Element {
  const {
    currentStep,
    steps,
    CurrentStepComponent,
    handleNext,
    handleBack,
    setCurrentStep,
  } = useOnboardingStepHook();

  return (
    <OnboardingProvider>
      <View className="flex-1">
        {/* STEP INDICATOR */}
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepPress={setCurrentStep}
        />

        {/* CONTEÚDO DO STEP */}
        <CurrentStepComponent onNext={handleNext} onBack={handleBack} />
      </View>
    </OnboardingProvider>
  );
}
