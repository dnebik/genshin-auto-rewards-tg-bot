import axios from 'axios';
import { CommandCallback } from '@/types/types';
import { constants } from '@/constants';
import * as TelegramBot from 'node-telegram-bot-api';

const API_URL = process.env.API_URL;
const COOKIES_SCRIPT = `
JSON.stringify(Object.fromEntries(document.cookie.replace(/ /g, '').split(';').map((a) => a.split('=')).filter((a) => ['account_id', 'cookie_token'].includes(a[0]))))
`;

export const onAdd: CommandCallback = async (msg, bot, done) => {
  const chatId = msg.chat.id;
  await bot.sendSticker(chatId, constants.STICKER.SIT);
  await bot.sendMessage(
    chatId,
    'Чтобы добавить аккаунт - тебе придется довериться мне.'
  );
  await bot.sendMessage(
    chatId,
    'С компьютера зайди на сайт hoyolab.com и авторизуйся там.'
  );
  await bot.sendMessage(
    chatId,
    `После на том же сайте нажми <b>F12</b> и в открывшемся окне выбери вкладку <b>"Console"</b> или <b>"Консоль"</b>. Затем вставь туда следующую команду: <pre>${COOKIES_SCRIPT}</pre>`,
    { parse_mode: 'HTML' }
  );
  await bot.sendMessage(
    chatId,
    `В ответ тебе придет сообщение похожего вида: <pre>"{\\"cookie_token\\":\\"kKqiKeAtRksNyTcWuZ20xzxmoEa9RtVVIa9h2qMm\\",\\"account_id\\":\\"138197951\\"}"</pre>\n\nПришли мне его сюда, а после я займусь остальной магией.`,
    { parse_mode: 'HTML' }
  );

  const handleMsg = async (msg: TelegramBot.Message) => {
    if (msg.chat.id !== chatId) return;
    try {
      if (msg.text.toLowerCase() === 'exit') {
        bot.removeListener('message', handleMsg);
        done();
        return;
      }

      const msgWithRemovedQuotes = msg.text
        .replace(/ /g, '')
        .replace(/\n/g, '')
        .substring(1, msg.text.length - 1)
        .replace(/\\/g, '');
      const json = JSON.parse(msgWithRemovedQuotes);
      if (json.cookie_token && json.account_id) {
        await bot.sendSticker(msg.chat.id, constants.STICKER.LAUGH);
        await bot.sendMessage(
          msg.chat.id,
          `Вот ты и попался, дружочек. Теперь ты оффициально взломан!`
        );
        await new Promise((resolve) => setTimeout(() => resolve(true), 4500));
        await bot.sendMessage(
          msg.chat.id,
          `Да не волнуйся ты так, я же пошутила.`
        );
        await bot.sendSticker(msg.chat.id, constants.STICKER.OK);
        await bot.sendMessage(
          msg.chat.id,
          `Я все проверила - все данные верны! Твой профиль был добавлен и теперь для него будут собираться награды. Ура!`
        );
        bot.removeListener('message', handleMsg);
        done();
      } else {
        await bot.sendSticker(msg.chat.id, constants.STICKER.DONT_WORRY);
        await bot.sendMessage(
          msg.chat.id,
          `Кажется чего-то не хватает. Попробуй перезайти и повторить ввод команды в консоль. Затем снова пришли сюда результат.\nЯ надеюсь это тебе поможет.`
        );
      }
    } catch (e) {
      await bot.sendSticker(msg.chat.id, constants.STICKER.SADNESS);
      await bot.sendMessage(
        msg.chat.id,
        `Кажется ты прислал мне что-то не то. Проверь похоже ли то, что ты прислал на пример, который я тебе показывала и пришли повторно.\nЕсли хочешь выйти из этого диалога напиши <b>exit</b>.`,
        { parse_mode: 'HTML' }
      );
    }
  };

  bot.on('message', handleMsg);
  // axios.post(API_URL + '/add', {});
};

export const onStart: CommandCallback = async (msg, bot, done) => {
  await bot.sendSticker(msg.chat.id, constants.STICKER.HI);
  await bot.sendMessage(
    msg.chat.id,
    'Привет! Я могу помочь собирать за тебя ежедневные подарки.'
  );
  await bot.sendMessage(
    msg.chat.id,
    'Чтобы собирать подарки, мне потребуются твои cookies с сайта '
  );
  done();
};
