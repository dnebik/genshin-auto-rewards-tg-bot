// @ts-ignore
import { Application, default as express } from 'express';
import * as bodyParser from 'body-parser';
import { InitializeMessage } from '@/types/types';
import { sendMessage } from '@/scripts/sendMessage';

const PORT = 8579;

const app: Application = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.post('/send', (req, res, next) => {
  const message: InitializeMessage[] | InitializeMessage = req.body.message;
  const chatId: number = req.body.chatId;
  if (!message || typeof chatId !== 'number') {
    res
      .status(400)
      .send('need message as [string, string] and chatId as number');
  } else {
    sendMessage(chatId, message).catch(() => {});
  }
});

export function runApi() {
  app.listen(PORT, onStart);
}

function onStart() {
  console.log(`Api started on port ${PORT}`);
}
