import { Typography } from "@/src/components/ui/typography";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { UseAudioRecorderHookReturn } from "./hooks/use-audio-hook";

export default function RecordingChatInput({
  audioRecorderHook,
}: {
  audioRecorderHook: UseAudioRecorderHookReturn;
}) {
  const { recorderState, stopRecording } = audioRecorderHook;
  return (
    <View className="bg-white border-t border-gray-200 px-6 py-4">
      <View className="flex-row items-center gap-3">
        {/* Animação de gravação */}
        <View className="flex-row items-center gap-2 flex-1">
          <View className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
          <View className="flex-1 bg-gray-100 rounded-xl px-4 py-3">
            <View className="flex-row items-center justify-between">
              <MaterialIcons name="mic" size={24} color={COLORS.destructive} />
              <View className="flex-1 mx-3">
                <View className="h-8 flex-row items-center gap-1">
                  {/* Barras de áudio animadas */}
                  {[...Array(20)].map((_, i) => (
                    <View
                      key={i}
                      className="flex-1 bg-primary rounded-full"
                      style={{
                        height: Math.random() * 32,
                      }}
                    />
                  ))}
                </View>
              </View>
              <Typography variant="small" className="text-gray-600">
                {Math.floor(recorderState.durationMillis / 1000)}s
              </Typography>
            </View>
          </View>
        </View>

        {/* Botão de parar gravação */}
        <TouchableOpacity
          onPress={stopRecording}
          className="p-3 rounded-full bg-primary"
        >
          <MaterialIcons name="stop" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
