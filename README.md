## Requirements
1. Telegram API_ID & API_HASH (get it from [MyTelegram](https://my.telegram.org))
2. Node.js v20.18.0 (LTS) (recommended to download via [Package Manager](https://nodejs.org/en/download/package-manager))

## Install
1. Open your terminal and cd into the project directory
2. Copy `.env.sample` to `.env`
3. Edit the `.env` file
4. Run `npm install`
5. Delete the `dist` folder if it exists
6. Run `npm run build`
7. Copy the `alert.wav` file from `src/` to `dist/`

### Config

```
API_ID=
API_HASH=
TARGET_CHATS=
TRACKED_CHATS=
FILTER_USERNAMES=
ENABLE_SOUND=1
```

###### API_ID
Your telegram app's API_ID, should be numeric

###### API_HASH
Your telegram app's API_HASH, should be alphanumeric

###### TARGET_CHATS
Comma separated list of chat ids to forward contract addresses to

###### TRACKED_CHATS
Comma separated list of chat ids to detect contract addresses from

###### FILTER_USERNAMES
Comma separated list of twitter accounts to detect contract addresses from.

This option works specifically for **Spider Sensei Tweet Monitor**. If specified; on every new Tweet Monitor contract address that gets detected, it will check to ensure the address came from an account on this list. If not it will ignore.

###### ENABLE_SOUND
Set this to `1` if you want an alert sound to be played every time a contract address is forwarded. Or leave it empty if it's not needed.

If you are having difficulty having the audio play, make sure did step #7 of the install guide above.

If you are still having difficulty, I would suggest to set `ENABLE_SOUND` to nothing/empty in your `.env` file and report the issue to me.

## Starting & Stopping
1. Open your terminal and cd into the project directory
2. Run `npm run start` to start the bot
2. On first run, the bot will ask you to login to your Telegram account
3. To stop the bot, simply press `CTRL + C` in the terminal