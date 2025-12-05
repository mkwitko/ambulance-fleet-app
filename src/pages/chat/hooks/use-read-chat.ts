import {
  GetAuthenticatedUser200,
  GetChatMessages200DataItemPlatform,
} from "@/src/http/generated/api.schemas";
import { useReadChat } from "@/src/http/generated/chat/chat";

export default function useReadChatHook({
  user,
}: {
  user: GetAuthenticatedUser200 | undefined;
}) {
  const { mutateAsync: readChat } = useReadChat();

  const markChatAsRead = async () => {
    await readChat({
      id: user?.data.ambulance?.chats[0].id as string,
      data: {
        platform: GetChatMessages200DataItemPlatform.APP,
        unitId: user?.data?.ambulance?.unitId as string,
      },
    });
  };

  return {
    markChatAsRead,
  };
}
