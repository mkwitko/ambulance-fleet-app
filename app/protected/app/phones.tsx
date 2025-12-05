import { Typography } from "@/src/components/ui/typography";
import { useGetAmbulancePhones } from "@/src/http/generated/ambulance/ambulance";
import { useGetAuthenticatedUser } from "@/src/http/generated/user/user";
import { COLORS } from "@/src/styles/colors";
import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Linking,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

type PhoneSource = "companyGroup" | "company" | "unit";

export default function Phones() {
  const { data: user } = useGetAuthenticatedUser();
  const { data: phones } = useGetAmbulancePhones(
    user?.data.ambulance?.id as string,
    {
      query: {
        enabled: !!user?.data.ambulance?.id,
      },
    }
  );

  const [activeFilters, setActiveFilters] = useState<Set<PhoneSource>>(
    new Set(["companyGroup", "company", "unit"])
  );

  const companyGroupPhones = phones?.data?.companyGroup?.phones || [];
  const companyPhones = phones?.data?.company?.phones || [];
  const unitPhones = phones?.data?.unit?.phones || [];

  const allPhones = [
    ...companyGroupPhones.map((p) => ({
      ...p,
      source: "companyGroup" as const,
    })),
    ...companyPhones.map((p) => ({ ...p, source: "company" as const })),
    ...unitPhones.map((p) => ({ ...p, source: "unit" as const })),
  ];

  // Filtra telefones baseado nos filtros ativos
  const filteredPhones = allPhones.filter((phone) =>
    activeFilters.has(phone.source)
  );

  // Animações para cada telefone
  const fadeAnims = useRef(
    filteredPhones.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (filteredPhones.length > 0) {
      // Reset animations
      fadeAnims.forEach((anim) => anim.setValue(0));

      const animations = filteredPhones.map((_, index) =>
        Animated.timing(fadeAnims[index] || new Animated.Value(0), {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        })
      );
      Animated.stagger(50, animations).start();
    }
  }, [filteredPhones.length, activeFilters]);

  // Toggle filter
  const toggleFilter = (source: PhoneSource) => {
    setActiveFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(source)) {
        newFilters.delete(source);
      } else {
        newFilters.add(source);
      }
      // Não permite desativar todos
      if (newFilters.size === 0) {
        return prev;
      }
      return newFilters;
    });
  };

  // Formata número de telefone
  const formatPhoneNumber = (number: string): string => {
    const cleaned = number.replace(/\D/g, "");

    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
        7
      )}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(
        6
      )}`;
    }

    return number;
  };

  // Retorna configurações por tipo de origem
  const getSourceConfig = (source: PhoneSource) => {
    switch (source) {
      case "companyGroup":
        return {
          label: "Grupo Empresarial",
          shortLabel: "Grupo",
          icon: "business" as const,
          bgColor: "bg-primary-100",
          iconColor: COLORS.primary.DEFAULT,
          badgeBg: "bg-primary-50",
          badgeText: "text-primary-700",
          activeBg: "bg-primary-500",
        };
      case "company":
        return {
          label: "Empresa",
          shortLabel: "Empresa",
          icon: "domain" as const,
          bgColor: "bg-OCP-100",
          iconColor: COLORS.OCP.DEFAULT,
          badgeBg: "bg-OCP-50",
          badgeText: "text-OCP-700",
          activeBg: "bg-OCP-500",
        };
      case "unit":
        return {
          label: "Unidade",
          shortLabel: "Unidade",
          icon: "location-city" as const,
          bgColor: "bg-secondary-100",
          iconColor: COLORS.secondary.DEFAULT,
          badgeBg: "bg-secondary-50",
          badgeText: "text-secondary-700",
          activeBg: "bg-secondary-500",
        };
    }
  };

  // Abre WhatsApp
  const openWhatsApp = async (number: string) => {
    try {
      const cleaned = number.replace(/\D/g, "");
      const whatsappUrl = `whatsapp://send?phone=55${cleaned}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(
          "WhatsApp não encontrado",
          "O WhatsApp não está instalado no seu dispositivo."
        );
      }
    } catch (error) {
      console.error("Erro ao abrir WhatsApp:", error);
      Alert.alert(
        "Erro",
        "Não foi possível abrir o WhatsApp. Tente novamente."
      );
    }
  };

  // Faz ligação normal
  const makePhoneCall = async (number: string) => {
    try {
      const cleaned = number.replace(/\D/g, "");
      const phoneUrl = `tel:${cleaned}`;

      // No iOS, não precisa verificar canOpenURL para tel:
      if (Platform.OS === "ios") {
        await Linking.openURL(phoneUrl);
      } else {
        const canOpen = await Linking.canOpenURL(phoneUrl);
        if (canOpen) {
          await Linking.openURL(phoneUrl);
        } else {
          Alert.alert("Erro", "Não foi possível realizar a ligação.");
        }
      }
    } catch (error) {
      console.error("Erro ao fazer ligação:", error);
      Alert.alert(
        "Erro",
        "Não foi possível realizar a ligação. Tente novamente."
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerClassName="pb-32"
      >
        {/* HEADER */}
        <View className="px-6 pt-6 pb-4">
          <Typography variant="title" weight="semibold" className="mb-2">
            Telefones
          </Typography>
          <Typography variant="subtitle" tone="muted" className="leading-5">
            Contatos importantes da sua ambulância
          </Typography>
        </View>

        {/* FILTROS */}
        <View className="px-6 mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-2"
            contentContainerClassName="gap-2"
          >
            {(["companyGroup", "company", "unit"] as PhoneSource[]).map(
              (source) => {
                const config = getSourceConfig(source);
                const isActive = activeFilters.has(source);

                return (
                  <TouchableOpacity
                    key={source}
                    onPress={() => toggleFilter(source)}
                    activeOpacity={0.7}
                    className={`flex-row items-center gap-2 px-4 py-2.5 rounded-xl border ${
                      isActive
                        ? `${config.activeBg} border-transparent`
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <MaterialIcons
                      name={config.icon}
                      size={16}
                      color={isActive ? "white" : config.iconColor}
                    />
                    <Typography
                      variant="small"
                      weight="semibold"
                      className={isActive ? "text-white" : config.badgeText}
                    >
                      {config.shortLabel}
                    </Typography>
                  </TouchableOpacity>
                );
              }
            )}
          </ScrollView>
        </View>

        {/* LISTA DE TELEFONES */}
        <View className="px-6 gap-3">
          {filteredPhones.length === 0 ? (
            <View className="bg-white rounded-2xl p-12 items-center justify-center border border-gray-100">
              <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
                <MaterialIcons
                  name="phone"
                  size={40}
                  color={COLORS.mutedForeground}
                />
              </View>
              <Typography
                variant="body"
                weight="semibold"
                className="text-gray-800 mb-1"
              >
                {allPhones.length === 0
                  ? "Nenhum telefone cadastrado"
                  : "Nenhum telefone encontrado"}
              </Typography>
              <Typography variant="small" tone="muted" className="text-center">
                {allPhones.length === 0
                  ? "Os contatos da ambulância aparecerão aqui"
                  : "Ajuste os filtros para ver mais contatos"}
              </Typography>
            </View>
          ) : (
            filteredPhones.map((phone, index) => {
              const animatedValue = fadeAnims[index] || new Animated.Value(1);
              const sourceConfig = getSourceConfig(phone.source);

              return (
                <Animated.View
                  key={phone.id}
                  style={{
                    opacity: animatedValue,
                    transform: [
                      {
                        translateY: animatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                      {
                        scale: animatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.95, 1],
                        }),
                      },
                    ],
                  }}
                >
                  <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <View className="flex-row items-start gap-4">
                      {/* ÍCONE */}
                      <View
                        className={`p-4 rounded-xl ${
                          phone.isWhatsapp ? "bg-primary-100" : "bg-blue-100"
                        }`}
                      >
                        {phone.isWhatsapp && (
                          <FontAwesome
                            name="whatsapp"
                            size={24}
                            color="black"
                          />
                        )}
                        {!phone.isWhatsapp && (
                          <Feather name="phone" size={24} color="black" />
                        )}
                      </View>

                      {/* CONTEÚDO */}
                      <View className="flex-1">
                        <View className="mb-3">
                          {/* NOME E BADGE DE ORIGEM */}
                          <View className="flex-row items-center justify-between">
                            <Typography
                              variant="caption"
                              weight="semibold"
                              className="text-gray-800 flex-1"
                              numberOfLines={1}
                            >
                              {phone.name || "Contato"}
                            </Typography>

                            {/* BADGE DE ORIGEM */}
                            <View
                              className={`flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full ${sourceConfig.badgeBg}`}
                            >
                              <MaterialIcons
                                name={sourceConfig.icon}
                                size={12}
                                color={sourceConfig.iconColor}
                              />
                              <Typography
                                variant="extraSmall"
                                className={sourceConfig.badgeText}
                              >
                                {sourceConfig.label}
                              </Typography>
                            </View>
                          </View>

                          <Typography variant="body" className="text-gray-600">
                            {formatPhoneNumber(phone.number)}
                          </Typography>
                        </View>

                        {/* BOTÕES DE AÇÃO */}
                        <View className="flex-row gap-2">
                          {phone.isWhatsapp ? (
                            <>
                              {/* BOTÃO WHATSAPP */}
                              <TouchableOpacity
                                onPress={() => openWhatsApp(phone.number)}
                                activeOpacity={0.7}
                                className="flex-1 bg-primary-500 rounded-xl py-3 flex-row items-center justify-center gap-2"
                              >
                                <FontAwesome
                                  name="whatsapp"
                                  size={18}
                                  color="white"
                                />
                                <Typography
                                  variant="small"
                                  weight="semibold"
                                  className="text-white"
                                >
                                  WhatsApp
                                </Typography>
                              </TouchableOpacity>

                              {/* BOTÃO LIGAR */}
                              <TouchableOpacity
                                onPress={() => makePhoneCall(phone.number)}
                                activeOpacity={0.7}
                                className="bg-blue-100 rounded-xl p-3 items-center justify-center"
                              >
                                <MaterialIcons
                                  name="phone"
                                  size={18}
                                  color="#3B82F6"
                                />
                              </TouchableOpacity>
                            </>
                          ) : (
                            // BOTÃO LIGAR (APENAS)
                            <TouchableOpacity
                              onPress={() => makePhoneCall(phone.number)}
                              activeOpacity={0.7}
                              className="flex-1 bg-blue-500 rounded-xl py-3 flex-row items-center justify-center gap-2"
                            >
                              <MaterialIcons
                                name="phone"
                                size={18}
                                color="white"
                              />
                              <Typography
                                variant="small"
                                weight="semibold"
                                className="text-white"
                              >
                                Ligar
                              </Typography>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
