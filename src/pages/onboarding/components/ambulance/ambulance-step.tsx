import { Button } from "@/src/components/ui/button";
import { Typography } from "@/src/components/ui/typography";
import useGetUserPermissions from "@/src/hooks/use-get-user-permissions";
import { useGetAmbulances } from "@/src/http/generated/ambulance/ambulance";
import { GetAmbulances200DataItem } from "@/src/http/generated/api.schemas";
import { useGetAuthenticatedUserAmbulance } from "@/src/http/generated/user/user";
import { useOnboarding } from "@/src/providers/onboarding-context";
import React, { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { StepProps } from "../../hooks/use-onboard-steps-hook";
import { ActivityCard } from "../activities/components/activity-card";
import { VehicleSelectionModal } from "./components/vehicle-selection";
import useConfirmationAnimationsHook from "./hooks/use-confirmation-animation-hook";

export const AmbulanceStep: React.FC<StepProps> = ({ onNext, onBack }) => {
  const { animateEntrance, cardAnims } = useConfirmationAnimationsHook();
  const { ambulance, setAmbulance } = useOnboarding();

  const { data: user, isLoading: isLoadingUser } =
    useGetAuthenticatedUserAmbulance();

  const { queryParams, hasSomePermission } = useGetUserPermissions();
  const { data: ambulances, isLoading: isLoadingAmbulance } = useGetAmbulances(
    queryParams,
    {
      query: {
        enabled: hasSomePermission && !!user,
      },
    }
  );

  useEffect(() => {
    if (isLoadingUser || isLoadingAmbulance) return;
    if (user?.data.ambulance?.id) {
      const findAmbulance = ambulances?.data.find(
        (item) => item.id === user.data.ambulance?.id
      );
      if (findAmbulance) {
        setAmbulance(findAmbulance);
      }
    }
  }, [isLoadingAmbulance, isLoadingUser]);

  const [showModal, setShowModal] = React.useState(false);

  useEffect(() => {
    animateEntrance();
  }, []);

  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerClassName="pb-32"
      >
        {/* HEADER PREMIUM */}
        <View className="p-6 pt-0">
          <View className="gap-2">
            <Typography variant="title" weight="semibold">
              Ambulância
            </Typography>
            <Typography variant="subtitle">
              Escolha a ambulância para continuar.
            </Typography>
          </View>
        </View>

        <View className="px-6 gap-4">
          <ActivityCard
            icon="emergency-share"
            title={ambulance ? ambulance.name : "Selecionar Ambulância"}
            description={
              ambulance
                ? ambulance.licensePlate
                : "Nenhuma ambulância selecionada"
            }
            configured={!!ambulance}
            onPress={() => setShowModal(true)}
            animatedValue={cardAnims[0]}
            isLoading={isLoadingAmbulance || isLoadingUser}
          />
        </View>
      </ScrollView>

      {/* BOTÕES FIXOS INFERIORES */}
      {(onBack || onNext) && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-input px-6 py-4">
          <View className="gap-3">
            {onNext && (
              <Button
                title="Continuar"
                onPress={() => {
                  onNext && onNext();
                }}
              />
            )}
            {onBack && (
              <Button
                title="Voltar"
                variant="secondary"
                onPress={() => {
                  onBack && onBack();
                }}
              />
            )}
          </View>
        </View>
      )}

      {showModal && (
        <VehicleSelectionModal
          ambulances={ambulances}
          visible={showModal}
          onSave={(ambulance: GetAmbulances200DataItem) => {
            setAmbulance(ambulance);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </View>
  );
};
