import { MaterialIcons } from "@expo/vector-icons";

export interface PresetShift {
  id: string;
  name: string;
  hours: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  description: string;
}
