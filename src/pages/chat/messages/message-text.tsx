import { LinkifyText } from "@/src/components/linkify-text";
import { Typography } from "@/src/components/ui/typography";
import { GetChatMessages200DataItem } from "@/src/http/generated/api.schemas";
import React from "react";
import { View } from "react-native";

export default function MessageText({
  message,
  isCurrentUser,
  messageTime,
}: {
  message: GetChatMessages200DataItem;
  isCurrentUser: boolean;
  messageTime: string;
}) {
  return (
    <View
      className={`max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"}`}
    >
      <View
        className={`rounded-xl px-4 py-3 ${
          isCurrentUser
            ? "bg-primary rounded-tr-sm"
            : "bg-white/70  border border-input rounded-tl-sm"
        }`}
      >
        <LinkifyText
          variant="body"
          className={isCurrentUser ? "text-white" : "text-gray-800"}
          linkClassName={
            isCurrentUser ? "text-white underline" : "text-blue-600 underline"
          }
        >
          {message.content as string}
        </LinkifyText>
      </View>
      <Typography variant="small" className="text-gray-400 px-2 mt-1">
        {messageTime}
      </Typography>
    </View>
  );
}
