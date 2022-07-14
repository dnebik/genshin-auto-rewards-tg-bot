import { CommandCallback } from '@/types/types';
import { constants } from '@/constants';
import * as TelegramBot from 'node-telegram-bot-api';
import { addAccount, getList, removeAccount } from '@/scripts/requests';

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
      if (json.account_id) json.account_id = Number(json.account_id);
      if (
        typeof json.cookie_token === 'string' &&
        typeof json.account_id === 'number' &&
        !Number.isNaN(json.account_id)
      ) {
        try {
          await bot.sendMessage(msg.chat.id, `Проверяю....`);
          await new Promise((resolve) => setTimeout(() => resolve(true), 600));
          await addAccount(json.account_id, json.cookie_token, msg.chat.id);
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
        } catch (e) {
          if (e.response.status === 456) {
            await bot.sendSticker(msg.chat.id, constants.STICKER.SHOCK);
            await bot.sendMessage(
              msg.chat.id,
              `Данный профиль уже кем то добавлен - я не могу его менять. Если ты знаешь владельца, то он сам должен менять значение.`
            );
            bot.removeListener('message', handleMsg);
            done();
          } else {
            await bot.sendSticker(msg.chat.id, constants.STICKER.PANIC);
            await bot.sendMessage(
              msg.chat.id,
              `С данными которые ты прислал мне не получилось войти! Попытайся снова прислать, может где то ошибка.`
            );
          }
        }
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
};

export const onList: CommandCallback = async (msg, bot, done) => {
  try {
    await bot.sendSticker(msg.chat.id, constants.STICKER.CHECKING);
    await bot.sendMessage(msg.chat.id, 'Одну секундочку, я проверяю список.');
    const data = await getList(msg.chat.id);
    let result = '';
    const entriesData = Object.entries(data);
    entriesData.forEach(
      ([id, nickname]) =>
        (result += `<pre>uid: ${id}     nickname: ${nickname}</pre>\n`)
    );

    await new Promise((resolve) => setTimeout(() => resolve(true), 1000));
    if (entriesData.length) {
      await bot.sendMessage(msg.chat.id, `А вот и список: \n${result}`, {
        parse_mode: 'HTML',
      });
    } else {
      await bot.sendMessage(msg.chat.id, 'Ты еще не добавлял сюда акаунты');
    }
  } catch (e) {
    console.error(e);
    await bot.sendSticker(msg.chat.id, constants.STICKER.PANIC);
    await bot.sendMessage(
      msg.chat.id,
      'Кажется все пошло не по плану. Все сломалось!'
    );
  } finally {
    done();
  }
};

export const onRemove: CommandCallback = async (msg, bot, done) => {
  const chatId = msg.chat.id;
  try {
    await bot.sendSticker(msg.chat.id, constants.STICKER.CHECKING);
    await bot.sendMessage(msg.chat.id, 'Одну секундочку, я проверяю список.');
    const data = await getList(msg.chat.id);
    let result = '';
    const entriesData = Object.entries(data);
    entriesData.forEach(
      ([id, nickname], index) =>
        (result += `<pre>№${
          index + 1
        }  uid: ${id}     nickname: ${nickname}</pre>\n`)
    );
    if (!Object.keys(data).length) {
      await bot.sendMessage(msg.chat.id, `Кажется тебе нечего удолять`);
      done();
    }
    await bot.sendMessage(
      msg.chat.id,
      `Напиши номер того аккаунта, который хочешь удалить: \n${result} \nЕсли передумал напиши <b>exit</b>.`,
      {
        parse_mode: 'HTML',
      }
    );

    const handleMsg = async (msg: TelegramBot.Message) => {
      if (msg.chat.id !== chatId) return;
      if (msg.text.toLowerCase() === 'exit') {
        bot.removeListener('message', handleMsg);
        done();
      }

      const number = Number(msg.text);
      if (entriesData.length <= number && number > 0) {
        try {
          await bot.sendMessage(msg.chat.id, `Удаляю....`);
          await removeAccount(+entriesData[number - 1][0]);
          await bot.sendMessage(msg.chat.id, `Готово!`);
          await bot.sendSticker(msg.chat.id, constants.STICKER.OK);
        } catch (e) {
          console.error(e);
          await bot.sendSticker(msg.chat.id, constants.STICKER.PANIC);
          await bot.sendMessage(
            msg.chat.id,
            'Кажется все пошло не по плану. Все сломалось!'
          );
        } finally {
          bot.removeListener('message', handleMsg);
          done();
        }
      } else {
        await bot.sendSticker(msg.chat.id, constants.STICKER.DONT_UNDERSTAND);
        await bot.sendMessage(
          msg.chat.id,
          'Неуж то так сложно написать правильную цифру????'
        );
      }
    };
    bot.on('message', handleMsg);
  } catch (e) {
    console.error(e);
    await bot.sendSticker(msg.chat.id, constants.STICKER.PANIC);
    await bot.sendMessage(
      msg.chat.id,
      'Кажется все пошло не по плану. Все сломалось!'
    );
  } finally {
    done();
  }
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
