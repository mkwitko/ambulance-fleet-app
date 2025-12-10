// src/utils/is-native.ts
import Constants, { ExecutionEnvironment } from "expo-constants";

export const isNative =
  Constants.executionEnvironment === ExecutionEnvironment.Standalone;
