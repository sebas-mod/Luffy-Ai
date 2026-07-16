import { getAssetBuffer } from "../../src/lib/ourin-asset-manager.js";
import fs from "fs";
import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";
import ourinApi from "../../src/lib/ourin-apimanager.js";
const pluginConfig = {
  name: "brat",
  alias: ["bratmenu", "bratimg", "brattext"],
  category: "sticker",
  description: "Menú de variantes brat y generador de stickers brat",
  usage: ".brat | .bratimg <texto>",
  example: ".bratimg Hola a todos",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const BRAT_VARIANTS = [
  {
    title: "Brat Default",
    description: "Sticker brat versión estándar",
    command: "bratimg",
  },
  {
    title: "Brat Green",
    description: "Variante brat verde",
    command: "bratgreen",
  },
  {
    title: "Brat Cewek",
    description: "Variante brat girl",
    command: "bratcewek",
  },
  {
    title: "Brat Vermeil",
    description: "Variante brat Vermeil",
    command: "bratvermeil",
  },
  { title: "Brat HD", description: "Variante brat HD", command: "brathd" },
  {
    title: "Brat Video",
    description: "Sticker brat animado",
    command: "bratvid",
  },
  {
    title: "Brat Video V2",
    description: "Sticker brat video v2",
    command: "bratvid2",
  },
  {
    title: "Brat Vermeil Video",
    description: "Variante brat Vermeil video",
    command: "bratvermeilvid",
  },
  {
    title: "Brat Gojo",
    description: "Variante brat Gojo",
    command: "bratgojo",
  },
  {
    title: "Brat Gojo Video",
    description: "Variante brat Gojo video",
    command: "bratgojovid",
  },
];

function buildVariantRows(prefix, text) {
  return BRAT_VARIANTS.map((item) => ({
    title: item.title,
    description: `${item.description} • .${item.command} <text>`,
    id: `${prefix}${item.command} ${text}`,
  }));
}

async function sendBratMenu(m, sock, text) {
  const caption =
    "🌿 *¿Quieres crear un brat? Elige la variante con el botón de abajo*";
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "🌾 Elegir Variante Brat",
        sections: [
          {
            title: "Variante Brat",
            rows: buildVariantRows(m.prefix, text),
          },
        ],
      }),
    },
  ];

  await sock.sendButton(
    m.chat,
    getAssetBuffer("ourin"),
    caption,
    m,
    {
      buttons,
      footer: "Elige tu variante brat favorita",
    },
  );
}

async function handler(m, { sock }) {
  const text = m.text;
  const command = String(m.command || "").toLowerCase();

  if (command === "brat") {
    await sendBratMenu(m, sock, text);
    return;
  }

  if (!text) {
    return m.reply(
      `🖼️ *ʙʀᴀᴛ ɪᴍᴀɢᴇ*\n\n> Ingresa el texto\n\n\`Ejemplo: ${m.prefix}bratimg Hola a todos\``,
    );
  }

  m.react("🕕");

  try {
    const url = ourinApi.yupra.url("/api/image/brat", { text });
    await sock.sendImageAsSticker(m.chat, url, m, {
      packname: config.sticker.packname,
      author: config.sticker.author,
    });

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
