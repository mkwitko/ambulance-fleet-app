import { Typography } from "@/src/components/ui/typography";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useGetAuthenticatedUser } from "../http/generated/user/user";
import SidebarModal from "./sidebar-modal";

export const HeaderWithSidebar: React.FC<{
  canNavigate: boolean;
  setShowBlockedModal: (value: boolean) => void;
}> = ({ canNavigate, setShowBlockedModal }) => {
  const { data: user } = useGetAuthenticatedUser();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleMenuPress = () => {
    setSidebarVisible(true);
  };

  return (
    <>
      {/* HEADER */}
      <View className="border-b border-input bg-white/70">
        <View className="px-4 py-3 flex-row items-center justify-between">
          {/* MENU BUTTON */}
          {canNavigate && (
            <TouchableOpacity
              onPress={handleMenuPress}
              disabled={!canNavigate}
              className="p-2 -mt-1"
              activeOpacity={0.7}
            >
              <MaterialIcons name="menu" size={28} color={COLORS.foreground} />
            </TouchableOpacity>
          )}
          {!canNavigate && (
            <TouchableOpacity
              onPress={() => {
                setShowBlockedModal(true);
              }}
              className="p-2 -mt-1"
              activeOpacity={0.7}
            >
              <MaterialIcons name="block" size={24} color={COLORS.foreground} />
            </TouchableOpacity>
          )}

          {/* AMBULANCE INFO */}
          <View className="flex-1 mx-3">
            <View className="flex-row items-center gap-2">
              <MaterialIcons
                name="local-shipping"
                size={20}
                color={COLORS.primary.DEFAULT}
              />
              <Typography variant="body" weight="bold">
                {user?.data.ambulance?.name}
              </Typography>
              <View className="px-2 py-0.5 rounded-full bg-QAP/10">
                <Typography
                  variant="small"
                  weight="semibold"
                  className="text-QAP-700"
                >
                  {user?.data.ambulance?.status}
                </Typography>
              </View>
            </View>
            <Typography variant="extraSmall" tone="muted" weight="semibold">
              {user?.data.ambulance?.licensePlate}
            </Typography>
          </View>

          {/* USER AVATAR */}
          <TouchableOpacity activeOpacity={0.7}>
            <View
              className={`w-10 h-10 rounded-full ${
                canNavigate ? "bg-primary" : "bg-muted"
              } items-center justify-center`}
            >
              <Typography
                variant="body"
                weight="bold"
                className={canNavigate ? "text-white" : "text-muted-foreground"}
              >
                {user?.data.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </Typography>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* SIDEBAR MODAL */}
      <SidebarModal
        sidebarVisible={sidebarVisible}
        setSidebarVisible={setSidebarVisible}
        user={user}
      />
    </>
  );
};
