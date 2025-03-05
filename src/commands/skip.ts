import {ChatInputCommandInteraction} from 'discord.js';
import {TYPES} from '../types.js';
import {inject, injectable} from 'inversify';
import PlayerManager from '../managers/player.js';
import Command from './index.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {buildPlayingMessageEmbed} from '../utils/build-embed.js';
import i18n from 'i18n';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('skip')
    .setDescription(i18n.__('commands.skip.description'))
    .addIntegerOption(option => option
      .setName('number')
      .setDescription(i18n.__('commands.skip.options.number-description'))
      .setRequired(false));

  public requiresVC = true;

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const numToSkip = interaction.options.getInteger('number') ?? 1;

    if (numToSkip < 1) {
      throw new Error(i18n.__('commands.skip.number-error'));
    }

    const player = this.playerManager.get(interaction.guild!.id);

    try {
      await player.forward(numToSkip);
      await interaction.reply({
        content: i18n.__('commands.skip.reply'),
        embeds: player.getCurrent() ? [buildPlayingMessageEmbed(player)] : [],
      });
    } catch (_: unknown) {
      throw new Error(i18n.__('commands.skip.reply-error'));
    }
  }
}
