import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const messagesTable = sqliteTable("messages", {
  // RxDB: primaryKey "id" (string)
  id: text("id").primaryKey(),

  // selectedChatId
  selectedChatId: text("selected_chat_id").notNull(),

  // content (não é required no schema)
  content: text("content"),

  // user (flatten)
  userId: text("user_id"),
  userName: text("user_name"),
  userAvatarUrl: text("user_avatar_url"),

  // messageType
  messageType: text("message_type").notNull(),

  // retries (number)
  retries: integer("retries"),

  // status
  status: text("status").notNull(),

  // createdAt (ISO string)
  createdAt: text("created_at").notNull(),

  // file
  file: text("file"),
});
