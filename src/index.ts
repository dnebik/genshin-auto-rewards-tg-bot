// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { default as TelegramBot } from 'node-telegram-bot-api';
import * as TB from 'node-telegram-bot-api';
import 'dotenv/config';
import { constants } from '@/constants';
import Commands from '@/scripts/commands';
import { onAdd, onStart } from '@/scripts/actions';

if (!process.env.TOKEN) {
  console.error('No env TOKEN');
  process.exit(1);
}

const token = process.env.TOKEN;
const bot: TB = new TelegramBot(token, { polling: true });

(async function () {
  await bot.setMyCommands([
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
})();

// bot.on('message', async (msg) => {
//   console.log(msg);
// });

new Commands(bot, [
  ['/start', onStart],
  ['/add', onAdd],
]).listen();
