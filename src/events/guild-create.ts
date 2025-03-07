import {Client, Guild} from 'discord.js';
import container from '../inversify.config.js';
import Command from '../commands/index.js';
import {TYPES} from '../types.js';
import Config from '../services/config.js';
import {prisma} from '../utils/db.js';
import {REST} from '@discordjs/rest';
import {Setting} from '@prisma/client';
import registerCommandsOnGuild from '../utils/register-commands-on-guild.js';
import i18n from 'i18n';

export async function createGuildSettings(guildId: string): Promise<Setting> {
  return prisma.setting.upsert({
    where: {
      guildId,
    },
    create: {
      guildId,
    },
    update: {},
  });
}

export default async (guild: Guild): Promise<void> => {
  await createGuildSettings(guild.id);

  const config = container.get<Config>(TYPES.Config);

  // Setup slash commands
  if (!config.REGISTER_COMMANDS_ON_BOT) {
    const client = container.get<Client>(TYPES.Client);

    const rest = new REST({version: '10'}).setToken(config.DISCORD_TOKEN);

    await registerCommandsOnGuild({
      rest,
      applicationId: client.user!.id,
      guildId: guild.id,
      commands: container.getAll<Command>(TYPES.Command).map(command => command.slashCommand),
    });
  }

  const owner = await guild.fetchOwner();
  // NOTE: 管理者がDMの受信を拒否している場合エラーが出るので適切にハンドリングする
  await owner.send(i18n.__('events.owner-dm'));
};
