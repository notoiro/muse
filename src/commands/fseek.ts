import {ChatInputCommandInteraction} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {TYPES} from '../types.js';
import {inject, injectable} from 'inversify';
import PlayerManager from '../managers/player.js';
import Command from './index.js';
import {prettyTime} from '../utils/time.js';
import durationStringToSeconds from '../utils/duration-string-to-seconds.js';
import i18n from 'i18n';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('fseek')
    .setDescription(i18n.__('commands.fseek.description'))
    .addStringOption(option => option
      .setName('time')
      .setDescription(i18n.__('commands.fseek.options.time-description'))
      .setRequired(true));

  public requiresVC = true;

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);

    const currentSong = player.getCurrent();

    if (!currentSong) {
      throw new Error(i18n.__('commands.fseek.no-play-error'));
    }

    if (currentSong.isLive) {
      throw new Error(i18n.__('commands.fseek.live-error'));
    }

    const seekValue = interaction.options.getString('time');

    if (!seekValue) {
      throw new Error(i18n.__('commands.fseek.seek-value-error'));
    }

    const seekTime = durationStringToSeconds(seekValue);

    if (seekTime + player.getPosition() > currentSong.length) {
      throw new Error(i18n.__('commands.fseek.seek-length-error'));
    }

    await Promise.all([
      player.forwardSeek(seekTime),
      interaction.deferReply(),
    ]);

    await interaction.editReply(i18n.__('commands.fseek.reply', prettyTime(player.getPosition())));
  }
}
