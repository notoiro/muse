import {AutocompleteInteraction, ChatInputCommandInteraction} from 'discord.js';
import {URL} from 'url';
import {SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder} from '@discordjs/builders';
import {inject, injectable, optional} from 'inversify';
import Spotify from 'spotify-web-api-node';
import Command from './index.js';
import {TYPES} from '../types.js';
import ThirdParty from '../services/third-party.js';
import getYouTubeAndSpotifySuggestionsFor from '../utils/get-youtube-and-spotify-suggestions-for.js';
import KeyValueCacheProvider from '../services/key-value-cache.js';
import {ONE_HOUR_IN_SECONDS} from '../utils/constants.js';
import AddQueryToQueue from '../services/add-query-to-queue.js';
import i18n from 'i18n';

@injectable()
export default class implements Command {
  public readonly slashCommand: Partial<SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder> & Pick<SlashCommandBuilder, 'toJSON'>;

  public requiresVC = true;

  private readonly spotify?: Spotify;
  private readonly cache: KeyValueCacheProvider;
  private readonly addQueryToQueue: AddQueryToQueue;

  constructor(@inject(TYPES.ThirdParty) @optional() thirdParty: ThirdParty, @inject(TYPES.KeyValueCache) cache: KeyValueCacheProvider, @inject(TYPES.Services.AddQueryToQueue) addQueryToQueue: AddQueryToQueue) {
    this.spotify = thirdParty?.spotify;
    this.cache = cache;
    this.addQueryToQueue = addQueryToQueue;

    const queryDescription = thirdParty === undefined
      ? i18n.__('commands.play.options.queue-description')
      : i18n.__('commands.play.options.queue-description-with-thirdparty');

    this.slashCommand = new SlashCommandBuilder()
      .setName('play')
      .setDescription(i18n.__('commands.play.description'))
      .addStringOption(option => option
        .setName('query')
        .setDescription(queryDescription)
        .setAutocomplete(true)
        .setRequired(true))
      .addBooleanOption(option => option
        .setName('immediate')
        .setDescription(i18n.__('common.immediate-description')))
      .addBooleanOption(option => option
        .setName('shuffle')
        .setDescription(i18n.__('common.shuffle-description')))
      .addBooleanOption(option => option
        .setName('split')
        .setDescription(i18n.__('common.split-description')))
      .addBooleanOption(option => option
        .setName('skip')
        .setDescription(i18n.__('common.skip-description')));
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query')!;

    await this.addQueryToQueue.addToQueue({
      interaction,
      query: query.trim(),
      addToFrontOfQueue: interaction.options.getBoolean('immediate') ?? false,
      shuffleAdditions: interaction.options.getBoolean('shuffle') ?? false,
      shouldSplitChapters: interaction.options.getBoolean('split') ?? false,
      skipCurrentTrack: interaction.options.getBoolean('skip') ?? false,
    });
  }

  public async handleAutocompleteInteraction(interaction: AutocompleteInteraction): Promise<void> {
    const query = interaction.options.getString('query')?.trim();

    if (!query || query.length === 0) {
      await interaction.respond([]);
      return;
    }

    try {
      // Don't return suggestions for URLs
      // eslint-disable-next-line no-new
      new URL(query);
      await interaction.respond([]);
      return;
    } catch {}

    const suggestions = await this.cache.wrap(
      getYouTubeAndSpotifySuggestionsFor,
      query,
      this.spotify,
      10,
      {
        expiresIn: ONE_HOUR_IN_SECONDS,
        key: `autocomplete:${query}`,
      });

    await interaction.respond(suggestions);
  }
}
