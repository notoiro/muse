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
    .setName('move')
    .setDescription(i18n.__('commands.move.description'))
    .addIntegerOption(option =>
      option.setName('from')
        .setDescription(i18n.__('commands.move.options.from-description'))
        .setRequired(true),
    )
    .addIntegerOption(option =>
      option.setName('to')
        .setDescription(i18n.__('commands.move.options.to-description'))
        .setRequired(true));

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);

    const from = interaction.options.getInteger('from') ?? 1;
    const to = interaction.options.getInteger('to') ?? 1;

    if (from < 1) {
      throw new Error(i18n.__('commands.move.position-error'));
    }

    if (to < 1) {
      throw new Error(i18n.__('commands.move.position-error'));
    }

    const {title} = player.move(from, to);

    await interaction.reply(i18n.__('commands.move.reply', {title, position: String(to)}));
  }
}
