import { AmbulanceStatus, STATUS_LABELS } from "@/src/@types/ambulance-status";
import { Typography } from "@/src/components/ui/typography";
import { COLORS } from "@/src/styles/colors";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface Props {
  status: AmbulanceStatus;
  onSelect: (status: AmbulanceStatus) => void;
}

export function StatusListItem({ status, onSelect }: Props) {
  return (
    <TouchableOpacity
      onPress={() => onSelect(status)}
      activeOpacity={0.7}
      className="flex-row items-center justify-between py-4 px-3 rounded-xl bg-white active:bg-gray-50"
    >
      <View>
        <Typography variant="body" weight="medium">
          {status}
        </Typography>
        <Typography variant="caption" tone="muted">
          {STATUS_LABELS[status]}
        </Typography>
      </View>
      <FontAwesome
        name="chevron-right"
        size={18}
        color={COLORS.mutedForeground}
      />
    </TouchableOpacity>
  );
}
