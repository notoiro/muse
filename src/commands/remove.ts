import {ChatInputCommandInteraction} from 'discord.js';
import {inject, injectable} from 'inversify';
import {TYPES} from '../types.js';
import PlayerManager from '../managers/player.js';
import Command from './index.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import i18n from 'i18n';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('remove')
    .setDescription(i18n.__('commands.remove.description'))
    .addIntegerOption(option =>
      option.setName('position')
        .setDescription(i18n.__('commands.remove.options.position-description'))
        .setRequired(false),
    )
    .addIntegerOption(option =>
      option.setName('range')
        .setDescription(i18n.__('commands.remove.options.range-description'))
        .setRequired(false));

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);

    const position = interaction.options.getInteger('position') ?? 1;
    const range = interaction.options.getInteger('range') ?? 1;

    if (position < 1) {
      throw new Error(i18n.__('commands.remove.position-error'));
    }

    if (range < 1) {
      throw new Error(i18n.__('commands.remove.range-error'));
    }

    player.removeFromQueue(position, range);

    await interaction.reply(i18n.__('commands.remove.reply'));
  }
}
