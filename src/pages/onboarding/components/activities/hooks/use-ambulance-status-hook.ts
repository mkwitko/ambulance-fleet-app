import { AmbulanceStatus } from "@/src/@types/ambulance-status";
import { GetAmbulances200DataItemStatus } from "@/src/http/generated/api.schemas";

export default function useAmbulanceStatusHook({
  selectedStatus,
  setSelectedStatus,
}: {
  selectedStatus: GetAmbulances200DataItemStatus | null;
  setSelectedStatus: (status: GetAmbulances200DataItemStatus) => void;
}) {
  const isValidStatus =
    selectedStatus !== GetAmbulances200DataItemStatus.FA &&
    selectedStatus !== GetAmbulances200DataItemStatus.MN;

  const handleSaveStatus = (status: AmbulanceStatus) => {
    setSelectedStatus(status);
  };

  return {
    isValidStatus,
    handleSaveStatus,
    selectedStatus,
    setSelectedStatus,
  };
}
