import { InitializeMessage } from '@/types/types';
import { bot } from '@/scripts/bot';
import { constants } from '@/constants';

export async function sendMessage(
  chatId: number,
  message: InitializeMessage | InitializeMessage[]
) {
  if (message.length) {
    if (Array.isArray(message[0])) {
      let i = 0;
      // Перебор массива
      await (async function next() {
        const m = (message as InitializeMessage[])[i++];
        await sendMessage(chatId, m);
        if (i < message.length) await next();
      })();
    } else {
      const [type, content, time] = message as InitializeMessage;
      if (time) {
        await new Promise((resolve) => setTimeout(() => resolve(true), time));
      }
      // Выбор типв и отправка
      switch (type) {
        case 'sticker':
          await bot.sendSticker(
            chatId,
            constants.STICKER[content.toLocaleUpperCase()] ||
              content ||
              constants.STICKER.CHECKING
          );
          break;
        case 'text':
          await bot.sendMessage(chatId, content || 'null', {
            parse_mode: 'HTML',
          });
      }
    }
  }
}
