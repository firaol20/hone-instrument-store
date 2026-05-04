import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const TELEGRAM_API = 'https://api.telegram.org';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ORDER_BOT_TOKEN = process.env.TELEGRAM_ORDER_BOT_TOKEN;
const STORE_URL = process.env.STORE_URL || process.env.FRONTEND_URL || 'https://hone-instrument-store-frontend.vercel.app/';

async function setup() {
  try {
    if (BOT_TOKEN) {
      console.log('Setting up Product Bot Commands...');
      await axios.post(`${TELEGRAM_API}/bot${BOT_TOKEN}/setMyCommands`, {
        commands: [
          { command: 'start', description: 'Start the bot and open menu' },
          { command: 'add_product', description: 'Add a new product (Admin only)' },
          { command: 'list_products', description: 'View all products' },
          { command: 'contact', description: 'Contact store owners' }
        ]
      });
      console.log('Product Bot Commands set successfully!');
      
      // Optionally set the Web App Menu Button instead of standard commands menu
      // To keep standard commands menu (with 3 horizontal lines), we just need commands.
      // But if we want a direct "Website" button on the left, we do this:
      /*
      await axios.post(`${TELEGRAM_API}/bot${BOT_TOKEN}/setChatMenuButton`, {
        menu_button: {
          type: 'web_app',
          text: 'Website',
          web_app: { url: STORE_URL }
        }
      });
      */
    }

    if (ORDER_BOT_TOKEN) {
      console.log('Setting up Order Bot Commands...');
      await axios.post(`${TELEGRAM_API}/bot${ORDER_BOT_TOKEN}/setMyCommands`, {
        commands: [
          { command: 'start', description: 'Start the order bot' }
        ]
      });
      console.log('Order Bot Commands set successfully!');
    }

    console.log('Setup complete! The "Menu" button should now appear in Telegram.');
  } catch (error: any) {
    console.error('Error during setup:', error.response?.data || error.message);
  }
}

setup();
