import { Typography } from "@/src/components/ui/typography";
import { useGetAmbulanceDocuments } from "@/src/http/generated/ambulance/ambulance";
import {
  GetAmbulanceDocuments200DataDocumentsItem,
  GetChatMessages200DataItemMessageType,
} from "@/src/http/generated/api.schemas";
import { useGetAuthenticatedUser } from "@/src/http/generated/user/user";
import { DocumentViewerModal } from "@/src/pages/chat/modals/document-preview-modal";
import { COLORS } from "@/src/styles/colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, TouchableOpacity, View } from "react-native";

export default function Documents() {
  const { data: user } = useGetAuthenticatedUser();
  const { data: documents } = useGetAmbulanceDocuments(
    user?.data.ambulance?.id as string,
    {
      query: {
        enabled: !!user?.data.ambulance?.id,
      },
    }
  );

  const [selectedDocument, setSelectedDocument] =
    useState<GetAmbulanceDocuments200DataDocumentsItem | null>(null);

  const ambulanceDocuments = documents?.data.documents || [];

  // Animações para cada documento
  const fadeAnims = useRef(
    ambulanceDocuments.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Anima os cards sequencialmente
    if (ambulanceDocuments.length > 0) {
      const animations = ambulanceDocuments.map((_, index) =>
        Animated.timing(fadeAnims[index] || new Animated.Value(0), {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        })
      );
      Animated.stagger(50, animations).start();
    }
  }, [ambulanceDocuments]);

  const isDocumentValid = (validUntil: string | null): boolean => {
    if (!validUntil) return true;
    return new Date(validUntil) > new Date();
  };

  const formatValidUntil = (validUntil: string | null): string => {
    if (!validUntil) return "Sem prazo de validade";
    const date = new Date(validUntil);
    const now = new Date();
    const isValid = date > now;
    const formatted = date.toLocaleDateString("pt-BR");

    if (isValid) {
      return `Válido até ${formatted}`;
    } else {
      return `Vencido em ${formatted}`;
    }
  };

  const openDocument = (doc: GetAmbulanceDocuments200DataDocumentsItem) => {
    setSelectedDocument(doc);
  };

  const closeDocument = () => {
    setSelectedDocument(null);
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
            Documentos
          </Typography>
          <Typography variant="subtitle" tone="muted" className="leading-5">
            Gerencie todos os documentos relacionados à sua ambulância
          </Typography>
        </View>

        {/* LISTA DE DOCUMENTOS */}
        <View className="px-6 gap-3">
          {ambulanceDocuments.length === 0 ? (
            <View className="bg-white rounded-2xl p-12 items-center justify-center border border-gray-100">
              <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
                <MaterialIcons
                  name="description"
                  size={40}
                  color={COLORS.mutedForeground}
                />
              </View>
              <Typography
                variant="body"
                weight="semibold"
                className="text-gray-800 mb-1"
              >
                Nenhum documento encontrado
              </Typography>
              <Typography variant="small" tone="muted" className="text-center">
                Os documentos da ambulância aparecerão aqui
              </Typography>
            </View>
          ) : (
            ambulanceDocuments.map((doc, index) => {
              const isValid = isDocumentValid(doc.validUntil);
              const animatedValue = fadeAnims[index] || new Animated.Value(1);

              return (
                <Animated.View
                  key={doc.id}
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
                  <TouchableOpacity
                    onPress={() => openDocument(doc)}
                    activeOpacity={0.7}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                  >
                    <View className="flex-row items-start gap-4">
                      {/* ÍCONE COM GLASSMORPHISM */}
                      <View className="p-4 rounded-xl bg-primary-100/50">
                        <Ionicons
                          name="document-attach-outline"
                          size={24}
                          color={COLORS.primary.DEFAULT}
                        />
                      </View>

                      {/* CONTEÚDO */}
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                          <Typography
                            variant="caption"
                            weight="semibold"
                            className="text-gray-800 flex-1 mr-2"
                            numberOfLines={1}
                          >
                            {doc.title}
                          </Typography>

                          {/* ÍCONE DE VISUALIZAR */}
                          <MaterialIcons
                            name="open-in-new"
                            size={20}
                            color={COLORS.mutedForeground}
                          />
                        </View>

                        <Typography
                          variant="extraSmall"
                          className="text-gray-500 mb-3"
                        >
                          {doc.type.toUpperCase()}
                        </Typography>

                        {/* STATUS DE VALIDADE */}
                        <View
                          className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full self-start ${
                            isValid ? "bg-primary-100" : "bg-red-50"
                          }`}
                        >
                          <View
                            className={`w-2 h-2 rounded-full ${
                              isValid ? "bg-primary-500" : "bg-red-500"
                            }`}
                          />
                          <Typography
                            variant="extraSmall"
                            className={
                              isValid ? "text-primary-700" : "text-red-700"
                            }
                          >
                            {formatValidUntil(doc.validUntil)}
                          </Typography>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* DOCUMENT VIEWER MODAL */}
      {selectedDocument && (
        <DocumentViewerModal
          visible={!!selectedDocument}
          attachment={{
            uri: selectedDocument.content,
            name: selectedDocument.title,
            type: GetChatMessages200DataItemMessageType.DOCUMENT,
          }}
          onClose={closeDocument}
        />
      )}
    </View>
  );
}
