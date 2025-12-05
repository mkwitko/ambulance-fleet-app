import { Typography, TypographyProps } from "@/src/components/ui/typography";
import React from "react";
import { Pressable } from "react-native";
import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard";
import { useLinkify } from "../hooks/use-linkify";

interface LinkifyTextProps {
  children: string;
  variant?: TypographyProps["variant"];
  className?: string;
  linkClassName?: string;
  enableCopy?: boolean;
  onLongPressDelay?: number;
}

export function LinkifyText({
  children,
  variant = "body",
  className = "",
  linkClassName = "text-blue-600 underline",
  enableCopy = true,
  onLongPressDelay = 500,
}: LinkifyTextProps) {
  const { linkify } = useLinkify();
  const { copyToClipboard } = useCopyToClipboard();

  const handleLongPress = () => {
    if (enableCopy) {
      copyToClipboard(children);
    }
  };

  return (
    <Pressable onLongPress={handleLongPress} delayLongPress={onLongPressDelay}>
      <Typography variant={variant} className={className}>
        {linkify(children, linkClassName, className)}
      </Typography>
    </Pressable>
  );
}
