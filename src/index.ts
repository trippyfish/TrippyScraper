import "dotenv/config";

import path from "path";
import sound from "sound-play";
import { NewMessage } from "telegram/events/NewMessage.js";
import { Api } from "telegram/index.js";
import { getDisplayName } from "telegram/Utils.js";
import { fileURLToPath } from "url";

import client from "./utils/client.js";
import db from "./utils/db.js";
import { TWEET_MONITOR_CHANNEL_ID } from "./constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const alertPath = path.join(__dirname, "alert.wav");

const enableSound = Number(process.env.ENABLE_SOUND) === 1;

// solana, trx, evm
const regexRegistry = Object.entries({
  evm: /(?:^[a-zA-Z\d])?0x[a-fA-F0-9]{40}/,
  tron: /(?:^[a-zA-Z\d])?T[A-Za-z1-9]{33}/,
  solana: /(?:^[a-zA-Z\d])?[1-9A-HJ-NP-Za-z]{32,44}/, // lowercase l is only included as dex links are lowercased
});

// parse tracked chats
const trackedChats = process.env.TRACKED_CHATS.split(",")
  .map((chat) => chat.trim())
  .map((chat) => (/^-?\d+$/.test(chat) ? parseInt(chat) : chat))
  .filter(Boolean);

// parse target chats
const targetChats = process.env.TARGET_CHATS.split(",")
  .map((chat) => chat.trim())
  .map((chat) => (/^-?\d+$/.test(chat) ? parseInt(chat) : chat))
  .filter(Boolean);

// parse filter usernames
const filterUsernames = process.env.FILTER_USERNAMES.split(",")
  .map((username) => username.trim())
  .filter(Boolean);

// concurrent forwarder
const processMatch = (chat: Api.Chat, sender: Api.User, chain: string, address: string) => {
  client.logger.info(
    `Found ${chain} match in ${chat.title} from ${getDisplayName(sender)}: ${address}`
  );

  enableSound && sound.play(alertPath);
  client.logger.info(`Sending ${address} to target chat(s)...`);

  return Promise.all(
    targetChats.map((targetChat) =>
      client.sendMessage(targetChat, { message: address }).then((msg) => {
        client.logger.info(`${address} sent to ${targetChat}`);
      })
    )
  );
};

// load db into memory
await db.read();

// start listening to messages in tracked chats
client.addEventHandler(
  async ({ message }) => {
    const text = message.text;
    const urls = message.entities
      ?.filter((entity) => entity instanceof Api.MessageEntityTextUrl)
      .map((entity) => entity.url);

    const isTweetMonitor = Number(message.chatId || BigInt(0)) === TWEET_MONITOR_CHANNEL_ID;

    if (isTweetMonitor && filterUsernames.length > 0) {
      let found: string | false = false;

      for (const username of filterUsernames) {
        if (text.match(new RegExp(username, "i")) !== null) {
          found = username;
          break;
        }
      }

      if (!found) {
        return;
      }

      client.logger.info(`${found} match found`);
    }

    let found = false;

    for (let i = 0; i < regexRegistry.length; i++) {
      let match = text.match(regexRegistry[i][1]);

      if (match) {
        const [address] = match;
        const [chat, sender] = await Promise.all([message.getChat(), message.getSender()]);

        found = true;

        if (chat && sender) {
          processMatch(chat as Api.Chat, sender as Api.User, regexRegistry[i][0], address);
        }

        break;
      }
    }

    // match wasn't found in text, lets try the urls
    if (!found) {
      for (let i = 0; i < regexRegistry.length; i++) {
        for (const url of urls || []) {
          const match = url.match(regexRegistry[i][1]);

          if (match) {
            const [address] = match;
            const [chat, sender] = await Promise.all([message.getChat(), message.getSender()]);

            found = true;

            if (chat && sender) {
              processMatch(chat as Api.Chat, sender as Api.User, regexRegistry[i][0], address);
            }

            break;
          }
        }

        if (found) {
          break;
        }
      }
    }
  },
  new NewMessage({
    chats: trackedChats,
  })
);

// signal sound on start
enableSound && sound.play(alertPath);
