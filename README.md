# MonsterMasher Discord Bot 🎃

A Discord bot that sends Monster Mash remix MP3 files on command. Perfect for pranking your friends!

## Features

- `/mash [song name]` - Search and send Monster Mash remixes
- Autocomplete suggestions for available songs
- Fuzzy search matching for easy song discovery
- Lightweight and easy to deploy

## Setup Instructions

### 1. Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" section and click "Add Bot"
4. Under "TOKEN", click "Reset Token" and copy it (you'll need this)
5. Scroll down and enable these intents:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
6. Go to "OAuth2" → "General"
   - Copy your "CLIENT ID" (you'll need this)
7. Go to "OAuth2" → "URL Generator"
   - Select scopes: `bot`, `applications.commands`
   - Select bot permissions: `Send Messages`, `Attach Files`
   - Copy the generated URL and open it to invite the bot to your server

### 2. Get Your Guild (Server) ID

1. Open Discord
2. Go to User Settings → Advanced
3. Enable "Developer Mode"
4. Right-click your server icon and select "Copy Server ID"

### 3. Configure Environment Variables

1. Copy [.env.example](.env.example) to `.env`
2. Fill in your values:
   ```env
   DISCORD_TOKEN=your_bot_token_from_step_1
   CLIENT_ID=your_client_id_from_step_1
   GUILD_ID=your_server_id_from_step_2
   ```

### 4. Add Your Monster Mash Remixes

1. Place your MP3 files in the `audio/remixes/` folder
2. Name them following this pattern: `mash-song-name.mp3`
   - Examples:
     - `mash-bohemian-rhapsody.mp3`
     - `mash-sweet-child.mp3`
     - `mash-hotel-california.mp3`

### 5. Install Dependencies

```bash
npm install
```

### 6. Deploy Commands to Discord

```bash
npm run deploy-commands
```

This registers the `/mash` command with Discord. You only need to run this once (or when you add new commands).

### 7. Run the Bot

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## Deploying to Render (Free Hosting)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/MonsterMasher.git
git push -u origin main
```

### 2. Deploy on Render

1. Go to [Render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: monstermasher
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables:
   - `DISCORD_TOKEN`: your bot token
   - `CLIENT_ID`: your client ID
   - `GUILD_ID`: your server ID (optional for global commands)
6. Click "Create Web Service"

### 3. Important Notes for Render

- **Free tier sleeps after 15 minutes of inactivity**
- Bot takes ~30 seconds to wake up when someone uses a command
- First command after sleep will be slower, subsequent commands are instant
- This is fine for occasional use (perfect for pranking friends!)

## Usage

Once the bot is running and invited to your server:

1. Type `/mash` in any channel
2. Start typing a song name - autocomplete will show available options
3. Select a song or type the full name
4. Bot sends the Monster Mash remix MP3!

## Project Structure

```
MonsterMasher/
├── src/
│   ├── commands/
│   │   └── mash.ts          # Main /mash command
│   ├── types/
│   │   └── Command.ts       # TypeScript interfaces
│   ├── index.ts             # Main bot file
│   └── deploy-commands.ts   # Command registration script
├── audio/
│   └── remixes/             # Put your MP3 files here!
├── .env                     # Your secrets (DO NOT COMMIT)
├── .env.example             # Template for .env
├── package.json
├── tsconfig.json
└── render.yaml              # Render deployment config
```

## Adding More Commands

1. Create a new file in `src/commands/` (e.g., `ping.ts`)
2. Follow the structure of `mash.ts`
3. Run `npm run deploy-commands` to register it
4. Restart the bot

## Troubleshooting

**Bot is not responding:**
- Check that the bot is online in your server
- Verify DISCORD_TOKEN is correct in `.env`
- Make sure you ran `npm run deploy-commands`
- Check console for error messages

**Command not showing up:**
- Run `npm run deploy-commands` again
- Wait a few minutes (global commands take up to 1 hour)
- Use GUILD_ID for instant testing commands

**Audio files not found:**
- Make sure files are in `audio/remixes/` folder
- Check that files start with `mash-` and end with `.mp3`
- Verify file names match the pattern: `mash-song-name.mp3`

**Render bot goes offline:**
- This is normal on free tier - it sleeps after 15 minutes
- Bot will wake up automatically when someone uses a command
- First command after sleep takes ~30 seconds

## Future Features (Optional)

- Voice channel playback (join VC and play the song)
- Dashboard for managing songs
- Statistics tracking
- More commands (help, list all songs, random mash)

## License

ISC
