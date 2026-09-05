import axios from 'axios';
import config from '../../config.js';
import te from '../../src/lib/luffy-error.js';

const pluginConfig = {
  name: 'attp2',
  alias: [],
  category: 'sticker',
  description: 'Crea sticker de texto animado',
  usage: '.attp2 <texto>',
  example: '.attp2 Hola mundo',
  cooldown: 5,
  carne: 2,
};

async function handler(m, { sock }) {
  const text = m.text?.trim() || m.quoted?.text?.trim();

  if (!text) {
    return m.reply(`♰ ┄ ── ☽◯☾ ── ┄ ♰\n⚠️ ¡Ingresa el texto!\n☽◯☾ ♰ Ejemplo: \`${m.prefix}${m.command} Hola a todos\``);
  }

  await m.react('🕕');

  try {
    const colors = encodeURIComponent(JSON.stringify(["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF"]));
    const apiUrl = `https://api.neoxr.eu/api/attp2?text=${encodeURIComponent(text)}&color=${colors}&apikey=${config.APIkey.neoxr}`;

    const response = await axios.get(apiUrl);
    if (!response.data.status || !response.data.data?.url) {
      return m.reply('♰ ┄ ── ☽◯☾ ── ┄ ♰\n❌ No se pudo crear el sticker, posiblemente el límite de la API se agotó.');
    }

    const stickerUrl = response.data.data.url;
    const stickerBuffer = await axios.get(stickerUrl, { responseType: 'arraybuffer' }).then(res => res.data);

    await sock.sendVideoAsSticker(m.chat, stickerBuffer, m, {
      packname: config.sticker.packname,
      author: config.sticker.author
    });

    await m.react('✅');
  } catch (error) {
    console.log(error)
    await m.react('☢');
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
