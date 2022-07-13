import * as TG from 'node-telegram-bot-api';

export type CommandCallback = (
  msg: TG.Message,
  bot: TG,
  done: () => void
) => void;
export type CommandObject = [string, CommandCallback];
