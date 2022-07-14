import axios from 'axios';

const API_URL = process.env.API_URL;

export async function getList(chatId: number): Promise<any> {
  const url = new URL(API_URL);
  url.pathname = '/list';
  return await axios
    .post(url.toString(), { tg_chat_id: chatId })
    .then(({ data }) => data);
}
export async function addAccount(
  account_id: number,
  cookie_token: string,
  chatId: number
): Promise<string> {
  const url = new URL(API_URL);
  url.pathname = '/add';
  return await axios
    .post(url.toString(), { tg_chat_id: chatId, account_id, cookie_token })
    .then(({ data }) => data);
}
export async function removeAccount(account_id: number): Promise<string> {
  const url = new URL(API_URL);
  url.pathname = '/rm';
  return await axios
    .post(url.toString(), { account_id })
    .then(({ data }) => data);
}
