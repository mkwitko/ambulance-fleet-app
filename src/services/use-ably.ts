import * as Ably from "ably";
import { useEffect } from "react";
import { env } from "../env";
import { useGetAuthenticatedUser } from "../http/generated/user/user";
export default function useAbly({
  events,
  handleMessageReceived,
}: {
  events: string[];
  handleMessageReceived: (message: Ably.InboundMessage) => void;
}) {
  const realtimeClient = new Ably.Realtime({
    key: env.EXPO_PUBLIC_ABLY_API_KEY,
  });

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
