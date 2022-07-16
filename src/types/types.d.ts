import * as TG from 'node-telegram-bot-api';
import { STICKER } from '@/constants';

export type CommandCallback = (
  msg: TG.Message,
  bot: TG,
  done: () => void
) => void;
export type CommandObject = [string, CommandCallback];

export type MessageTypes = ['sticker', 'text'];
export type InitializeMessage =
  | [MessageTypes[0], string | keyof typeof STICKER]
  | [MessageTypes[1], string]
  | [MessageTypes[0], string | keyof typeof STICKER, number]
  | [MessageTypes[1], string, number];
