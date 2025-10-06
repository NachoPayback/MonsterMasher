# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MonsterMasher is a Discord bot built to send Monster Mash remix MP3 files on command. It's a prank bot designed to drop custom remixes in Discord channels.

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: discord.js v14
- **Deployment**: Render (free tier with sleep mode)
- **File Format**: MP3 audio files

## Development Commands

```bash
# Install dependencies
npm install

# Run in development mode (auto-reload)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run in production mode
npm start

# Deploy slash commands to Discord
npm run deploy-commands
```

## Architecture

### Project Structure

```
src/
├── commands/
│   └── mash.ts          # /mash command with autocomplete
├── types/
│   └── Command.ts       # TypeScript interfaces
├── index.ts             # Main bot entry point
└── deploy-commands.ts   # Slash command registration

audio/
└── remixes/             # MP3 files stored here (mash-*.mp3)
```

### Key Components

1. **Main Bot** ([src/index.ts](src/index.ts))
   - Initializes Discord client with Guilds intent
   - Dynamically loads commands from `src/commands/`
   - Handles slash command interactions and autocomplete
   - Error handling for command execution

2. **Mash Command** ([src/commands/mash.ts](src/commands/mash.ts))
   - Slash command with string option (song name)
   - Autocomplete functionality for song suggestions
   - Fuzzy search matching (normalizes input, strips special chars)
   - Sends MP3 as Discord attachment using AttachmentBuilder
   - Lists available songs if no match found

3. **Command Deployment** ([src/deploy-commands.ts](src/deploy-commands.ts))
   - Registers slash commands with Discord API
   - Supports guild-specific (instant) or global (1hr propagation) deployment
   - Uses REST API with Routes helper

### File Naming Convention

Audio files MUST follow this pattern:
- Format: `mash-{song-name}.mp3`
- Location: `audio/remixes/`
- Examples: `mash-bohemian-rhapsody.mp3`, `mash-hotel-california.mp3`

The bot strips "mash-" prefix and ".mp3" extension for display/search purposes.

### Environment Variables

Required in `.env`:
- `DISCORD_TOKEN`: Bot token from Discord Developer Portal
- `CLIENT_ID`: Application ID from Discord Developer Portal
- `GUILD_ID`: (Optional) Server ID for instant command testing

## Discord Bot Setup

1. Create application at https://discord.com/developers/applications
2. Add bot user and get token
3. Enable required intents: Guilds (mandatory for slash commands)
4. Generate OAuth2 URL with scopes: `bot`, `applications.commands`
5. Required permissions: Send Messages, Attach Files
6. Invite bot to server using OAuth2 URL

## Deployment Notes

### Render Configuration

- Uses [render.yaml](render.yaml) for infrastructure-as-code
- Type: Web Service (required even though it's not serving HTTP)
- Build: `npm install && npm run build`
- Start: `npm start`
- Free tier sleeps after 15 min inactivity, wakes on Discord API calls

### Important Render Behaviors

- Bot automatically wakes when Discord sends interaction
- First command after sleep: ~30 second delay
- Subsequent commands: instant response
- No HTTP server needed (Discord uses WebSocket gateway)

## Adding New Commands

1. Create `src/commands/{command-name}.ts`
2. Export object implementing Command interface:
   ```typescript
   export const command: Command = {
     data: new SlashCommandBuilder()...
     execute: async (interaction) => {...}
   }
   ```
3. Run `npm run deploy-commands` to register with Discord
4. Restart bot (or use `npm run dev` for auto-reload)

## Code Patterns

### ES Modules

This project uses ES modules (`"type": "module"` in package.json):
- Import statements use `.js` extension (even for `.ts` files)
- Use `import.meta.url` and `fileURLToPath` for `__dirname` equivalent
- Dynamic imports use `file://` protocol for absolute paths

### TypeScript Configuration

- Target: ES2022 (modern syntax)
- Module: ES2022 (native ESM)
- Strict mode enabled
- Output: `dist/` directory

### Command Structure

All commands follow this pattern:
1. Define SlashCommandBuilder with name, description, options
2. Implement async execute function taking CommandInteraction
3. Handle errors gracefully with ephemeral responses
4. Use interaction.reply() or interaction.followUp() for responses

### File Handling

- Use `fs.readdirSync()` to list audio files
- Normalize strings for fuzzy matching: lowercase + remove special chars
- AttachmentBuilder accepts file paths or buffers
- Check directory existence before reading files

## Troubleshooting

### Commands not appearing
- Run `npm run deploy-commands` after any command changes
- Guild commands (GUILD_ID set): instant
- Global commands (no GUILD_ID): up to 1 hour delay

### Bot not responding
- Check DISCORD_TOKEN is valid
- Verify bot has correct permissions in server
- Check console for error messages
- Ensure slash commands are deployed

### Audio files not found
- Verify files are in `audio/remixes/` directory
- Check naming convention: `mash-{name}.mp3`
- File names are case-sensitive on Linux (Render deployment)

## Future Expansion Plans

Voice channel playback can be added later:
- Install `@discordjs/voice` and `ffmpeg`
- Add GuildVoiceStates intent
- Create audio player and voice connection
- Join user's voice channel and play MP3 via stream
