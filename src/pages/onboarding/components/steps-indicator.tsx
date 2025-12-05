import { Typography } from "@/src/components/ui/typography";
import { cn } from "@/src/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface Step {
  id: string;
  label: string;
  component: any;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepPress: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepPress,
}) => {
  return (
    <View className="border-b border-input">
      <View className="px-6 py-6">
        <View className="flex-row items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <React.Fragment key={step.id}>
                <TouchableOpacity
                  onPress={() => onStepPress(index)}
                  activeOpacity={0.7}
                  className="items-center"
                  disabled={index > currentStep}
                >
                  {/* CÍRCULO */}
                  <View
                    className={cn(
                      "w-12 h-12 rounded-full items-center justify-center mb-2",
                      isCompleted && "bg-primary",
                      isActive
                        ? "bg-primary border-[3px] border-primary-200/50"
                        : !isCompleted && "bg-gray-100"
                    )}
                  >
                    {isCompleted ? (
                      <MaterialIcons name="check" size={20} color="white" />
                    ) : (
                      <Typography
                        variant="body"
                        weight="semibold"
                        className={isActive ? "text-white" : "text-gray-400"}
                      >
                        {index + 1}
                      </Typography>
                    )}
                  </View>

                  {/* LABEL */}
                  <Typography
                    variant="small"
                    weight={isActive ? "semibold" : "regular"}
                    className={cn(
                      isActive || isCompleted
                        ? "text-foreground"
                        : "text-gray-400"
                    )}
                  >
                    {step.label}
                  </Typography>
                </TouchableOpacity>

                {/* LINHA CONECTORA */}
                {index < steps.length - 1 && (
                  <View
                    className={`flex-1 h-0.5 mx-2 mb-8 ${
                      index < currentStep ? "bg-primary" : "bg-gray-300/50"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    </View>
  );
};
