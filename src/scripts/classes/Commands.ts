import { CommandObject } from '@/types/types';
import * as TelegramBot from 'node-telegram-bot-api';

export default class Commands {
  private commands: CommandObject[];
  private bot: TelegramBot;
  private busyList = new Map<number, boolean>();
  private isListening = false;

  constructor(bot: TelegramBot, commands: CommandObject[]) {
    this.commands = commands;
    this.bot = bot;

    this.bot.onText(/^\//, this.onText.bind(this));
  }

  public listen() {
    this.isListening = true;
  }

  public stopListening() {
    this.isListening = false;
  }

  private onText(msg: TelegramBot.Message) {
    if (this.busyList.has(msg.chat.id) || !this.isListening) return;
    const command = this.commands.find(
      ([c]) => msg.text.toLowerCase() === c.toLowerCase()
    );
    if (command) {
      this.busyList.set(msg.chat.id, true);
      const [com, callback] = command;
      const done = () => {
        this.busyList.delete(msg.chat.id);
      };
      callback(msg, this.bot, done);
    }
  }
}
