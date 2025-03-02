import {SlashCommandBuilder} from '@discordjs/builders';
import {ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits} from 'discord.js';
import {injectable} from 'inversify';
import {prisma} from '../utils/db.js';
import Command from './index.js';
import {getGuildSettings} from '../utils/get-guild-settings.js';
import i18n from 'i18n';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('config')
    .setDescription(i18n.__('commands.config.description'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString())
    .addSubcommand(subcommand => subcommand
      .setName('set-playlist-limit')
      .setDescription(i18n.__('commands.config.subcommands.set-playlist-limit.description'))
      .addIntegerOption(option => option
        .setName('limit')
        .setDescription(i18n.__('commands.config.subcommands.set-playlist-limit.options.limit-description'))
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('set-wait-after-queue-empties')
      .setDescription(i18n.__('commands.config.subcommands.set-wait-after-queue-empties.description'))
      .addIntegerOption(option => option
        .setName('delay')
        .setDescription(i18n.__('commands.config.subcommands.set-wait-after-queue-empties.options.delay-description'))
        .setRequired(true)
        .setMinValue(0)))
    .addSubcommand(subcommand => subcommand
      .setName('set-leave-if-no-listeners')
      .setDescription(i18n.__('commands.config.subcommands.set-leave-if-no-listeners.description'))
      .addBooleanOption(option => option
        .setName('value')
        .setDescription(i18n.__('commands.config.subcommands.set-leave-if-no-listeners.options.value-description'))
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('set-queue-add-response-hidden')
      .setDescription(i18n.__('commands.config.subcommands.set-queue-add-response-hidden.description'))
      .addBooleanOption(option => option
        .setName('value')
        .setDescription(i18n.__('commands.config.subcommands.set-queue-add-response-hidden.options.value-description'))
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('set-reduce-vol-when-voice')
      .setDescription(i18n.__('commands.config.subcommands.set-reduce-vol-when-voice.description'))
      .addBooleanOption(option => option
        .setName('value')
        .setDescription(i18n.__('commands.config.subcommands.set-reduce-vol-when-voice.options.value-description'))
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('set-reduce-vol-when-voice-target')
      .setDescription(i18n.__('commands.config.subcommands.set-reduce-vol-when-voice-target.description'))
      .addIntegerOption(option => option
        .setName('volume')
        .setDescription(i18n.__('common.volume-description'))
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('set-auto-announce-next-song')
      .setDescription(i18n.__('commands.config.subcommands.set-auto-announce-next-song.description'))
      .addBooleanOption(option => option
        .setName('value')
        .setDescription(i18n.__('commands.config.subcommands.set-auto-announce-next-song.options.value-description'))
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('set-default-volume')
      .setDescription(i18n.__('commands.config.subcommands.set-default-volume.description'))
      .addIntegerOption(option => option
        .setName('level')
        .setDescription(i18n.__('common.volume-description'))
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('set-default-queue-page-size')
      .setDescription(i18n.__('commands.config.subcommands.set-default-queue-page-size.description'))
      .addIntegerOption(option => option
        .setName('page-size')
        .setDescription(i18n.__('commands.config.subcommands.set-default-queue-page-size.options.page-size-description'))
        .setMinValue(1)
        .setMaxValue(30)
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('get')
      .setDescription(i18n.__('commands.config.subcommands.get.description')));

  async execute(interaction: ChatInputCommandInteraction) {
    // Ensure guild settings exist before trying to update
    await getGuildSettings(interaction.guild!.id);

    switch (interaction.options.getSubcommand()) {
      case 'set-playlist-limit': {
        const limit: number = interaction.options.getInteger('limit')!;

        if (limit < 1) {
          throw new Error(i18n.__('commands.config.subcommands.set-playlist-limit.limit-error'));
        }

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            playlistLimit: limit,
          },
        });

        await interaction.reply(i18n.__('commands.config.subcommands.set-playlist-limit.reply'));

        break;
      }

      case 'set-wait-after-queue-empties': {
        const delay = interaction.options.getInteger('delay')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            secondsToWaitAfterQueueEmpties: delay,
          },
        });

        await interaction.reply(i18n.__('commands.config.subcommands.set-wait-after-queue-empties.reply'));

        break;
      }

      case 'set-leave-if-no-listeners': {
        const value = interaction.options.getBoolean('value')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            leaveIfNoListeners: value,
          },
        });

        await interaction.reply(i18n.__('commands.config.subcommands.set-leave-if-no-listeners.reply'));

        break;
      }

      case 'set-queue-add-response-hidden': {
        const value = interaction.options.getBoolean('value')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            queueAddResponseEphemeral: value,
          },
        });

        await interaction.reply(i18n.__('commands.config.subcommands.set-queue-add-response-hidden.reply'));

        break;
      }

      case 'set-auto-announce-next-song': {
        const value = interaction.options.getBoolean('value')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            autoAnnounceNextSong: value,
          },
        });

        await interaction.reply(i18n.__('commands.config.subcommands.set-auto-announce-next-song.reply'));

        break;
      }

      case 'set-default-volume': {
        const value = interaction.options.getInteger('level')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            defaultVolume: value,
          },
        });

        await interaction.reply(i18n.__('commands.config.subcommands.set-default-volume.reply'));

        break;
      }

      case 'set-default-queue-page-size': {
        const value = interaction.options.getInteger('page-size')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            defaultQueuePageSize: value,
          },
        });

        await interaction.reply(i18n.__('commands.config.subcommands.set-default-queue-page-size.reply'));

        break;
      }

      case 'set-reduce-vol-when-voice': {
        const value = interaction.options.getBoolean('value')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            turnDownVolumeWhenPeopleSpeak: value,
          },
        });

        await interaction.reply(i18n.__('commands.config.subcommands.set-reduce-vol-when-voice'));

        break;
      }

      case 'set-reduce-vol-when-voice-target': {
        const value = interaction.options.getInteger('volume')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            turnDownVolumeWhenPeopleSpeakTarget: value,
          },
        });

        await interaction.reply(i18n.__('commands.config.subcommands.set-reduce-vol-when-voice-target'));

        break;
      }

      case 'get': {
        const embed = new EmbedBuilder().setTitle(i18n.__('commands.config.subcommands.get.show.title'));

        const config = await getGuildSettings(interaction.guild!.id);

        const settingsToShow = {
          'playlist-limit': config.playlistLimit,
          'seconds-to-wait-after-queue-empties.title': config.secondsToWaitAfterQueueEmpties === 0
            ? i18n.__('commands.config.subcommands.get.show.seconds-to-wait-after-queue-empties.none')
            : i18n.__('commands.config.subcommands.get.show.seconds-to-wait-after-queue-empties.seconds', config.secondsToWaitAfterQueueEmpties),
          'leave-if-no-listeners': config.leaveIfNoListeners ? i18n.__('common.yes') : i18n.__('common.no'),
          'auto-announce-next-song': config.autoAnnounceNextSong ? i18n.__('common.yes') : i18n.__('common.no'),
          'queue-add-response-ephemeral': config.autoAnnounceNextSong ? i18n.__('common.yes') : i18n.__('common.no'),
          'default-volume': config.defaultVolume,
          'default-queue-page-size': config.defaultQueuePageSize,
          'turn-down-volume-when-people-speak': config.turnDownVolumeWhenPeopleSpeak ? i18n.__('common.yes') : i18n.__('common.no'),
        };

        let description = '';
        for (const [key, value] of Object.entries(settingsToShow)) {
          description += `**${i18n.__(`commands.config.subcommands.get.show.${key}`)}**: ${value}\n`;
        }

        embed.setDescription(description);

        await interaction.reply({embeds: [embed]});

        break;
      }

      default:
        throw new Error('unknown subcommand');
    }
  }
}
