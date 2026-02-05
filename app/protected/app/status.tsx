import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

// ==== TIPOS / CONSTANTES ====
import { STATUS_LABELS } from "@/src/@types/ambulance-status";
import {
  GetAmbulances200DataItemStatus,
  GetAuthenticatedUserAmbulance200,
} from "@/src/http/generated/api.schemas";

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
  useGetAuthenticatedUserAmbulance,
} from "@/src/http/generated/user/user";

// ==== HOOKS INTERNOS ====
import { AblyEvents } from "@/src/@types/ably-events";
import { useUpdateChat } from "@/src/http/generated/chat/chat";
import { queryClient } from "@/src/lib/react-query";
import useAmbulanceStatusHook from "@/src/pages/onboarding/components/activities/hooks/use-ambulance-status-hook";
import useContactHook from "@/src/pages/onboarding/components/activities/hooks/use-contact-hook";
import useDriversHook from "@/src/pages/onboarding/components/activities/hooks/use-drivers-hook";
import useShiftHook, {
  ShiftConfig,
} from "@/src/pages/onboarding/components/activities/hooks/use-shift-hook";
import useAbly from "@/src/services/use-ably";
import Toast from "react-native-toast-message";

export default function Status() {
  const [loading, setLoading] = useState(false);
  // ====== MODAL STATES ======
  const [shiftModalVisible, setShiftModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [driverModalVisible, setDriverModalVisible] = useState(false);

  // ====== USER DATA ======
  const { data: user, queryKey } = useGetAuthenticatedUserAmbulance();
  const ambulance = user?.data.ambulance;

  const { publish } = useAbly({});

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
    useSwitchAmbulanceShift({
      mutation: {
        onSuccess: (data) => {
          queryClient.setQueryData(
            queryKey,
            (oldData: GetAuthenticatedUserAmbulance200 | undefined) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                data: {
                  id: oldData.data.id,
                  ambulance: oldData.data.ambulance
                    ? {
                        ...oldData.data.ambulance,
                        ambulanceShiftHistories: [
                          {
                            shiftStart: data.shiftStart,
                            shiftEnd: data.shiftEnd,
                          },
                        ],
                      }
                    : null,
                },
              };
            },
          );
        },
      },
    });
  const { mutateAsync: switchAmbulanceStatus, isPending: isSwitchingStatus } =
    useSwitchAmbulanceStatus({
      mutation: {
        onSuccess: (data) => {
          queryClient.setQueryData(
            queryKey,
            (oldData: GetAuthenticatedUserAmbulance200 | undefined) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                data: {
                  id: oldData.data.id,
                  ambulance: oldData.data.ambulance
                    ? {
                        ...oldData.data.ambulance,
                        status: data.status,
                      }
                    : null,
                },
              };
            },
          );
        },
      },
    });

  const { mutateAsync: updateChat } = useUpdateChat({
    mutation: {
      onSuccess: () => {
        publish(AblyEvents.updatePhone, {
          chatId: ambulance?.chats[0].id as string,
          currentPhone: contact as string,
        });
        queryClient.setQueryData(
          queryKey,
          (oldData: GetAuthenticatedUserAmbulance200 | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              data: {
                id: oldData.data.id,
                ambulance: oldData.data.ambulance
                  ? {
                      ...oldData.data.ambulance,
                      currentPhone: contact as string,
                    }
                  : null,
              },
            };
          },
        );
      },
    },
  });
  // ====== INTERNAL HOOKS ======
  const { contact, checkContact, handleSaveContact } = useContactHook({
    setContactModalVisible,
  });

  const { handleSaveShift, isShiftOver } = useShiftHook({
    setShiftModalVisible,
    shiftConfig,
    setShiftConfig,
  });

  const {
    driverAssociated,
    hasDriverPermission,
    handleSetDriver,
    handleUnsetDriver,
    drivers,
    isLoadingDrivers,
    handleAssociateDriver,
    handleLogoutDriver,
    foundDriver,
    hasDriverIntegration,
  } = useDriversHook({
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
    setLoading(true);

    try {
      const promises: Promise<unknown>[] = [];

      if (ambulance?.status !== selectedStatus) {
        promises.push(
          switchAmbulanceStatus({
            id: ambulance?.id as string,
            data: { status: selectedStatus },
          }),
        );
      }

      const latest = ambulance?.ambulanceShiftHistories[0];
      if (
        latest &&
        (latest.shiftStart !== shiftConfig.entryTime.toISOString() ||
          latest.shiftEnd !== shiftConfig.exitTime.toISOString())
      ) {
        promises.push(
          (async () => {
            await switchAmbulanceShift({
              id: ambulance?.id as string,
              data: {
                shiftStart: shiftConfig.entryTime.toISOString(),
                shiftEnd: shiftConfig.exitTime.toISOString(),
              },
            });

            const invalidateShiftQueryKey =
              getGetAuthenticatedUserShiftValidationQueryKey();

            await queryClient.invalidateQueries({
              queryKey: invalidateShiftQueryKey,
            });
          })(),
        );
      }

      if (hasDriverIntegration) {
        if (!driverAssociated) {
          promises.push(handleLogoutDriver());
        }

        if (driverAssociated) {
          promises.push(handleAssociateDriver());
        }
      }

      if (contact !== ambulance?.chats[0].currentPhone) {
        promises.push(
          updateChat({
            id: ambulance?.chats[0].id as string,
            data: {
              currentPhone: contact as string,
            },
          }),
        );
      }

      await Promise.all(promises);
      Toast.show({
        type: "success",
        text1: "Configurações salvas com sucesso!",
      });
    } finally {
      setLoading(false);
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
          {hasDriverPermission && drivers && (
            <ActivityCard
              icon="badge"
              title="Associar Motorista"
              description={
                foundDriver
                  ? foundDriver.NomeSocorrista
                  : "Vincule seu perfil de motorista"
              }
              configured={!!foundDriver}
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
          loading={isSwitchingShift || isSwitchingStatus || loading}
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

      {driverModalVisible && hasDriverIntegration && (
        <DriverModal
          visible={driverModalVisible}
          onAssociate={handleSetDriver}
          onRemove={handleUnsetDriver}
          onClose={() => setDriverModalVisible(false)}
          drivers={drivers}
          isLoadingDrivers={isLoadingDrivers}
          driverAssociated={driverAssociated}
        />
      )}
    </View>
  );
}
