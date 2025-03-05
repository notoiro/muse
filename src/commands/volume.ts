import {ChatInputCommandInteraction} from 'discord.js';
import {TYPES} from '../types.js';
import {inject, injectable} from 'inversify';
import PlayerManager from '../managers/player.js';
import Command from './index.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import i18n from 'i18n';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('volume')
    .setDescription(i18n.__('commands.volume.description'))
    .addIntegerOption(option =>
      option.setName('level')
        .setDescription(i18n.__('common.volume-description'))
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true),
    );

  public requiresVC = true;

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);

    const currentSong = player.getCurrent();

    if (!currentSong) {
      throw new Error(i18n.__('commands.volume.no-play-error'));
    }

    const level = interaction.options.getInteger('level') ?? 100;
    player.setVolume(level);
    await interaction.reply(i18n.__('commands.volume.reply', String(level)));
  }
}
