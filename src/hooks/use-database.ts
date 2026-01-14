import { eq } from "drizzle-orm";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useCallback, useEffect, useState } from "react";
import migrations from "../../drizzle/migrations";
import {
  GetChatMessages200DataItem,
  GetChatMessages200DataItemMessageType,
} from "../http/generated/api.schemas";
import { messagesTable } from "../services/database/database-schema";
import db from "../services/database/use-database";

export type MessageInsert = typeof messagesTable.$inferInsert;
export type MessageSelect = typeof messagesTable.$inferSelect;

export default function useDatabase() {
  const { success, error } = useMigrations(db, migrations);
  const [items, setItems] = useState<MessageSelect[]>([]);

  /**
   * SELECT ALL
   */
  const loadMessages = useCallback(async () => {
    if (!success) return;
    const messages = await db.select().from(messagesTable);
    setItems(messages);
  }, [success]);

  const loadMessagesByChat = useCallback(
    async (chatId: string) => {
      if (!success) return [];

      const messages = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.selectedChatId, chatId))
        .orderBy(messagesTable.createdAt);

      setItems(messages);
      return messages.map((item) => convertDatabaseToReturnObject(item));
    },
    [success]
  );

  useEffect(() => {
    if (!success) return;
    loadMessages();
  }, [success, loadMessages]);

  /**
   * INSERT
   */
  async function insertMessage(message: MessageInsert) {
    if (!success) return;
    await db.insert(messagesTable).values(message);
    await loadMessages();
  }

  /**
   * UPDATE
   * Atualiza pelo id (PK)
   */
  async function updateMessage(id: string, data: Partial<MessageInsert>) {
    if (!success) return;
    await db.update(messagesTable).set(data).where(eq(messagesTable.id, id));
    await loadMessages();
  }

  /**
   * DELETE
   * Remove pelo id (PK)
   */
  async function deleteMessage(id: string) {
    if (!success) return;
    await db.delete(messagesTable).where(eq(messagesTable.id, id));
    await loadMessages();
  }

  /**
   * DELETE BY CHAT
   */
  async function deleteMessagesByChat(chatId: string) {
    if (!success) return;
    await db
      .delete(messagesTable)
      .where(eq(messagesTable.selectedChatId, chatId));
    await loadMessages();
  }

  /**
   * CONVERT DATABASE TO RETURN OBJECT
   */

  function convertDatabaseToReturnObject(
    item: MessageSelect
  ): Partial<GetChatMessages200DataItem> {
    return {
      id: item.id,
      messageType: item.messageType as GetChatMessages200DataItemMessageType,
      user: {
        id: item.userId as string,
        name: item.userName as string,
        avatarUrl: item.userAvatarUrl || null,
      },
      createdAt: item.createdAt,
      content: item.content,
      status: item.status as "PENDING" | "SENT",
    };
  }

  return {
    ready: success,
    error,
    items,

    insertMessage,
    updateMessage,
    deleteMessage,
    deleteMessagesByChat,
    reload: loadMessages,
    loadMessagesByChat,
    convertDatabaseToReturnObject,
  };
}
