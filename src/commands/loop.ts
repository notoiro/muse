import {ChatInputCommandInteraction} from 'discord.js';
import {TYPES} from '../types.js';
import {inject, injectable} from 'inversify';
import PlayerManager from '../managers/player.js';
import Command from './index.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {STATUS} from '../services/player.js';
import i18n from 'i18n';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('loop')
    .setDescription(i18n.__('commands.loop.description'));

  public requiresVC = true;

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);

    if (player.status === STATUS.IDLE) {
      throw new Error(i18n.__('commands.loop.error'));
    }

    if (player.loopCurrentQueue) {
      player.loopCurrentQueue = false;
    }

    player.loopCurrentSong = !player.loopCurrentSong;

    await interaction.reply((player.loopCurrentSong ? i18n.__('commands.loop.reply-on') : i18n.__('commands.loop.reply-off')));
  }
}
