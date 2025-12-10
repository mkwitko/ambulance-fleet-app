import BackgroundConnection from "expo-background-connection-plugin";

// When starting a call or connection
async function startConnection() {
  // Start the background service
  await BackgroundConnection.startService({
    notificationTitle: "Call in Progress",
    notificationBody: "Maintaining connection...",
  });

  // Now initialize your Ably/Agora connections
  // They will stay alive even when app is backgrounded
}

// When ending the call or connection
async function stopConnection() {
  // Close your Ably/Agora connections first

  // Then stop the background service
  await BackgroundConnection.stopService();
}
