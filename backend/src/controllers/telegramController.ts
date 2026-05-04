import axios from 'axios';
import TelegramLink from '../models/TelegramLink';
import Product from '../models/Product';
import User from '../models/User';
import Category from '../models/Category';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getOrCreateCategory } from '../utils/categoryHelper';
import { downloadTelegramPhoto } from '../utils/telegramFile';

const TELEGRAM_API = 'https://api.telegram.org';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const MEDIA_GROUP_TIMEOUT_MS = 240000; // 240 seconds – enough for normal albums
const MAX_IMAGES_PER_PRODUCT = 3;      // maximum 3 images

/**
 * Check if a product with same name and category already exists
 * Returns the existing product if found, null otherwise
 */
async function checkDuplicateProduct(name: string, categoryName: string): Promise<any | null> {
  const category = await Category.findOne({
    name: { $regex: new RegExp(`^${categoryName}$`, 'i') }
  });

  if (!category) {
    return null; // No category = no duplicate
  }

  // Check for product with same name in same category (case-insensitive)
  const existingProduct = await Product.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    categoryId: category._id,
  });

  return existingProduct;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  channel_post?: TelegramMessage;
}

interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
    title?: string;
    username?: string;
  };
  text?: string;
  caption?: string;
  media_group_id?: string;
  photo?: Array<{
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    file_size?: number;
  }>;
}

interface ParsedProduct {
  name: string;
  categoryName: string;
  price: number;
  condition: string;
  description: string;
}

// In-memory store for pending media groups
const pendingMediaGroups = new Map<string, {
  caption: string;
  chatId: number;
  photos: Array<{ file_id: string; file_unique_id: string }>;
  timer: NodeJS.Timeout;
  processed: boolean;
  productId?: string; // store the created product ID to add late images
  deletionTimer?: NodeJS.Timeout; // timer to clean up after processing
}>();

export async function handleWebhook(req: Request, res: Response) {
  try {
    const update: TelegramUpdate = req.body;

    if (update.channel_post) {
      await handleChannelPost(update.channel_post);
      return res.json({ ok: true });
    }

    if (update.message) {
      const { message } = update;
      const chatId = message.chat.id;

      if (!message.from) {
        return res.json({ ok: true });
      }

      const userId = message.from.id;
      const firstName = message.from.first_name;

      const text = message.caption || message.text || '';

      if (text === '/start') {
        const STORE_URL = process.env.STORE_URL || process.env.FRONTEND_URL || 'https://hone-instrument-store-frontend.vercel.app/';
        await axios.post(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: chatId,
          text: `Welcome ${firstName}! 🎵\n\nI'm the Hone Instrumental Store bot. Here's what I can do:\n\n` +
                `/add_product - Add a new product to the store\n` +
                `/list_products - View all products\n` +
                `/contact - Contact store owners\n\n` +
                `Use /add_product to start adding instruments!`,
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [
                { text: '🌐 Visit Website', web_app: { url: STORE_URL } }
              ]
            ],
            resize_keyboard: true,
            is_persistent: true
          }
        });
        return res.json({ ok: true });
      }

      if (text.startsWith('/add_product')) {
        await handleAddProduct(chatId, userId, firstName);
        return res.json({ ok: true });
      }

      if (text === '/list_products') {
        await handleListProducts(chatId);
        return res.json({ ok: true });
      }

      if (text === '/contact') {
        await sendMessage(
          chatId,
          'For business inquiries and store support:\n\n📧 Email: support@honestore.com\n📱 WhatsApp: +1-234-567-8900'
        );
        return res.json({ ok: true });
      }

      if (text.includes('Product:') || text.includes('product:')) {
        let imageUrl = '';
        if (message.photo && message.photo.length > 0) {
          imageUrl = await handleTelegramPhoto(message.photo);
        }
        await handleProductSubmission(chatId, text, userId, imageUrl);
        return res.json({ ok: true });
      }

      await sendMessage(
        chatId,
        `I didn't understand that command. Here are available commands:\n/add_product\n/list_products\n/contact`
      );
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.status(500).json({ ok: false, error: 'Webhook processing failed' });
  }
}

async function handleChannelPost(message: TelegramMessage) {
  const chatId = message.chat.id;
  const caption = message.caption || '';
  const mediaGroupId = message.media_group_id;

  console.log(`📨 Channel post: media_group_id=${mediaGroupId || 'none'}, hasCaption=${!!caption}, photoCount=${message.photo?.length || 0}`);

  // -------------------------------------------------------------------
  // 1. Media group (album)
  // -------------------------------------------------------------------
  if (mediaGroupId) {
    console.log(`📸 Media group detected: ${mediaGroupId}`);

    // Get largest photo (last element)
    let largestPhoto: { file_id: string; file_unique_id: string } | null = null;
    if (message.photo && message.photo.length > 0) {
      const lastPhoto = message.photo[message.photo.length - 1];
      largestPhoto = {
        file_id: lastPhoto.file_id,
        file_unique_id: lastPhoto.file_unique_id,
      };
      console.log(`📷 Added photo to group: ${largestPhoto.file_unique_id}`);
    }

    let pending = pendingMediaGroups.get(mediaGroupId);
    if (!pending) {
      // No pending group – create a new one
      console.log(`⏱️ Creating new pending group for ${mediaGroupId} with ${MEDIA_GROUP_TIMEOUT_MS / 1000}s timer`);
      pending = {
        caption: '',
        chatId,
        photos: [],
        timer: setTimeout(() => {
          console.log(`⏰ Timer expired for ${mediaGroupId}, processing group`);
          processPendingMediaGroup(mediaGroupId);
        }, MEDIA_GROUP_TIMEOUT_MS),
        processed: false,
      };
      pendingMediaGroups.set(mediaGroupId, pending);
    } else if (pending.processed) {
      // This group was already processed (product created) – late message
      console.log(`⚠️ Late message for already processed group ${mediaGroupId} – adding image to existing product`);
      if (largestPhoto && pending.productId) {
        try {
          // Check if we already have 3 images
          const product = await Product.findById(pending.productId);
          if (!product) {
            console.log(`❌ Product ${pending.productId} not found for late image`);
            return;
          }

          if (product.images.length >= MAX_IMAGES_PER_PRODUCT) {
            await sendMessage(chatId, `⚠️ Maximum ${MAX_IMAGES_PER_PRODUCT} images already attached. Cannot add more.`);
            return;
          }

          const url = await downloadTelegramPhoto(largestPhoto.file_id);
          if (url) {
            product.images.push(url);
            await product.save();
            await sendMessage(chatId, `📸 Additional image added to product "${product.name}" (${product.images.length}/${MAX_IMAGES_PER_PRODUCT})`);
            console.log(`✅ Added late image to product ${pending.productId}`);

            // Reset deletion timer: keep group alive for another 60 seconds
            if (pending.deletionTimer) clearTimeout(pending.deletionTimer);
            pending.deletionTimer = setTimeout(() => {
              if (pendingMediaGroups.has(mediaGroupId)) {
                pendingMediaGroups.delete(mediaGroupId);
                console.log(`🗑️ Deleted expired pending group ${mediaGroupId}`);
              }
            }, 60000);
          }
        } catch (err) {
          console.error('Error adding late image:', err);
          await sendMessage(chatId, '⚠️ Could not add the late image.');
        }
      }
      return;
    }

    // Reset the timer every time we receive a new message for this group
    if (pending.timer) clearTimeout(pending.timer);
    pending.timer = setTimeout(() => {
      console.log(`⏰ Timer expired for ${mediaGroupId}, processing group`);
      processPendingMediaGroup(mediaGroupId);
    }, MEDIA_GROUP_TIMEOUT_MS);

    // Update caption if this message has one (usually the first)
    if (caption) {
      console.log(`📝 Storing caption for group ${mediaGroupId}`);
      pending.caption = caption;
    }

    // Add photo if not already present (by unique_id) AND we haven't reached max
    if (largestPhoto && !pending.photos.some(p => p.file_unique_id === largestPhoto!.file_unique_id)) {
      if (pending.photos.length >= MAX_IMAGES_PER_PRODUCT) {
        console.log(`⚠️ Already have ${MAX_IMAGES_PER_PRODUCT} images, ignoring extra`);
        await sendToAdmin(`⚠️ Channel post ${mediaGroupId} has too many images. Only first ${MAX_IMAGES_PER_PRODUCT} used.`);
      } else {
        pending.photos.push(largestPhoto);
      }
    }
    return;
  }

  // -------------------------------------------------------------------
  // 2. Single message (no media group) – backward compatibility
  // -------------------------------------------------------------------
  console.log(`📄 Single message (no media group)`);
  if (!caption) {
    console.log('Skipping message without caption');
    return;
  }

  if (!caption.includes('⭐️')) {
    await sendToAdmin(`❌ Rejected channel post: No category (⭐️) found.\n\nCaption excerpt: ${caption.substring(0, 100)}...`);
    return;
  }

  try {
    const parsed = parseChannelCaption(caption);

    if (!parsed.categoryName) {
      await sendToAdmin(`❌ Rejected channel post: Missing Category name after ⭐️.\n\nCaption: ${caption.substring(0, 150)}...`);
      return;
    }

    // Check for duplicate product
    const existingProduct = await checkDuplicateProduct(parsed.name, parsed.categoryName);
    if (existingProduct) {
      console.log(`⚠️ Duplicate product found: ${parsed.name} in category ${parsed.categoryName}`);
      const duplicateMessage = `⚠️ Duplicate Product Attempt!\n\nName: ${parsed.name}\nCategory: ${parsed.categoryName}\n\nAlready exists as:\nSKU: ${existingProduct.sku}\nPrice: ${existingProduct.price} ETB`;
      // Send to admin only, not to channel
      await sendToAdmin(duplicateMessage);
      return;
    }

    let imageUrls: string[] = [];
    if (message.photo && message.photo.length > 0) {
      const largestPhoto = message.photo[message.photo.length - 1];
      try {
        const url = await downloadTelegramPhoto(largestPhoto.file_id);
        if (url) imageUrls.push(url);
      } catch (err) {
        console.error('Error uploading single photo:', err);
        await sendToAdmin('⚠️ Warning: Single post image upload failed. Product created without it.');
      }
    }

    const category = await getOrCreateCategory(parsed.categoryName);
    const latestProduct = await Product.findOne({}).sort({ createdAt: -1 });
    let nextSkuNum = 1;
    if (latestProduct && latestProduct.sku) {
      const match = latestProduct.sku.match(/PROD-(\d+)/);
      if (match) nextSkuNum = parseInt(match[1]) + 1;
    }
    const sku = `PROD-${String(nextSkuNum).padStart(4, '0')}`;
    const slug = parsed.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-') +
      '-prod-' +
      nextSkuNum;

    const product = new Product({
      name: parsed.name,
      categoryId: category._id,
      price: parsed.price,
      description: parsed.description || '',
      slug,
      sku,
      images: imageUrls,
    });

    await product.save();
    await TelegramLink.create({
      userId: 0,
      productId: product._id,
      telegramChatId: chatId,
      importMethod: 'channel_post',
    });

    const priceText = parsed.price === 0 ? 'Call for price' : `${parsed.price.toLocaleString()} ETB`;
    const successMessage =
      `✅ Product Added!\n\n` +
      `Name: ${parsed.name}\n` +
      `Price: ${priceText}\n` +
      `Category: ${parsed.categoryName}\n` +
      `Condition: ${parsed.condition}\n` +
      `SKU: ${sku}\n\n` +
      `Images: ${imageUrls.length} uploaded`;

    // Send to admin only (not to channel)
    await sendToAdmin(successMessage);
  } catch (error) {
    console.error('Single channel post error:', error);
    await sendToAdmin(`❌ Critical error processing channel post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function processPendingMediaGroup(mediaGroupId: string) {
  const pending = pendingMediaGroups.get(mediaGroupId);
  if (!pending) {
    console.log(`⚠️ No pending group found for ${mediaGroupId}`);
    return;
  }

  // Mark as processed immediately to prevent any late messages from re-triggering
  pending.processed = true;

  const { caption, chatId, photos } = pending;
  console.log(`🔄 Processing media group ${mediaGroupId} with ${photos.length} photo(s)`);

  if (!caption) {
    await sendToAdmin(`❌ Media group ${mediaGroupId} rejected: Caption is empty.`);
    scheduleGroupDeletion(mediaGroupId);
    return;
  }

  if (!caption.includes('⭐️')) {
    await sendToAdmin(`❌ Media group ${mediaGroupId} rejected: No category (⭐️) found.`);
    scheduleGroupDeletion(mediaGroupId);
    return;
  }

  try {
    const parsed = parseChannelCaption(caption);

    if (!parsed.categoryName) {
      await sendToAdmin(`❌ Media group ${mediaGroupId} rejected: Missing category name.`);
      scheduleGroupDeletion(mediaGroupId);
      return;
    }

    // Check for duplicate product
    const existingProduct = await checkDuplicateProduct(parsed.name, parsed.categoryName);
    if (existingProduct) {
      console.log(`⚠️ Duplicate product found: ${parsed.name} in category ${parsed.categoryName}`);
      const duplicateMessage = `⚠️ Duplicate Product Attempt!\n\nName: ${parsed.name}\nCategory: ${parsed.categoryName}\n\nAlready exists as:\nSKU: ${existingProduct.sku}\nPrice: ${existingProduct.price} ETB`;
      // Send to admin only, not to channel
      await sendToAdmin(duplicateMessage);
      scheduleGroupDeletion(mediaGroupId);
      return;
    }

    const imageUrls: string[] = [];
    for (const photo of photos) {
      try {
        console.log(`☁️ Uploading photo ${photo.file_unique_id}...`);
        const url = await downloadTelegramPhoto(photo.file_id);
        if (url) {
          imageUrls.push(url);
          console.log(`✅ Uploaded: ${url}`);
        }
      } catch (err) {
        console.error(`Error uploading photo ${photo.file_id}:`, err);
      }
    }

    if (imageUrls.length === 0) {
      await sendToAdmin(`⚠️ Media group ${mediaGroupId}: No images could be uploaded. Product created without images.`);
    }

    const category = await getOrCreateCategory(parsed.categoryName);
    const latestProduct = await Product.findOne({}).sort({ createdAt: -1 });
    let nextSkuNum = 1;
    if (latestProduct && latestProduct.sku) {
      const match = latestProduct.sku.match(/PROD-(\d+)/);
      if (match) nextSkuNum = parseInt(match[1]) + 1;
    }
    const sku = `PROD-${String(nextSkuNum).padStart(4, '0')}`;
    const slug = parsed.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-') +
      '-prod-' +
      nextSkuNum;

    const product = new Product({
      name: parsed.name,
      categoryId: category._id,
      price: parsed.price,
      description: parsed.description || '',
      slug,
      sku,
      images: imageUrls,
    });

    await product.save();
    // Store the product ID in the pending group for late image addition
    pending.productId = product._id.toString();
    await TelegramLink.create({
      userId: 0,
      productId: product._id,
      telegramChatId: chatId,
      importMethod: 'channel_post',
    });

    const priceText = parsed.price === 0 ? 'Call for price' : `${parsed.price.toLocaleString()} ETB`;
    const successMessage =
      `✅ Product Added!\n\n` +
      `Name: ${parsed.name}\n` +
      `Price: ${priceText}\n` +
      `Category: ${parsed.categoryName}\n` +
      `Condition: ${parsed.condition}\n` +
      `SKU: ${sku}\n\n` +
      `Images: ${imageUrls.length} uploaded`;

    // Send to admin only (not to channel)
    await sendToAdmin(successMessage);
  } catch (error) {
    console.error(`Error processing media group ${mediaGroupId}:`, error);
    await sendToAdmin(`❌ Critical error processing album ${mediaGroupId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    scheduleGroupDeletion(mediaGroupId);
  }
}

function scheduleGroupDeletion(mediaGroupId: string) {
  const pending = pendingMediaGroups.get(mediaGroupId);
  if (!pending) return;

  if (pending.deletionTimer) clearTimeout(pending.deletionTimer);
  pending.deletionTimer = setTimeout(() => {
    if (pendingMediaGroups.has(mediaGroupId)) {
      pendingMediaGroups.delete(mediaGroupId);
      console.log(`🗑️ Deleted expired pending group ${mediaGroupId}`);
    }
  }, 240000); // Keep group in memory for 240 seconds after processing to catch late images
}

// ---------- The rest of your existing functions (unchanged) ----------
function parseChannelCaption(caption: string): ParsedProduct {
  const result: ParsedProduct = {
    name: '',
    categoryName: '',
    price: 0,
    condition: '',
    description: '',
  };

  const lines = caption.split('\n').map(line => line.trim());
  let currentCategory = '';
  let modelName = '';
  let priceValue = 0;
  let conditionValue = 'New'; // Default
  
  // Segment lists
  let preModelLines: string[] = [];
  let postPriceLines: string[] = [];
  
  let foundCategory = false;
  let foundModel = false;
  let foundPrice = false;
  let foundAddress = false;

  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;

    // Detect Address section - stop parsing relevant info here
    if (l.toLowerCase().includes('address') || l.startsWith('📍') || l.includes('☎️')) {
      // Check if this looks like a phone number line (usually starts with 09)
      if (l.match(/^09\d{2}/) || l.includes('☎️')) {
        foundAddress = true;
        continue;
      }
      if (l.toLowerCase().startsWith('address')) {
         foundAddress = true;
         continue;
      }
    }
    
    if (foundAddress) continue;
    if (l.toLowerCase().includes('inbox👉') || l.toLowerCase().includes('join 👉')) {
      foundAddress = true;
      continue;
    }

    // 1. Detect Category (⭐️)
    if (l.includes('⭐️')) {
      currentCategory = l.replace('⭐️', '').trim();
      foundCategory = true;
      continue;
    }

    // Skip "Available" lines
    if (l.toLowerCase().includes('available')) continue;

    // 2. Detect Model
    const modelMatch = l.match(/^✅?\s*model\s*:\s*(.*)/i);
    if (modelMatch) {
      modelName = modelMatch[1].trim();
      foundModel = true;
      continue;
    }

    // 3. Detect Condition
    const conditionMatch = l.match(/^✅?\s*condition\s*:\s*(.*)/i);
    if (conditionMatch) {
      conditionValue = conditionMatch[1].trim();
      continue;
    }

    // 4. Detect Price
    const priceMatch = l.match(/^✅?\s*price\s*:\s*(.*)/i);
    if (priceMatch) {
      const pStr = priceMatch[1].trim();
      if (pStr.includes('☎️')) {
        priceValue = 0;
      } else {
        const cleanPrice = pStr.replace(/[^0-9]/g, '');
        priceValue = parseInt(cleanPrice) || 0;
      }
      foundPrice = true;
      continue;
    }

    // 5. Collect potential description lines
    // Pre-model (between category and model)
    if (foundCategory && !foundModel && !foundPrice) {
      preModelLines.push(l);
    } 
    // Post-price (between price and address)
    else if (foundPrice && !foundAddress) {
      postPriceLines.push(l);
    }
  }

  // Fallback: If no model found, use category name as product name
  result.name = modelName || currentCategory;
  result.categoryName = currentCategory;
  result.price = priceValue;
  result.condition = conditionValue;

  // Process and combine descriptions
  const cleanLine = (str: string) => str.replace(/^[👉\s\-\*•]+/, '').trim();
  
  const processGroup = (group: string[]) => {
    if (group.length === 0) return '';
    // If all lines are short bullet points, join with comma
    if (group.every(line => line.length < 30)) {
      return group.map(cleanLine).join(', ');
    }
    // Otherwise keep newlines but clean prefixes
    return group.map(cleanLine).join('\n');
  };

  const desc1 = processGroup(preModelLines);
  const desc2 = processGroup(postPriceLines);

  result.description = [desc1, desc2].filter(Boolean).join('\n\n');
  
  console.log('🔍 Parsed product:', result);
  return result;
}

async function handleAddProduct(chatId: number, userId: number, firstName: string) {
  const user = await User.findOne({ telegramId: userId });
  if (!user || user.role !== 'admin') {
    await sendMessage(chatId, 'Sorry, only store admins can add products. 🔐');
    return;
  }
  await sendMessage(
    chatId,
    `Please send product details in this format:\n\n` +
    `Product: [Name]\nCategory: [Category]\nPrice: [Price]\nDescription: [Description]\nImage URL: [URL]\nAudio Demo URL: [URL]\n\nExample:\nProduct: Grand Piano\nCategory: Pianos\nPrice: 299.99\nDescription: Professional 88-key weighted piano\nImage URL: https://example.com/piano.jpg\nAudio Demo URL: https://example.com/piano-demo.mp3`
  );
}

async function handleTelegramPhoto(photo: any[]): Promise<string> {
  try {
    const fileId = photo[photo.length - 1].file_id;
    return `telegram_file_id:${fileId}`;
  } catch (error) {
    console.error('Photo processing error:', error);
    return '';
  }
}

async function handleProductSubmission(
  chatId: number,
  text: string,
  userId: number,
  providedImageUrl?: string
) {
  try {
    const lines = text.split('\n');
    const productData: Record<string, string> = {};
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      productData[key.trim()] = valueParts.join(':').trim();
    });

    const requiredFields = ['Product', 'Category', 'Price', 'Description'];
    const missingFields = requiredFields.filter(field => !productData[field]);
    if (missingFields.length > 0) {
      await sendMessage(chatId, `Missing fields: ${missingFields.join(', ')}. Please provide all required information.`);
      return;
    }

    const imageUrl = providedImageUrl || productData['Image URL'];
    const product = new Product({
      name: productData['Product'],
      category: productData['Category'],
      price: parseFloat(productData['Price']),
      description: productData['Description'],
      images: imageUrl ? [{ url: imageUrl }] : [],
      audioDemo: productData['Audio Demo URL'] || undefined,
      createdBy: userId,
    });
    await product.save();
    await TelegramLink.create({ userId, productId: product._id, telegramChatId: chatId, importMethod: 'bot_command' });
    await sendMessage(chatId, `✅ Product "${productData['Product']}" has been added to the store!\n\nPrice: $${productData['Price']}`);
  } catch (error) {
    console.error('Product submission error:', error);
    await sendMessage(chatId, '❌ Error adding product. Please check the format and try again.');
  }
}

async function handleListProducts(chatId: number) {
  try {
    const products = await Product.find().limit(5);
    if (products.length === 0) {
      await sendMessage(chatId, 'No products available yet. 🎵');
      return;
    }
    let message = `Current Products:\n\n`;
    products.forEach((product, index) => {
      message += `${index + 1}. ${product.name}\n   Price: $${product.price}\n\n`;
    });
    message += `Visit our store for more details: ${process.env.STORE_URL || 'https://honestore.com'}`;
    await sendMessage(chatId, message);
  } catch (error) {
    console.error('List products error:', error);
    await sendMessage(chatId, 'Error fetching products. Please try again later.');
  }
}

export async function sendMessage(chatId: number, text: string) {
  try {
    await axios.post(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

export async function sendToAdmin(text: string) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId || adminChatId === 'your_chat_id_here') {
    console.log('⚠️ ADMIN_CHAT_ID not configured, message not sent:', text);
    return;
  }
  try {
    await axios.post(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: adminChatId,
      text,
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.error('Error sending to admin:', error);
  }
}

export async function setWebhook(req: Request, res: Response) {
  try {
    const baseUrl = process.env.API_PUBLIC_URL || process.env.API_URL || 'https://your-production-url.com';
    const webhookUrl = `${baseUrl}/api/telegram/webhook`;
    const response = await axios.post(`${TELEGRAM_API}/bot${BOT_TOKEN}/setWebhook`, { url: webhookUrl });
    res.json({ success: true, message: 'Webhook set successfully', url: webhookUrl, response: response.data });
  } catch (error) {
    console.error('Set webhook error:', error);
    res.status(500).json({ success: false, error: 'Failed to set webhook' });
  }
}

export async function setOrderWebhook(req: Request, res: Response) {
  try {
    const orderBotToken = process.env.TELEGRAM_ORDER_BOT_TOKEN;
    if (!orderBotToken) {
      return res.status(400).json({ success: false, error: 'TELEGRAM_ORDER_BOT_TOKEN is not configured' });
    }
    const baseUrl = process.env.API_PUBLIC_URL || process.env.API_URL || 'https://your-production-url.com';
    const webhookUrl = `${baseUrl}/api/telegram/order-webhook`;
    const response = await axios.post(`${TELEGRAM_API}/bot${orderBotToken}/setWebhook`, { url: webhookUrl });
    res.json({ success: true, message: 'Order Webhook set successfully', url: webhookUrl, response: response.data });
  } catch (error) {
    console.error('Set order webhook error:', error);
    res.status(500).json({ success: false, error: 'Failed to set order webhook' });
  }
}

export async function handleOrderWebhook(req: Request, res: Response) {
  try {
    const update: TelegramUpdate = req.body;
    
    if (update.message) {
      const { message } = update;
      const chatId = message.chat.id;
      const text = message.text || '';
      const orderBotToken = process.env.TELEGRAM_ORDER_BOT_TOKEN;

      if (!orderBotToken) {
        return res.json({ ok: true });
      }

      if (text === '/start') {
        try {
          const STORE_URL = process.env.STORE_URL || process.env.FRONTEND_URL || 'https://hone-instrument-store-frontend.vercel.app/';
          await axios.post(`${TELEGRAM_API}/bot${orderBotToken}/sendMessage`, {
            chat_id: chatId,
            text: 'welcome to Hone Order Bot , this is where your order appears and to complete the order go to the website. Hone Order Bot is for tracking purposes only',
            parse_mode: 'HTML',
            reply_markup: {
              keyboard: [
                [
                  { text: '🌐 Visit Website', web_app: { url: STORE_URL } }
                ]
              ],
              resize_keyboard: true,
              is_persistent: true
            }
          });
        } catch (err) {
          console.error('Error sending order bot welcome message:', err);
        }
      }
    }
    res.json({ ok: true });
  } catch (error) {
    console.error('Order webhook processing error:', error);
    res.status(500).json({ ok: false, error: 'Webhook processing failed' });
  }
}

export async function linkTelegramAccount(req: AuthRequest, res: Response) {
  try {
    const { telegramId, telegramUsername } = req.body;
    const userId = req.userId;
    const telegramLink = await TelegramLink.findOneAndUpdate(
      { userId, telegramId },
      { userId, telegramId, telegramUsername, linkedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: telegramLink });
  } catch (error) {
    console.error('Link Telegram error:', error);
    res.status(500).json({ success: false, error: 'Failed to link Telegram account' });
  }
}