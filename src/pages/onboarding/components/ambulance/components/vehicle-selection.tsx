import { ManualSelectionModal } from "@/src/components/vehicle-selection/manual-selection-modal";
import ManualSelectionPage from "@/src/components/vehicle-selection/manual-selection-page";
import { VehicleScanner } from "@/src/components/vehicle-selection/vehicle-scanner";
import {
  GetAmbulances200,
  GetAmbulances200DataItem,
} from "@/src/http/generated/api.schemas";
import React, { useState } from "react";
import { Animated, Modal, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";

type SelectionMode = "qr" | "manual";

interface VehicleSelectionModalProps {
  ambulances: GetAmbulances200 | undefined;
  visible: boolean;
  onSave: (ambulance: GetAmbulances200DataItem) => void;
  onClose: () => void;
}

export const VehicleSelectionModal: React.FC<VehicleSelectionModalProps> = ({
  ambulances,
  visible,
  onSave,
  onClose,
}) => {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("qr");
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [manualModalVisible, setManualModalVisible] = useState(false);

  const scaleAnim = useState(new Animated.Value(0))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  // ao escanear QR
  const handleBarcodeScanned = async (data: { data: string }) => {
    setScannedCode(data.data);
    const ambulance = ambulances?.data.find(
      (item) => item.ambulanceCode === data.data,
    );
    if (!ambulance) {
      onClose();
      Toast.show({
        type: "error",
        text1: "Veículo não encontrado",
        text2: "O código escaneado não corresponde a nenhum veículo.",
      });
      setScannedCode(null);
      return;
    }
    onSave(ambulance);

    onClose();
  };

  // manual
  const handleSelectVehicle = async (ambulance: GetAmbulances200DataItem) => {
    setScannedCode(null);
    setManualModalVisible(false);
    onSave(ambulance);
    onClose();
  };

  const handleReset = () => {
    setScannedCode(null);
  };

  const handleSwitchToManual = () => {
    setSelectionMode("manual");
    setManualModalVisible(true);
  };

  const handleCloseManualModal = () => {
    setManualModalVisible(false);
    setSelectionMode("qr");
  };

  const renderQRCodePage = () => {
    return (
      <VehicleScanner
        onBarcodeScanned={handleBarcodeScanned}
        onManualSelect={handleSwitchToManual}
      />
    );
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        className="flex-1 justify-end"
        style={{ opacity: fadeAnim }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="absolute inset-0 bg-black/60"
        />

        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="bg-white rounded-t-[32px] overflow-hidden max-h-[90%]"
        >
          {selectionMode === "qr" ? (
            renderQRCodePage()
          ) : (
            <ManualSelectionPage />
          )}
        </Animated.View>
      </Animated.View>

      {/* Submodal da seleção manual */}
      <ManualSelectionModal
        visible={manualModalVisible}
        ambulances={ambulances?.data}
        onSelect={handleSelectVehicle}
        onClose={handleCloseManualModal}
      />
    </Modal>
  );
};
