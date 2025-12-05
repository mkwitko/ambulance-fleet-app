import { PresetShift } from "../@types/preset-shift";

export const PRESET_SHIFTS: PresetShift[] = [
  {
    id: "12h",
    name: "12 horas",
    hours: 12,
    icon: "wb-sunny",
    description: "Plantão de 12h",
  },
  {
    id: "24h",
    name: "24 horas",
    hours: 24,
    icon: "schedule",
    description: "Plantão de 24h",
  },
  {
    id: "8h",
    name: "8 horas",
    hours: 8,
    icon: "business",
    description: "Comercial",
  },
  {
    id: "6h",
    name: "6 horas",
    hours: 6,
    icon: "wb-twilight",
    description: "Meio período",
  },
];
