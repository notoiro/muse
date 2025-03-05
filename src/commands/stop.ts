import {ChatInputCommandInteraction} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {TYPES} from '../types.js';
import {inject, injectable} from 'inversify';
import PlayerManager from '../managers/player.js';
import {STATUS} from '../services/player.js';
import Command from './index.js';
import i18n from 'i18n';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('stop')
    .setDescription(i18n.__('commands.stop.description'));

  public requiresVC = true;

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const player = this.playerManager.get(interaction.guild!.id);

    if (!player.voiceConnection) {
      throw new Error(i18n.__('commands.stop.no-connected-error'));
    }

    if (player.status !== STATUS.PLAYING) {
      throw new Error(i18n.__('commands.stop.no-play-error'));
    }

    player.stop();
    await interaction.reply(i18n.__('commands.stop.reply'));
  }
}
