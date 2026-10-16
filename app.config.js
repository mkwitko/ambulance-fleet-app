// app.config.js
export default ({ config }) => ({
  ...config,
  expo: {
    name: "Connect Message",
    slug: "connect-app-refactor",
    version: process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "connectapprefactor",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    package: "com.prosperapps.connect",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.prosperapps.connect",
    },
    android: {
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.prosperapps.connect",
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/icon.png",
          "color": "#ffffff",
          "defaultChannel": "default",
          "sounds": [
						'./assets/sounds/notification.mp3',
					],
        }
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#FFFFFF",
        },
      ],
      ["expo-secure-store"],
      ["expo-font"],
      [
        "expo-location",
        {
          isAndroidBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true,
        },
      ],
      ["expo-sqlite"],
      ["expo-camera"],
      ["expo-audio"],
      ["expo-video"],
      ["expo-image-picker"],
      ["expo-document-picker"],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      // Environment variables exposed through expo-constants
      EXPO_PUBLIC_BACKEND: process.env.EXPO_PUBLIC_BACKEND,
      EXPO_PUBLIC_WS: process.env.EXPO_PUBLIC_WS,
      EXPO_PUBLIC_STORAGE_URL: process.env.EXPO_PUBLIC_STORAGE_URL,
      EXPO_PUBLIC_APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION,
      EXPO_PUBLIC_SENTRY: process.env.EXPO_PUBLIC_SENTRY,
      EXPO_PUBLIC_AGORA_APP_ID: process.env.EXPO_PUBLIC_AGORA_APP_ID,
    },
  },
});
