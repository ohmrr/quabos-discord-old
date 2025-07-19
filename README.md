# 👽 Quabos 

Quabos is an entertainment Discord bot built with TypeScript, Discord.js v14 and MongoDB. Using a Markov chaining algorithm, it will read in messages sent in your server and generate its own messages. Quabos is heavily inspired by the [nMarkov bot](https://nmarkov.vixenteam.xyz/).

## 🌙 Requirements

- Node.js 18 or newer
- [Discord Developer Portal Bot Token](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
- [Free MongoDB Atlas Cluster](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/)

## 🛸 Installation

```sh
git clone https://github.com/ohmrr/quabos-discord.git
cd quabos-discord
pnpm install
```

## ⚙️ Configuration

In the packages/bot directory, you can create or rename `.env.example` to `.env`.
Fill out all of the values with your Discord Bot Token, and with your MongoDB connection string.

**⚠️ Never share your connection string or discord token with anyone. Also ensure that your .env file is not being tracked by Git.**

```sh
CONNECTION_STRING=""
DISCORD_TOKEN=""

NODE_ENV="" # Can be either "development" or "production"
DEV_GUILD_ID="" # If NODE_ENV is development, you will need a development discord server
```

## 🚀 Getting Started

```sh
cd packages/bot
pnpm build
pnpm start
```

This will transpile the TypeScript code to JavaScript, and then start your own instance of Quabos as long as you have followed the above steps correctly. 

## 🌌 Features & Commands

Quabos is still a work in progress, but below are many of the commands that are currently supported.

`/config channels add [channel]` - Adds a new channel for Quabos to read messages from.

`/config channels remove [channel]` - Removes a tracked channel.

`/config channels list` - Lists all the channels currently being tracked by Quabos.

`/config probability set [percentage]` - Changes the percent chance that Quabos will randomly respond when a message is sent in the server (5% by default).

`/config probability view` - Sends the current server's probability of Quabos randomly responding to messages sent. 

`/config resetlog` - Deletes all messages stored in the database for that specific guild.

`/privacy opt-out [scope]` - Allows you to opt-out of message collection in that specific server or globally (in all servers you share with Quabos).

`/privacy opt-in [scope]` - Allows you to opt-in and allow Quabos to collect messages from you in that specific server or globally (in all servers you share with Quabos).

`/generate` - Forces Quabos to send a message in the current chanel. May fail if there have not been enough messages collected.

`/serverinfo` - Sends information about the current server.

`/help` - Get information on any command. Uses autocompletion to only allow commands that exist.

`/info bot` - Sends information about Quabos, such as uptime.

`/info stats` - Sends a breakdown of all the messages collected in the guild by channel.

`/avatar [user]` - Will display the discord avatar of the selected user.

## Locales

Quabos will work with any language, but commands currently only support English. Future support for more locales is planned.

## Contributing

1. Fork the [repository](https://github.com/ohmrr/quabos-discord/fork) on GitHub
2. Clone your fork: `git clone [repository]`
3. Create a branch for your feature or fix: `git checkout -b feature/my-new-feature`
4. Stage any changes: `git add .`
5. Commit your changes: `git commit -m [message]`
6. Push your changes to the forked repository.
7. Back on GitHub, create a pull request and describe the changes you have made.
