import {ChatInputCommandInteraction} from 'discord.js';
import {TYPES} from '../types.js';
import {inject, injectable} from 'inversify';
import PlayerManager from '../managers/player.js';
import Command from './index.js';
import {parseTime, prettyTime} from '../utils/time.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import durationStringToSeconds from '../utils/duration-string-to-seconds.js';
import i18n from 'i18n';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('seek')
    .setDescription(i18n.__('commands.seek.description'))
    .addStringOption(option =>
      option.setName('time')
        .setDescription(i18n.__('common.time-description'))
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
      throw new Error(i18n.__('commands.seek.no-play-error'));
    }

    if (currentSong.isLive) {
      throw new Error(i18n.__('commands.seek.live-error'));
    }

    const time = interaction.options.getString('time')!;

    let seekTime = 0;

    if (time.includes(':')) {
      seekTime = parseTime(time);
    } else {
      seekTime = durationStringToSeconds(time);
    }

    if (seekTime > currentSong.length) {
      throw new Error(i18n.__('commands.seek.seek-length-error'));
    }

    await Promise.all([
      player.seek(seekTime),
      interaction.deferReply(),
    ]);

    await interaction.editReply(i18n.__('commands.seek.reply', prettyTime(player.getPosition())));
  }
}
