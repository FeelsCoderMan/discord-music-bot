# discord-music-bot

## Requirements
- Node js version 18.17.1

## Configs
Create a .env file that contains these fields:
- DISCORD_TOKEN
- CLIENT_ID
- GUILD_ID

DISCORD_TOKEN should be the token of the discord bot and it can be retrieved from developer portal.
CLIENT_ID should be the client id of the server.
GUILD_ID should be retrieved from developer portal.

## Quick Run
Commands must be deployed before running the bot. It must only be run once.
- npm run deploy

After commands are deployed, run the discord bot by
- npm run dev

## Commands
**downloadplaylist**
- It requires playlist url and playlist name
  - Playlist url should be the youtube url that contains list querystring
  - Playlist name should be the name that will be saved in musics folder

**playplaylist**
- It requires playlist name
  - Playlist name should be the name that is saved on musics folder

**listplaylists**
- It will display current playlist names that are retrieved from musics folder

