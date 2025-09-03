import {
  DBChat,
  DBCreateChat,
  DBCreateMessage,
  DBCreateUser,
  DBMessage,
  DBUser,
} from "./db";

export type ApiCreateUser = DBCreateUser;
export type ApiUser = Omit<DBUser, "password">;

export type ApiCreateChat = DBCreateChat;
export type ApiChat = DBChat;

export type ApiCreateMessage = DBCreateMessage;
export type ApiMessage = DBMessage;
