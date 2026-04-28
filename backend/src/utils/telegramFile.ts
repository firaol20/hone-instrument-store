import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';

const TELEGRAM_API = 'https://api.telegram.org';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function downloadFromTelegram(fileId: string): Promise<Buffer> {
  console.log('🔍 downloadFromTelegram called with fileId:', fileId);
  try {
    const response = await axios.get(`${TELEGRAM_API}/bot${BOT_TOKEN}/getFile`, {
      params: { file_id: fileId },
    });

    console.log('📡 getFile response:', response.data);

    if (!response.data.ok) {
      throw new Error('Failed to get file from Telegram');
    }

    const { file_path } = response.data.result;
    console.log('📁 file_path:', file_path);
    
    const fileUrl = `${TELEGRAM_API}/file/bot${BOT_TOKEN}/${file_path}`;
    console.log('🌐 Downloading from:', fileUrl);

    const fileResponse = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
    });

    console.log('📥 Downloaded bytes:', fileResponse.data.length);
    return Buffer.from(fileResponse.data);
  } catch (error: any) {
    console.error('❌ Error downloading from Telegram:', error.message || error);
    throw error;
  }
}

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<string> {
  console.log('☁️ uploadToCloudinary called, buffer size:', buffer.length, 'folder:', folder);
  try {
    const base64 = buffer.toString('base64');
    const mimeType = getMimeType(buffer);
    const dataUri = `data:${mimeType};base64,${base64}`;
    console.log('📝 Uploading with mimeType:', mimeType, 'base64 length:', base64.length);

    const uploadOptions: any = {
      folder: `hone_store/${folder}`,
      resource_type: 'image',
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);
    console.log('✅ Cloudinary upload result:', result.secure_url);
    return result.secure_url;
  } catch (error: any) {
    console.error('❌ Error uploading to Cloudinary:', error.message || error);
    throw error;
  }
}

export async function uploadMultipleToCloudinary(
  buffers: Buffer[],
  folder: string
): Promise<string[]> {
  const urls: string[] = [];

  for (const buffer of buffers) {
    const url = await uploadToCloudinary(buffer, folder);
    urls.push(url);
  }

  return urls;
}

function getMimeType(buffer: Buffer): string {
  const header = buffer.slice(0, 4).toString('hex');

  if (header.startsWith('89504e47')) return 'image/png';
  if (header.startsWith('ffd8ff')) return 'image/jpeg';
  if (header.startsWith('ffd9')) return 'image/jpeg';

  return 'image/jpeg';
}

export async function downloadTelegramPhoto(fileId: string): Promise<string> {
  console.log('📥 downloadTelegramPhoto called with fileId:', fileId);
  try {
    const buffer = await downloadFromTelegram(fileId);
    console.log('📦 Buffer received, size:', buffer.length);
    
    if (buffer.length === 0) {
      console.error('❌ Buffer is empty!');
      return '';
    }
    
    const url = await uploadToCloudinary(buffer, 'telegram_products');
    console.log('☁️ Uploaded to Cloudinary:', url);
    return url;
  } catch (error) {
    console.error('❌ Error in downloadTelegramPhoto:', error);
    return '';
  }
}