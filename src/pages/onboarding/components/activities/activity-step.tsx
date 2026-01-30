import { STATUS_LABELS } from "@/src/@types/ambulance-status";
import { Button } from "@/src/components/ui/button";
import { Typography } from "@/src/components/ui/typography";
import { GetAmbulances200DataItemStatus } from "@/src/http/generated/api.schemas";
import { useOnboarding } from "@/src/providers/onboarding-context";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useEffect, useState } from "react";
import { Animated, Dimensions, ScrollView, View } from "react-native";
import useFinishOnboardHook from "../../hooks/use-finish-onboard-hook";
import { StepProps } from "../../hooks/use-onboard-steps-hook";
import { ActivityCard } from "./components/activity-card";
import { ContactModal } from "./components/contact-modal";
import { DriverModal } from "./components/driver-modal";
import { ShiftModal } from "./components/shift-modal";
import { StatusModal } from "./components/status-modal";
import useActivitiesAnimationsHook from "./hooks/use-activities-animation-hook";
import useActivitiesProgressHook from "./hooks/use-activities-progress-hook";
import useAmbulanceStatusHook from "./hooks/use-ambulance-status-hook";
import useContactHook from "./hooks/use-contact-hook";
import useDriversHook from "./hooks/use-drivers-hook";
import useShiftHook from "./hooks/use-shift-hook";

export const ActivitiesStep: React.FC<StepProps> = ({ onBack }) => {
  const [shiftModalVisible, setShiftModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [driverModalVisible, setDriverModalVisible] = useState(false);

  const {
    ambulance,
    shiftConfig,
    setShiftConfig,
    selectedStatus,
    setSelectedStatus,
  } = useOnboarding();

  useEffect(() => {
    if (ambulance?.status) {
      handleSaveStatus(ambulance.status);
    }
    if (!!ambulance?.ambulanceShiftHistories?.length) {
      const latestShift = ambulance.ambulanceShiftHistories[0];
      if (!latestShift.shiftStart || !latestShift.shiftEnd) return;
      handleSaveShift(
        new Date(latestShift.shiftStart),
        new Date(latestShift.shiftEnd),
      );
    }
  }, [ambulance]);

  const animationActivitiesState = useActivitiesAnimationsHook({
    shiftModalVisible,
    contactModalVisible,
    driverModalVisible,
    statusModalVisible,
  });

  const { animateEntrance, animateProgress, progressAnim } =
    animationActivitiesState;

  const { contact, checkContact, handleSaveContact } = useContactHook({
    animationState: animationActivitiesState,
    setContactModalVisible,
  });

  const { handleSaveShift, isShiftOver } = useShiftHook({
    animationState: animationActivitiesState,
    setShiftModalVisible,
    shiftConfig,
    setShiftConfig,
  });

  const {
    driverAssociated,
    foundDriver,
    hasDriverPermission,
    handleSetDriver,
    handleUnsetDriver,
    handleAssociateDriver,
    drivers,
    hasDriverIntegration,
    isLoading,
  } = useDriversHook({
    setDriverModalVisible,
  });

  const { progressPercentage, activeCount, totalCount } =
    useActivitiesProgressHook({
      contact,
      driverAssociated,
      hasDriverPermission,
      animateProgress,
      isShiftOver,
    });

  const { isValidStatus, handleSaveStatus } = useAmbulanceStatusHook({
    selectedStatus,
    setSelectedStatus,
  });

  const { isFinishingOnboarding, handleFinishOnboarding } =
    useFinishOnboardHook({ handleAssociateDriver });

  useEffect(() => {
    checkContact();
    animateEntrance();
  }, []);

  const SCREEN_WIDTH = Dimensions.get("window").width;

  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerClassName="pb-32"
      >
        {/* HEADER */}
        <View className="p-6 pt-0">
          <View className="gap-2">
            <Typography variant="title" weight="semibold">
              Configurações de Atividade
            </Typography>
            <Typography variant="subtitle">
              Configure seu turno e informações essenciais
            </Typography>
          </View>

          {/* PROGRESS CARD */}
          <View className="bg-primary rounded-xl p-6 mt-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="gap-1">
                <Typography variant="small" className="text-primary-100">
                  Progresso Geral
                </Typography>
                <Typography
                  variant="title"
                  weight="bold"
                  className="text-white"
                >
                  {activeCount} de {totalCount}
                </Typography>
              </View>
              <View className="p-4 rounded-2xl bg-white/20">
                <Typography
                  variant="title"
                  weight="bold"
                  className="text-white"
                >
                  {progressPercentage.toFixed(0)}%
                </Typography>
              </View>
            </View>

            {/* BARRA ANIMADA */}
            <View className="h-3 bg-white/20 rounded-full overflow-hidden">
              <Animated.View
                className="h-full bg-white rounded-full"
                style={{
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, SCREEN_WIDTH],
                  }),
                }}
              />
            </View>
          </View>
        </View>

        {/* LISTA DE CONFIGURAÇÕES */}
        <View className="px-6 gap-4">
          <ActivityCard
            icon="schedule"
            title="Configurar Turno"
            description={
              shiftConfig.status
                ? `${format(shiftConfig.entryTime, "dd/MM 'às' HH:mm", {
                    locale: ptBR,
                  })} até ${format(shiftConfig.exitTime, "dd/MM 'às' HH:mm", {
                    locale: ptBR,
                  })}`
                : "Defina seu horário de trabalho"
            }
            configured={shiftConfig.status && !isShiftOver}
            onPress={() => setShiftModalVisible(true)}
          />

          <ActivityCard
            icon="bookmark"
            title={isValidStatus ? selectedStatus : "Status da Ambulância"}
            description={
              isValidStatus
                ? STATUS_LABELS[selectedStatus]
                : "Selecione o status operacional da ambulância"
            }
            configured={
              selectedStatus !== GetAmbulances200DataItemStatus.FA &&
              selectedStatus !== GetAmbulances200DataItemStatus.MN
            }
            onPress={() => setStatusModalVisible(true)}
          />

          <ActivityCard
            icon="phone"
            title="Contato da Central"
            description={
              !!contact
                ? "Contato configurado com sucesso"
                : "Adicione o contato da central"
            }
            configured={!!contact}
            onPress={() => setContactModalVisible(true)}
          />

          {hasDriverPermission && (
            <ActivityCard
              icon="badge"
              title="Associar Motorista"
              description={
                foundDriver
                  ? foundDriver.NomeSocorrista
                  : "Vincule seu perfil de motorista"
              }
              configured={!!foundDriver}
              disabled={!hasDriverIntegration || !drivers || !drivers.length}
              onPress={() => setDriverModalVisible(true)}
            />
          )}
        </View>

        {/* INFO FOOTER */}
        <View className="mx-6 mt-4 bg-blue-50 rounded-2xl p-5">
          <View className="flex-row gap-3">
            <View className="pt-0.5">
              <MaterialIcons
                name="info-outline"
                size={20}
                color={COLORS.primary.DEFAULT}
              />
            </View>
            <View className="flex-1">
              <Typography variant="small" className="text-blue-900 leading-5">
                Estas configurações podem ser alteradas posteriormente nas
                configurações do aplicativo
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* BOTÕES FIXOS INFERIORES */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-input px-6 py-4">
        <View className="gap-3">
          <Button
            title={
              activeCount === totalCount
                ? "Continuar"
                : `Faltam ${totalCount - activeCount}`
            }
            onPress={handleFinishOnboarding}
            disabled={activeCount < totalCount}
            loading={isFinishingOnboarding || isLoading}
          />
          {onBack && (
            <Button
              title="Voltar"
              variant="secondary"
              onPress={onBack}
              disabled={isFinishingOnboarding}
            />
          )}
        </View>
      </View>

      {/* MODALS */}
      {shiftModalVisible && (
        <ShiftModal
          visible={shiftModalVisible}
          onSave={handleSaveShift}
          onClose={() => setShiftModalVisible(false)}
          shiftConfig={shiftConfig}
          isShiftOver={isShiftOver}
        />
      )}

      {contactModalVisible && (
        <ContactModal
          visible={contactModalVisible}
          onSave={handleSaveContact}
          onClose={() => setContactModalVisible(false)}
          contact={contact}
        />
      )}

      {statusModalVisible && (
        <StatusModal
          visible={statusModalVisible}
          onSave={handleSaveStatus}
          onClose={() => setStatusModalVisible(false)}
        />
      )}

      {driverModalVisible && hasDriverIntegration && (
        <DriverModal
          visible={driverModalVisible}
          onAssociate={handleSetDriver}
          onRemove={handleUnsetDriver}
          onClose={() => setDriverModalVisible(false)}
          drivers={drivers}
          isLoadingDrivers={isLoading}
          driverAssociated={driverAssociated}
        />
      )}
    </View>
  );
};
