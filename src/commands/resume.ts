import {SlashCommandBuilder} from '@discordjs/builders';
import {inject, injectable} from 'inversify';
import Command from './index.js';
import {TYPES} from '../types.js';
import PlayerManager from '../managers/player.js';
import {STATUS} from '../services/player.js';
import {buildPlayingMessageEmbed} from '../utils/build-embed.js';
import {getMemberVoiceChannel, getMostPopularVoiceChannel} from '../utils/channels.js';
import {ChatInputCommandInteraction, GuildMember} from 'discord.js';
import i18n from 'i18n';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('resume')
    .setDescription(i18n.__('commands.resume.description'));

  public requiresVC = true;

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);
    const [targetVoiceChannel] = getMemberVoiceChannel(interaction.member as GuildMember) ?? getMostPopularVoiceChannel(interaction.guild!);
    if (player.status === STATUS.PLAYING) {
      throw new Error(i18n.__('commands.resume.playing-error'));
    }

    // Must be resuming play
    if (!player.getCurrent()) {
      throw new Error(i18n.__('commands.resume.no-play-error'));
    }

    await player.connect(targetVoiceChannel);
    await player.play();

    await interaction.reply({
      content: i18n.__('commands.resume.reply'),
      embeds: [buildPlayingMessageEmbed(player)],
    });
  }
}
