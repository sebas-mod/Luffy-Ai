import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js";
import * as _canvas from '@napi-rs/canvas'
import axios from "axios";
import path from "path";
import fs from "fs";


import { uploadTo0x0 } from "../../src/lib/luffy-tmpfiles.js";
import te from "../../src/lib/luffy-error.js";
const pluginConfig = {
  name: "fakeml",
  alias: ["mlbbfake", "mlcard", "mlfake"],
  category: "canvas",
  description: "Crea una tarjeta de perfil fake de ML",
  usage: ".fakeml <nombre> (responde/envía foto)",
  example: ".fakeml Misaki",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};
let fontRegistered = false;
async function handler(m, { sock }) {
  const name = m.text?.trim();
  if (!name) {
    return m.reply(
      `🎮 *ᴘᴇʀꜰɪʟ ꜰᴀᴋᴇ ᴅᴇ ᴍʟ*\n\n` +
        `> Ingresa el nombre para el perfil\n\n` +
        `*ᴄᴏᴍᴏ ᴜꜱᴀʀʟᴏ:*\n` +
        `> 1. Envía foto + caption \`${m.prefix}fakeml <nombre>\`\n` +
        `> 2. Responde una foto con \`${m.prefix}fakeml <nombre>\``,
    );
  }
  let buffer = null;
  if (
    m.quoted &&
    (m.quoted.type === "imageMessage" || m.quoted.mtype === "imageMessage")
  ) {
    try {
      buffer = await m.quoted.download();
    } catch (e) {
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  } else if (m.isMedia && m.type === "imageMessage") {
    try {
      buffer = await m.download();
    } catch (e) {
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  } else {
    try {
      let te = await sock.profilePictureUrl(m.sender, "image");
      buffer = Buffer.from(
        (await axios.get(te, { responseType: "arraybuffer" })).data,
      );
    } catch (error) {
      buffer = getAssetBuffer("pp-kosong");
    }
  }
  if (!buffer) {
    return m.reply(`❌ ¡Envía/responde una imagen para usarla como avatar!`);
  }
  m.react("🕕");
  try {
    const gmbr = await uploadTo0x0(buffer, {
      filename: "image.jpg",
      contentType: "image/jpeg",
    });
    await sock.sendMedia(
      m.chat,
      `https://api.nexray.web.id/maker/fakelobyml?avatar=${encodeURIComponent(gmbr.directUrl)}&nickname=${encodeURIComponent(name)}`,
      null,
      m,
      {
        type: "image",
      },
    );
    m.react("✅");
  } catch (error) {
    m.react("❌");
    m.reply(`Inténtalo de nuevo`);
  }
}
export { pluginConfig as config, handler };
