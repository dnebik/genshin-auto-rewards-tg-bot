import { CommandCallback } from '@/types/types';
import * as TelegramBot from 'node-telegram-bot-api';
import { addAccount, getList, removeAccount } from '@/scripts/requests';
import { sendMessage } from '@/scripts/sendMessage';

const COOKIES_SCRIPT = `
JSON.stringify(Object.fromEntries(document.cookie.replace(/ /g, '').split(';').map((a) => a.split('=')).filter((a) => ['account_id', 'cookie_token'].includes(a[0]))))
`;

export const onAdd: CommandCallback = async (msg, bot, done) => {
  const chatId = msg.chat.id;
  await sendMessage(chatId, [
    ['sticker', 'SIT'],
    ['text', 'Чтобы добавить аккаунт - тебе придется довериться мне.'],
    ['text', 'С компьютера зайди на сайт hoyolab.com и авторизуйся там.'],
    [
      'text',
      `После на том же сайте нажми <b>F12</b> и в открывшемся окне выбери вкладку <b>"Console"</b> или <b>"Консоль"</b>. Затем вставь туда следующую команду: <code>${COOKIES_SCRIPT}</code>`,
    ],
    [
      'text',
      `В ответ тебе придет сообщение похожего вида: <pre>"{\\"cookie_token\\":\\"kKqiKeAtRksNyTcWuZ20xzxmoEa9RtVVIa9h2qMm\\",\\"account_id\\":\\"138197951\\"}"</pre>\n\nПришли мне его сюда, а после я займусь остальной магией.`,
    ],
  ]);

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
      if (json.account_id) json.account_id = Number(json.account_id);
      if (
        typeof json.cookie_token === 'string' &&
        typeof json.account_id === 'number' &&
        !Number.isNaN(json.account_id)
      ) {
        try {
          await sendMessage(msg.chat.id, ['text', 'Проверяю....']);
          await new Promise((resolve) => setTimeout(() => resolve(true), 300));

          await addAccount(json.account_id, json.cookie_token, msg.chat.id);

          await sendMessage(msg.chat.id, [
            ['sticker', 'LAUGH'],
            [
              'text',
              'Вот ты и попался, дружочек. Теперь ты оффициально взломан!',
            ],
            ['text', 'Да не волнуйся ты так, я же пошутила.', 4500],
            ['sticker', 'OK'],
            [
              'text',
              'Я все проверила - все данные верны! Твой профиль был добавлен и теперь для него будут собираться награды. Ура!',
            ],
          ]);

          bot.removeListener('message', handleMsg);
          done();
        } catch (e) {
          console.log(e.response);
          if (e.response.status === 456) {
            await sendMessage(msg.chat.id, [
              ['sticker', 'SHOCK'],
              [
                'text',
                'Данный профиль уже кем то добавлен - я не могу его менять. Если ты знаешь владельца, то он сам должен менять значение.',
              ],
            ]);
            bot.removeListener('message', handleMsg);
            done();
          } else {
            await sendMessage(msg.chat.id, [
              ['sticker', 'PANIC'],
              [
                'text',
                'С данными которые ты прислал мне не получилось войти! Попытайся снова прислать, может где то ошибка.',
              ],
            ]);
          }
        }
      } else {
        await sendMessage(msg.chat.id, [
          ['sticker', 'DONT_WORRY'],
          [
            'text',
            'Кажется чего-то не хватает. Попробуй перезайти и повторить ввод команды в консоль. Затем снова пришли сюда результат.\nЯ надеюсь это тебе поможет.',
          ],
        ]);
      }
    } catch (e) {
      await sendMessage(msg.chat.id, [
        ['sticker', 'SADNESS'],
        [
          'text',
          'Кажется ты прислал мне что-то не то. Проверь похоже ли то, что ты прислал на пример, который я тебе показывала и пришли повторно.\nЕсли хочешь выйти из этого диалога напиши <b>exit</b>.',
        ],
      ]);
    }
  };

  bot.on('message', handleMsg);
};

export const onList: CommandCallback = async (msg, bot, done) => {
  try {
    await sendMessage(msg.chat.id, [
      ['sticker', 'CHECKING'],
      ['text', 'Одну секундочку, я проверяю список.'],
    ]);
    const data = await getList(msg.chat.id);
    let result = '';
    const entriesData = Object.entries(data);
    entriesData.forEach(
      ([id, nickname]) =>
        (result += `<pre>uid: ${id}     nickname: ${nickname}</pre>\n`)
    );

    const text = entriesData.length
      ? `А вот и список: \n${result}`
      : 'Ты еще не добавлял сюда акаунты';
    await sendMessage(msg.chat.id, ['text', text, 600]);
  } catch (e) {
    console.error(e);
    await sendMessage(msg.chat.id, [
      ['sticker', 'PANIC'],
      ['text', 'Кажется все пошло не по плану. Все сломалось!'],
    ]);
  } finally {
    done();
  }
};

export const onRemove: CommandCallback = async (msg, bot, done) => {
  const chatId = msg.chat.id;
  try {
    await sendMessage(msg.chat.id, [
      ['sticker', 'CHECKING'],
      ['text', 'Одну секундочку, я проверяю список.'],
    ]);
    const data = await getList(msg.chat.id);
    let result = '';
    const entriesData = Object.entries(data);
    entriesData.forEach(
      ([id, nickname], index) =>
        (result += `<pre>№${
          index + 1
        }  uid: ${id}     nickname: ${nickname}</pre>\n`)
    );
    const text = entriesData.length
      ? `Напиши номер того аккаунта, который хочешь удалить: \n${result} \nЕсли передумал напиши <b>exit</b>.`
      : 'Кажется тебе нечего удолять';
    await sendMessage(msg.chat.id, ['text', text]);

    const handleMsg = async (msg: TelegramBot.Message) => {
      if (msg.chat.id !== chatId) return;
      if (msg.text.toLowerCase() === 'exit') {
        bot.removeListener('message', handleMsg);
        done();
        return;
      }

      const number = Number(msg.text);
      if (entriesData.length <= number && number > 0) {
        try {
          await sendMessage(msg.chat.id, ['text', 'Удаляю....']);
          await removeAccount(+entriesData[number - 1][0]);
          await sendMessage(msg.chat.id, [
            ['text', 'Готово!'],
            ['sticker', 'OK'],
          ]);
        } catch (e) {
          console.error(e);
          await sendMessage(msg.chat.id, [
            ['sticker', 'PANIC'],
            ['text', 'Кажется все пошло не по плану. Все сломалось!'],
          ]);
        } finally {
          bot.removeListener('message', handleMsg);
          done();
        }
      } else {
        await sendMessage(msg.chat.id, [
          ['sticker', 'DONT_UNDERSTAND'],
          ['text', 'Неуж то так сложно написать правильную цифру????'],
        ]);
      }
    };
    bot.on('message', handleMsg);
  } catch (e) {
    console.error(e);
    await sendMessage(msg.chat.id, [
      ['sticker', 'PANIC'],
      ['text', 'Кажется все пошло не по плану. Все сломалось!'],
    ]);
  } finally {
    done();
  }
};

export const onStart: CommandCallback = async (msg, bot, done) => {
  await sendMessage(msg.chat.id, [
    ['sticker', 'HI'],
    ['text', 'Привет! Я могу помочь собирать за тебя ежедневные подарки.'],
    ['text', 'Чтобы собирать подарки, мне потребуются твои cookies с сайта'],
  ]);
  done();
};
