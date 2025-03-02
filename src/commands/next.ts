import {injectable} from 'inversify';
import Skip from './skip.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import i18n from 'i18n';

@injectable()
export default class extends Skip {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('next')
    .setDescription(i18n.__('commands.next.description'));
}
