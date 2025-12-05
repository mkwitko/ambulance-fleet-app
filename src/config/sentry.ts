import { env } from "@/src/env";
import * as Sentry from "@sentry/react-native";

export function initSentry() {
  Sentry.init({
    dsn: env.EXPO_PUBLIC_SENTRY,
    enableAutoSessionTracking: true,
    tracesSampleRate: 1.0,
  });
}
