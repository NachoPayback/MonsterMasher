import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

// Load all command data
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const commandModule = await import(`file://${filePath}`);
  const command = commandModule.command;

  if ('data' in command) {
    commands.push(command.data.toJSON());
    console.log(`✅ Loaded command: ${command.data.name}`);
  }
}

// Get environment variables
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error('❌ Missing DISCORD_TOKEN or CLIENT_ID in .env file!');
  process.exit(1);
}

// Create REST instance
const rest = new REST().setToken(token);

// Deploy commands
(async () => {
  try {
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

    // Deploy to specific guild (faster for testing) or globally
    if (guildId) {
      // Guild-specific deployment (instant)
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      ) as any[];

      console.log(`✅ Successfully reloaded ${data.length} guild commands.`);
    } else {
      // Global deployment (takes up to 1 hour to propagate)
      const data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      ) as any[];

      console.log(`✅ Successfully reloaded ${data.length} global commands.`);
      console.log('⏳ Global commands can take up to 1 hour to appear in Discord.');
    }
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();
