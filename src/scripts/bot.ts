// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';
import * as TB from 'node-telegram-bot-api';

const token = process.env.TOKEN;

export const bot: TB = new TelegramBot(token, { polling: true });

export async function initCommands() {
  await setCommands([
    {
      command: '/add',
      description: 'Добавить аккаунт для сбора наград',
    },
    {
      command: '/remove',
      description: 'Удалить акаунт',
    },
    {
      command: '/list',
      description: 'Список моих прикрепленных аккаунтов',
    },
  ]);
}

async function setCommands(list: TB.BotCommand[]) {
  await bot.setMyCommands(list);
}
