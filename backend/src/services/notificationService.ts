import { Response } from 'express';
import axios from 'axios';
import Notification, { INotification } from '../models/Notification';

class NotificationManager {
  private clients: Set<Response> = new Set();

  public addClient(res: Response) {
    this.clients.add(res);

    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  public broadcast(event: string, data: any) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }
}

export const notificationManager = new NotificationManager();

export const sendOrderTelegramNotification = async (text: string) => {
  const botToken = process.env.TELEGRAM_ORDER_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ORDER_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('⚠️ TELEGRAM_ORDER_BOT_TOKEN or TELEGRAM_ORDER_CHAT_ID not set. Skipping Telegram notification.');
    return;
  }

  try {
    const TELEGRAM_API = 'https://api.telegram.org';
    await axios.post(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.error('Error sending order Telegram notification:', error);
  }
};

export const createAndBroadcastNotification = async (type: string, message: string, data?: any) => {
  try {
    const notification = new Notification({
      type,
      message,
      data,
    });
    await notification.save();

    notificationManager.broadcast('new_notification', notification);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
