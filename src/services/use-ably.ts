import * as Ably from "ably";
import { useEffect, useRef } from "react";
import { env } from "../env";
import { useGetAuthenticatedUser } from "../http/generated/user/user";
export default function useAbly({
  events,
  handleMessageReceived,
}: {
  events: string[];
  handleMessageReceived: (message: Ably.InboundMessage) => void;
}) {
  const clientRef = useRef<Ably.Realtime | null>(null);

  if (!clientRef.current) {
    clientRef.current = new Ably.Realtime({
      key: env.EXPO_PUBLIC_ABLY_API_KEY,
      echoMessages: false,
      closeOnUnload: true,
      recover: (lastConnectionDetails, cb) => cb(true), // 🚀 enables session recovery
      disconnectedRetryTimeout: 2000,
      suspendedRetryTimeout: 5000,
      transportParams: { remainActive: true },
    });
  }

  const realtimeClient = clientRef.current;

  const { data: user } = useGetAuthenticatedUser();
  useEffect(() => {
    if (!user) return;

    const channel = realtimeClient.channels.get(
      `connect-${user?.data?.companyGroup?.id}`
    );

    channel.subscribe(events, (message) => {
      handleMessageReceived(message);
    });

    return () => channel.unsubscribe();
  }, [user]);

  return {
    user,
  };
}
