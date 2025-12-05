import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

// ==== TIPOS / CONSTANTES ====
import { STATUS_LABELS } from "@/src/@types/ambulance-status";
import { GetAmbulances200DataItemStatus } from "@/src/http/generated/api.schemas";

// ==== COMPONENTES ====
import { Button } from "@/src/components/ui/button";
import { Typography } from "@/src/components/ui/typography";
import { ActivityCard } from "@/src/pages/onboarding/components/activities/components/activity-card";

// ==== MODAIS ====
import { ContactModal } from "@/src/pages/onboarding/components/activities/components/contact-modal";
import { DriverModal } from "@/src/pages/onboarding/components/activities/components/driver-modal";
import { ShiftModal } from "@/src/pages/onboarding/components/activities/components/shift-modal";
import { StatusModal } from "@/src/pages/onboarding/components/activities/components/status-modal";

// ==== API HOOKS ====
import {
  useSwitchAmbulanceShift,
  useSwitchAmbulanceStatus,
} from "@/src/http/generated/ambulance/ambulance";
import {
  getGetAuthenticatedUserShiftValidationQueryKey,
  useGetAuthenticatedUser,
} from "@/src/http/generated/user/user";

// ==== HOOKS INTERNOS ====
import { queryClient } from "@/src/lib/react-query";
import useAmbulanceStatusHook from "@/src/pages/onboarding/components/activities/hooks/use-ambulance-status-hook";
import useContactHook from "@/src/pages/onboarding/components/activities/hooks/use-contact-hook";
import useDriversHook from "@/src/pages/onboarding/components/activities/hooks/use-drivers-hook";
import useShiftHook, {
  ShiftConfig,
} from "@/src/pages/onboarding/components/activities/hooks/use-shift-hook";

export default function Status() {
  // ====== MODAL STATES ======
  const [shiftModalVisible, setShiftModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [driverModalVisible, setDriverModalVisible] = useState(false);
  const [ambulanceModalVisible, setAmbulanceModalVisible] = useState(false);

  // ====== USER DATA ======
  const { data: user } = useGetAuthenticatedUser();
  const ambulance = user?.data.ambulance;

  // ====== LOCAL STATE ======
  const [selectedStatus, setSelectedStatus] =
    useState<GetAmbulances200DataItemStatus>(GetAmbulances200DataItemStatus.FA);

  const [shiftConfig, setShiftConfig] = useState<ShiftConfig>(() => {
    const entry = new Date();
    const exit = new Date(entry);
    exit.setHours(entry.getHours() + 8);
    return { status: false, entryTime: entry, exitTime: exit };
  });

  // ====== API MUTATIONS ======
  const { mutateAsync: switchAmbulanceShift, isPending: isSwitchingShift } =
    useSwitchAmbulanceShift();
  const { mutateAsync: switchAmbulanceStatus, isPending: isSwitchingStatus } =
    useSwitchAmbulanceStatus();

  // ====== INTERNAL HOOKS ======
  const { contact, checkContact, handleSaveContact } = useContactHook({
    setContactModalVisible,
  });

  const { handleSaveShift, isShiftOver } = useShiftHook({
    setShiftModalVisible,
    shiftConfig,
    setShiftConfig,
  });

  const { driverAssociated, hasDriverPermission, handleAssociateDriver } =
    useDriversHook({
      setDriverModalVisible,
    });

  const { isValidStatus, handleSaveStatus } = useAmbulanceStatusHook({
    selectedStatus,
    setSelectedStatus,
  });

  // ====== INITIAL LOAD ======
  useEffect(() => {
    checkContact();
  }, []);

  // ====== SYNC BACKEND DATA ======
  useEffect(() => {
    if (!ambulance) return;

    if (ambulance.status) {
      handleSaveStatus(ambulance.status as GetAmbulances200DataItemStatus);
    }

    if (ambulance.ambulanceShiftHistories?.length) {
      const latest = ambulance.ambulanceShiftHistories[0];
      if (latest.shiftStart && latest.shiftEnd) {
        handleSaveShift(new Date(latest.shiftStart), new Date(latest.shiftEnd));
      }
    }
  }, [ambulance]);

  // ====== SAVE CONFIG ======
  const handleFinishOnboarding = async () => {
    if (ambulance?.status !== selectedStatus) {
      switchAmbulanceStatus({
        id: ambulance?.id as string,
        data: { status: selectedStatus },
      });
    }

    const latest = ambulance?.ambulanceShiftHistories[0];
    if (
      latest &&
      (latest.shiftStart !== shiftConfig.entryTime.toISOString() ||
        latest.shiftEnd !== shiftConfig.exitTime.toISOString())
    ) {
      await switchAmbulanceShift({
        id: ambulance?.id as string,
        data: {
          shiftStart: shiftConfig.entryTime.toISOString(),
          shiftEnd: shiftConfig.exitTime.toISOString(),
        },
      });
      const invalidateShiftQueryKey =
        getGetAuthenticatedUserShiftValidationQueryKey();
      await queryClient
        .invalidateQueries({
          queryKey: invalidateShiftQueryKey,
        })
        .then((response) => {
          console.log({ response });
        });
    }
  };

  // =====================================================================
  // =========================== RENDER =================================
  // =====================================================================

  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerClassName="pb-32"
      >
        {/* HEADER */}
        <View className="p-6">
          <Typography variant="title" weight="semibold">
            Configurações Essenciais
          </Typography>
          <Typography variant="subtitle">
            Configure seu turno, status e outras informações essenciais
          </Typography>
        </View>

        {/* LISTA DE CONFIGURAÇÕES */}
        <View className="px-6 gap-4">
          {/* TURNO */}
          <ActivityCard
            icon="schedule"
            title="Configurar Turno"
            description={
              isShiftOver
                ? "Seu turno atual expirou"
                : shiftConfig.status
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

          {/* STATUS */}
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

          {/* CONTATO */}
          <ActivityCard
            icon="phone"
            title="Contato da Central"
            description={
              contact
                ? "Contato configurado com sucesso"
                : "Adicione o contato da central"
            }
            configured={!!contact}
            onPress={() => setContactModalVisible(true)}
          />

          {/* DRIVER */}
          {hasDriverPermission && (
            <ActivityCard
              icon="badge"
              title="Associar Motorista"
              description={
                driverAssociated
                  ? "Motorista associado"
                  : "Vincule seu perfil de motorista"
              }
              configured={driverAssociated}
              onPress={() => setDriverModalVisible(true)}
            />
          )}
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-input px-6 py-4">
        <Button
          title="Confirmar Configurações"
          onPress={handleFinishOnboarding}
          loading={isSwitchingShift || isSwitchingStatus}
        />
      </View>

      {/* MODAIS */}
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

      {driverModalVisible && (
        <DriverModal
          visible={driverModalVisible}
          onAssociate={handleAssociateDriver}
          onClose={() => setDriverModalVisible(false)}
        />
      )}
    </View>
  );
}
