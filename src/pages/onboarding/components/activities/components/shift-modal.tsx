import { PresetShift } from "@/src/@types/preset-shift";
import { ModalWrapper } from "@/src/components/modal-wrapper";
import { Button } from "@/src/components/ui/button";
import { Typography } from "@/src/components/ui/typography";
import { PRESET_SHIFTS } from "@/src/data/preset-shift";
import { COLORS } from "@/src/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  addDays,
  differenceInHours,
  differenceInMinutes,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { ShiftConfig } from "../hooks/use-shift-hook";

interface ShiftModalProps {
  visible: boolean;
  shiftConfig: ShiftConfig;
  onSave: (entryDate: Date, exitDate: Date) => void;
  onClose: () => void;
  title?: string;
  description?: string;
  showPresets?: boolean;
  isShiftOver?: boolean;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  visible,
  shiftConfig,
  onSave,
  onClose,
  title = "Configurar Escala",
  description = "Defina quando entra e sai do plantão",
  showPresets = true,
  isShiftOver = false,
}) => {
  const [entryDate, setEntryDate] = useState<Date>(
    !isShiftOver ? new Date(shiftConfig.entryTime) : new Date()
  );
  const [exitDate, setExitDate] = useState<Date>(
    !isShiftOver ? new Date(shiftConfig.exitTime) : addDays(new Date(), 1)
  );

  const [showEntryDatePicker, setShowEntryDatePicker] = useState(false);
  const [showEntryTimePicker, setShowEntryTimePicker] = useState(false);
  const [showExitDatePicker, setShowExitDatePicker] = useState(false);
  const [showExitTimePicker, setShowExitTimePicker] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // --------------------------------------------------
  //              LÓGICA
  // --------------------------------------------------

  const handlePresetSelect = (preset: PresetShift) => {
    setSelectedPreset(preset.id);
    const exit = new Date(entryDate);
    exit.setHours(exit.getHours() + preset.hours);
    setExitDate(exit);
  };

  const handleEntryDateChange = (event: any, selectedDate?: Date) => {
    setShowEntryDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const newEntry = new Date(entryDate);
      newEntry.setFullYear(selectedDate.getFullYear());
      newEntry.setMonth(selectedDate.getMonth());
      newEntry.setDate(selectedDate.getDate());
      setEntryDate(newEntry);
      setSelectedPreset(null);
    }
  };

  const handleEntryTimeChange = (event: any, selectedTime?: Date) => {
    setShowEntryTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      const newEntry = new Date(entryDate);
      newEntry.setHours(selectedTime.getHours());
      newEntry.setMinutes(selectedTime.getMinutes());
      setEntryDate(newEntry);
      setSelectedPreset(null);
    }
  };

  const handleExitDateChange = (event: any, selectedDate?: Date) => {
    setShowExitDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const newExit = new Date(exitDate);
      newExit.setFullYear(selectedDate.getFullYear());
      newExit.setMonth(selectedDate.getMonth());
      newExit.setDate(selectedDate.getDate());
      setExitDate(newExit);
      setSelectedPreset(null);
    }
  };

  const handleExitTimeChange = (event: any, selectedTime?: Date) => {
    setShowExitTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      const newExit = new Date(exitDate);
      newExit.setHours(selectedTime.getHours());
      newExit.setMinutes(selectedTime.getMinutes());
      setExitDate(newExit);
      setSelectedPreset(null);
    }
  };

  const getShiftDuration = (): string => {
    const hours = differenceInHours(exitDate, entryDate);
    const totalMinutes = differenceInMinutes(exitDate, entryDate);
    const minutes = totalMinutes % 60;

    if (hours < 0) return "Data inválida";
    if (hours === 0 && minutes === 0) return "Sem duração";
    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
  };

  const isValidShift = exitDate > entryDate;

  const handleSave = () => {
    if (isValidShift) {
      onSave(entryDate, exitDate);
      onClose();
    }
  };

  // --------------------------------------------------
  //              RETORNO COM MODAL WRAPPER
  // --------------------------------------------------

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={title}
      maxHeightPct={90}
      icon={
        <View className="p-6 rounded-full bg-primary-200/50">
          <MaterialIcons
            name="schedule"
            size={40}
            color={COLORS.primary.DEFAULT}
          />
        </View>
      }
      footer={
        <View className="gap-3">
          <Button
            title="Salvar Escala"
            onPress={handleSave}
            disabled={!isValidShift}
          />
          <Button title="Cancelar" variant="secondary" onPress={onClose} />
        </View>
      }
    >
      <View className="gap-2">
        <Typography variant="body" tone="muted" align="center">
          {description}
        </Typography>
      </View>

      {/* TURNOS PRÉ-DEFINIDOS */}
      {showPresets && (
        <View className="gap-2">
          <Typography variant="caption" weight="semibold">
            Turnos Sugeridos
          </Typography>
          <View className="flex-row flex-wrap gap-3">
            {PRESET_SHIFTS.map((shift) => (
              <TouchableOpacity
                key={shift.id}
                onPress={() => handlePresetSelect(shift)}
                activeOpacity={0.7}
                className={`flex-1 min-w-[45%] rounded-xl p-4 border-2 ${
                  selectedPreset === shift.id
                    ? "bg-primary-50 border-primary"
                    : "bg-gray-50 border-input"
                }`}
              >
                <View className="items-center gap-2">
                  <View
                    className={`p-3 rounded-lg ${
                      selectedPreset === shift.id
                        ? "bg-primary-200/50"
                        : "bg-gray-200/50"
                    }`}
                  >
                    <MaterialIcons
                      name={shift.icon}
                      size={24}
                      color={
                        selectedPreset === shift.id
                          ? COLORS.primary.DEFAULT
                          : COLORS.mutedForeground
                      }
                    />
                  </View>
                  <Typography
                    variant="caption"
                    weight="semibold"
                    className={
                      selectedPreset === shift.id ? "text-primary" : ""
                    }
                  >
                    {shift.name}
                  </Typography>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ENTRADA */}
      <View className="gap-2 mt-4">
        <View className="flex-row items-center gap-2">
          <MaterialIcons
            name="login"
            size={20}
            color={COLORS.primary.DEFAULT}
          />
          <Typography variant="caption" weight="semibold">
            Entrada no Plantão
          </Typography>
        </View>

        <View className="bg-gray-50 border border-input rounded-xl p-4 gap-2">
          <TouchableOpacity
            onPress={() => setShowEntryDatePicker(true)}
            activeOpacity={0.7}
            className="bg-white rounded-xl p-4 flex-row items-center justify-between border border-input"
          >
            <View className="flex-row items-center gap-2">
              <MaterialIcons
                name="calendar-today"
                size={20}
                color={COLORS.mutedForeground}
              />
              <View>
                <Typography variant="extraSmall" tone="muted">
                  Data
                </Typography>
                <Typography variant="body" weight="semibold">
                  {format(entryDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </Typography>
              </View>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={COLORS.mutedForeground}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowEntryTimePicker(true)}
            activeOpacity={0.7}
            className="bg-white rounded-xl p-4 flex-row items-center justify-between border border-input"
          >
            <View className="flex-row items-center gap-2">
              <MaterialIcons
                name="access-time"
                size={20}
                color={COLORS.mutedForeground}
              />
              <View>
                <Typography variant="extraSmall" tone="muted">
                  Horário
                </Typography>
                <Typography variant="body" weight="semibold">
                  {format(entryDate, "HH:mm")}
                </Typography>
              </View>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={COLORS.mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* SAÍDA */}
      <View className="gap-4 mt-4">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="logout" size={20} color={COLORS.destructive} />
          <Typography variant="caption" weight="semibold">
            Saída do Plantão
          </Typography>
        </View>

        <View className="bg-gray-50 rounded-xl border border-input p-4 gap-3">
          <TouchableOpacity
            onPress={() => setShowExitDatePicker(true)}
            activeOpacity={0.7}
            className="bg-white rounded-xl p-4 flex-row items-center justify-between border border-input"
          >
            <View className="flex-row items-center gap-2">
              <MaterialIcons
                name="calendar-today"
                size={20}
                color={COLORS.mutedForeground}
              />
              <View>
                <Typography variant="extraSmall" tone="muted">
                  Data
                </Typography>
                <Typography variant="body" weight="semibold">
                  {format(exitDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </Typography>
              </View>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={COLORS.mutedForeground}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowExitTimePicker(true)}
            activeOpacity={0.7}
            className="bg-white rounded-xl p-4 flex-row items-center justify-between border border-input"
          >
            <View className="flex-row items-center gap-2">
              <MaterialIcons
                name="access-time"
                size={20}
                color={COLORS.mutedForeground}
              />
              <View>
                <Typography variant="extraSmall" tone="muted">
                  Horário
                </Typography>
                <Typography variant="body" weight="semibold">
                  {format(exitDate, "HH:mm")}
                </Typography>
              </View>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={COLORS.mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* PREVIEW DO TURNO */}
      {isValidShift ? (
        <View className="bg-green-50 rounded-xl px-4 py-3 border border-green-100 mt-6">
          <View className="flex-row items-center gap-2 mb-2">
            <MaterialIcons
              name="check-circle"
              size={16}
              color={COLORS.success.DEFAULT}
            />
            <Typography
              variant="small"
              className="text-green-700 font-semibold"
            >
              Escala configurada
            </Typography>
          </View>

          <Typography
            variant="body"
            weight="semibold"
            className="text-green-900 mb-1"
          >
            {format(entryDate, "dd/MM 'às' HH:mm")} →{" "}
            {format(exitDate, "dd/MM 'às' HH:mm")}
          </Typography>

          <Typography variant="small" className="text-green-700">
            Duração: {getShiftDuration()}
          </Typography>
        </View>
      ) : (
        <View className="bg-red-50 rounded-xl px-4 py-3 border border-red-100 mt-6">
          <View className="flex-row items-center gap-2">
            <MaterialIcons
              name="error-outline"
              size={16}
              color={COLORS.destructive}
            />
            <Typography variant="small" className="text-red-700 flex-1">
              A data de saída deve ser posterior à entrada
            </Typography>
          </View>
        </View>
      )}

      {/* PICKERS */}
      {showEntryDatePicker && (
        <DateTimePicker
          value={entryDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleEntryDateChange}
          locale="pt-BR"
        />
      )}

      {showEntryTimePicker && (
        <DateTimePicker
          value={entryDate}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleEntryTimeChange}
          locale="pt-BR"
          is24Hour={true}
        />
      )}

      {showExitDatePicker && (
        <DateTimePicker
          value={exitDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleExitDateChange}
          locale="pt-BR"
        />
      )}

      {showExitTimePicker && (
        <DateTimePicker
          value={exitDate}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleExitTimeChange}
          locale="pt-BR"
          is24Hour={true}
        />
      )}
    </ModalWrapper>
  );
};
