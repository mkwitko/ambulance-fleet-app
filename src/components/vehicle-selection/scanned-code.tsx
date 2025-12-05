import { Button } from "@/src/components/ui/button";
import { Typography } from "@/src/components/ui/typography";
import React from "react";
import { View } from "react-native";

export default function ScannedCode({
  scannedCode,
  handleReset,
}: {
  scannedCode: string;
  handleReset: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Typography variant="title" align="center" className="mb-3">
        Veículo detectado
      </Typography>
      <Typography variant="body" align="center" tone="info" className="mb-8">
        Código do QR: {scannedCode}
      </Typography>
      <Button
        title="Escanear novamente"
        variant="outline"
        onPress={handleReset}
      />
    </View>
  );
}
