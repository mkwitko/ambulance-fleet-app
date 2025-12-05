import React, { createContext, ReactNode, useContext } from "react";
import useGetUserPermissions from "../hooks/use-get-user-permissions";
import {
  useAssociateUserToAmbulance,
  useGetAmbulances,
} from "../http/generated/ambulance/ambulance";
import { GetAmbulances200DataItem } from "../http/generated/api.schemas";
import { useGetAuthenticatedUser } from "../http/generated/user/user";
import { queryClient } from "../lib/react-query";
import { VehicleSelectionModal } from "../pages/onboarding/components/ambulance/components/vehicle-selection";

interface ChangeAmbulanceContextData {
  showAmbulanceModal: boolean;
  setShowAmbulanceModal: (value: boolean) => void;
}

const ChangeAmbulanceContext = createContext<ChangeAmbulanceContextData>(
  {} as ChangeAmbulanceContextData
);

export const ChangeAmbulanceProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { data: user } = useGetAuthenticatedUser();
  const [showAmbulanceModal, setShowAmbulanceModal] = React.useState(false);

  const { queryParams, hasSomePermission } = useGetUserPermissions();
  const { data: ambulances } = useGetAmbulances(queryParams, {
    query: {
      enabled: hasSomePermission && !!user,
    },
  });

  const { mutateAsync: associateUserToAmbulance } = useAssociateUserToAmbulance(
    {
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries();
        },
      },
    }
  );

  return (
    <ChangeAmbulanceContext.Provider
      value={{
        showAmbulanceModal,
        setShowAmbulanceModal,
      }}
    >
      {children}

      {showAmbulanceModal && (
        <VehicleSelectionModal
          ambulances={ambulances}
          visible={showAmbulanceModal}
          onSave={(ambulance: GetAmbulances200DataItem) => {
            associateUserToAmbulance({
              data: {
                ambulanceId: ambulance?.id as string,
                userId: user?.data.id as string,
              },
            });
          }}
          onClose={() => setShowAmbulanceModal(false)}
        />
      )}
    </ChangeAmbulanceContext.Provider>
  );
};

export const useChangeAmbulance = () => useContext(ChangeAmbulanceContext);
