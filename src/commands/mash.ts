import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { Command } from '../types/Command.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('mash')
    .setDescription('Send a Monster Mash remix')
    .addStringOption(option =>
      option
        .setName('song')
        .setDescription('The song name to search for')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute(interaction: any) {
    const songQuery = interaction.options.getString('song');

    if (!songQuery) {
      await interaction.reply({ content: 'Please provide a song name!', ephemeral: true });
      return;
    }

    // Search for matching file
    const audioDir = path.join(__dirname, '../../audio/remixes');

    if (!fs.existsSync(audioDir)) {
      await interaction.reply({
        content: 'Audio directory not found! Make sure to create the audio/remixes folder.',
        ephemeral: true
      });
      return;
    }

    const files = fs.readdirSync(audioDir);
    const mp3Files = files.filter(file => file.endsWith('.mp3') && file.startsWith('mash-'));

    // Normalize the query for matching
    const normalizedQuery = songQuery.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Find matching file
    const matchedFile = mp3Files.find(file => {
      const fileName = file.replace('mash-', '').replace('.mp3', '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return fileName.includes(normalizedQuery) || normalizedQuery.includes(fileName);
    });

    if (!matchedFile) {
      const availableSongs = mp3Files
        .map(file => file.replace('mash-', '').replace('.mp3', '').replace(/-/g, ' '))
        .join(', ');

      await interaction.reply({
        content: `Could not find a mash for "${songQuery}".\n\nAvailable mashes: ${availableSongs || 'None yet!'}`,
        ephemeral: true
      });
      return;
    }

    // Send the file
    const filePath = path.join(audioDir, matchedFile);
    const attachment = new AttachmentBuilder(filePath);

    // Convert filename to proper title case
    const songName = matchedFile
      .replace('mash-', '')
      .replace('.mp3', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    await interaction.reply({
      content: `🎃 **Monster Mash: ${songName}** 🎃`,
      files: [attachment]
    });
  }
};

// Autocomplete handler for song suggestions
export async function handleAutocomplete(interaction: any) {
  const focusedValue = interaction.options.getFocused().toLowerCase();

  const audioDir = path.join(__dirname, '../../audio/remixes');

  if (!fs.existsSync(audioDir)) {
    await interaction.respond([]);
    return;
  }

  const files = fs.readdirSync(audioDir);
  const mp3Files = files.filter(file => file.endsWith('.mp3') && file.startsWith('mash-'));

  const choices = mp3Files.map(file => {
    const name = file
      .replace('mash-', '')
      .replace('.mp3', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return { name, value: name };
  });

  const filtered = choices.filter(choice =>
    choice.name.toLowerCase().includes(focusedValue)
  ).slice(0, 25); // Discord limit

  await interaction.respond(filtered);
}
