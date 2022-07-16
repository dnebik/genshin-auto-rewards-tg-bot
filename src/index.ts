import 'dotenv/config';
import Commands from '@/scripts/classes/Commands';
import { onAdd, onList, onRemove, onStart } from '@/scripts/actions';
import { bot, initCommands } from '@/scripts/bot';

if (!process.env.TOKEN) {
  console.error('No env TOKEN');
  process.exit(1);
}
if (!process.env.API_URL) {
  console.error('No env API_URL');
  process.exit(1);
}

(async function () {
  await initCommands();

  // bot.on('message', async (msg) => {
  //   console.log(msg);
  // });

  new Commands(bot, [
    ['/start', onStart],
    ['/add', onAdd],
    ['/list', onList],
    ['/remove', onRemove],
  ]).listen();
})();
