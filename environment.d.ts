import { LogLevel } from "telegram/extensions/Logger.js";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_ID: number;
      API_HASH: string;
      TARGET_CHATS: string;
      TRACKED_CHATS: string;
      FILTER_USERNAMES: string;
      ENABLE_SOUND: number;
    }
  }
}

export {};
