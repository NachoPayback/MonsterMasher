import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Command } from './types/Command.js';
import { handleAutocomplete } from './commands/mash.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config();

// Create Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
}) as Client & { commands: Collection<string, Command> };

// Initialize commands collection
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

const commands = [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const commandModule = await import(`file://${filePath}`);
  const command = commandModule.command as Command;

  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
    console.log(`✅ Loaded command: ${command.data.name}`);
  } else {
    console.warn(`⚠️  Command at ${filePath} is missing required "data" or "execute" property.`);
  }
}

// Deploy commands function
async function deployCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token || !clientId) {
    console.error('❌ Missing DISCORD_TOKEN or CLIENT_ID');
    return;
  }

  const rest = new REST().setToken(token);

  try {
    console.log(`🔄 Deploying ${commands.length} slash commands...`);

    if (guildId) {
      // Guild-specific deployment (instant)
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log(`✅ Successfully deployed ${commands.length} guild commands!`);
    } else {
      // Global deployment (takes up to 1 hour)
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log(`✅ Successfully deployed ${commands.length} global commands!`);
    }
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
}

// Ready event
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`🎃 MonsterMasher is ready! Logged in as ${readyClient.user.tag}`);

  // Auto-deploy commands on startup
  await deployCommands();
});

// Interaction handler
client.on(Events.InteractionCreate, async (interaction) => {
  // Handle autocomplete
  if (interaction.isAutocomplete()) {
    if (interaction.commandName === 'mash') {
      await handleAutocomplete(interaction);
    }
    return;
  }

  // Handle slash commands
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);

    const errorMessage = { content: 'There was an error executing this command!', ephemeral: true };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

// Login to Discord
const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('❌ DISCORD_TOKEN is not set in .env file!');
  process.exit(1);
}

client.login(token);
