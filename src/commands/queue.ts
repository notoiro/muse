import {ChatInputCommandInteraction} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {inject, injectable} from 'inversify';
import {TYPES} from '../types.js';
import PlayerManager from '../managers/player.js';
import Command from './index.js';
import {buildQueueEmbed} from '../utils/build-embed.js';
import {getGuildSettings} from '../utils/get-guild-settings.js';
import i18n from 'i18n';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('queue')
    .setDescription(i18n.__('commands.queue.description'))
    .addIntegerOption(option => option
      .setName('page')
      .setDescription(i18n.__('commands.queue.options.page-description'))
      .setRequired(false))
    .addIntegerOption(option => option
      .setName('page-size')
      // NOTE: 英語だとデフォルトが10であると表記してるけどデフォルト調整する設定があるのでこれは書かないほうが良いと思う
      .setDescription(i18n.__('commands.queue.options.page-size-description'))
      .setMinValue(1)
      .setMaxValue(30)
      .setRequired(false));

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guild!.id;
    const player = this.playerManager.get(guildId);

    const pageSizeFromOptions = interaction.options.getInteger('page-size');
    const pageSize = pageSizeFromOptions ?? (await getGuildSettings(guildId)).defaultQueuePageSize;

    const embed = buildQueueEmbed(
      player,
      interaction.options.getInteger('page') ?? 1,
      pageSize,
    );

    await interaction.reply({embeds: [embed]});
  }
}
