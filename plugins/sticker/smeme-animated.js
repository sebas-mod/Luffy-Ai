import axios from 'axios';
import config from '../../config.js';
import te from '../../src/lib/luffy-error.js';
import { uploadImage } from '../../src/lib/luffy-uploader.js';
import { downloadMediaMessage, getContentType } from 'ourin';

const pluginConfig = {
  name: 'smeme-animated',
  alias: ['smeme-animated', 'smemevid'],
  category: 'sticker',
  description: 'Crea sticker meme animado',
  usage: '.smeme-animated <texto_superior>|<texto_inferior>',
  example: '.smeme-animated arriba|abajo (respondiendo una imagen)',
  cooldown: 5,
  carne: 2,
};

async function handler(m, { sock }) {
  const text = m.text?.trim();
  
  if (!text) {
    return m.reply(`⚠️ ¡Ingresa el texto superior e inferior!\nEjemplo: \`${m.prefix}${m.command} arriba|abajo\``);
  }

  const parts = text.split('|');
  const top = parts[0]?.trim() || '';
  const bottom = parts[1]?.trim() || '';

  const msg = m.message;
  const isQuotedImage = m.quoted && (getContentType(m.quoted.message) === 'imageMessage' || m.quoted.mtype === 'imageMessage');
  const isImage = getContentType(msg) === 'imageMessage' || m.mtype === 'imageMessage';

  if (!isImage && !isQuotedImage) {
    return m.reply(`⚠️ Envía o responde una imagen con el caption \`${m.prefix}${m.command} texto_superior|texto_inferior\``);
  }

  await m.react('🕕');

  try {
    const targetMsg = isQuotedImage ? m.quoted : m;
    const buffer = await downloadMediaMessage(
      targetMsg,
      'buffer',
      {},
      { logger: console }
    );

    const imageUrl = await uploadImage(buffer);
    
    const apiUrl = `https://api.neoxr.eu/api/memegenvid?image=${encodeURIComponent(imageUrl)}&top=${encodeURIComponent(top)}&bottom=${encodeURIComponent(bottom)}&apikey=${config.APIkey.neoxr}`;
    
    const response = await axios.get(apiUrl);
    if (!response.data.status || !response.data.data?.url) {
      return m.reply('❌ No se pudo crear el meme, posiblemente la API tenga problemas.');
    }

    const stickerUrl = response.data.data.url;
    const stickerBuffer = await axios.get(stickerUrl, { responseType: 'arraybuffer' }).then(res => res.data);

    await sock.sendImageAsSticker(m.chat, stickerBuffer, m, {
        packname: config.sticker.packname,
        author: config.sticker.author
    });

    await m.react('✅');
  } catch (error) {
    await m.react('☢');
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
