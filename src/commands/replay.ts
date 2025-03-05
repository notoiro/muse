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
    .setName('replay')
    .setDescription(i18n.__('commands.replay.description'));

  public requiresVC = true;

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);

    const currentSong = player.getCurrent();

    if (!currentSong) {
      throw new Error(i18n.__('commands.replay.no-play-error'));
    }

    if (currentSong.isLive) {
      throw new Error(i18n.__('commands.replay.live-error'));
    }

    await Promise.all([
      player.seek(0),
      interaction.deferReply(),
    ]);

    await interaction.editReply(i18n.__('commands.replay.reply'));
  }
}
