import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js";
import fs from "fs";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/luffy-database.js";
const pluginConfig = {
  name: "configurar_menu",
  alias: ["menuvariant", "menustyle"],
  category: "owner",
  description: "Configurar la variante de visualización del menú",
  usage: ".setmenu <v1-v16>",
  example: ".setmenu v8",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

const VARIANTS = {
  v1: {
    id: 1,
    name: "BASIC",
    desc: "",
    emoji: "🖼️",
  },
  v2: {
    id: 2,
    name: "PREMIUM",
    desc: "",
    emoji: "✅",
  },
  v3: {
    id: 3,
    name: "PREMIUM",
    desc: "",
    emoji: "✅",
  },
  v4: {
    id: 4,
    name: "LV",
    desc: "",
    emoji: "✅",
  },
  v5: {
    id: 5,
    name: "LV 2",
    desc: "",
    emoji: "✅",
  },
  v6: {
    id: 6,
    name: "LOCATION",
    desc: "Mensaje de ubicación con botones",
    emoji: "📍",
  },
  v7: {
    id: 7,
    name: "RA NGERTI",
    desc: "Mensaje de ubicación con botones",
    emoji: "📍",
  },
  v8: {
    id: 8,
    name: "THUMBNAIL",
    desc: "Imagen miniatura",
    emoji: "📍",
  },
};

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();
  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(`❌ *VARIANTE NO VÁLIDA*\n\nUsa: *v1* hasta *v7*`);
      return;
    }
    db.setting("menuVariant", selected.id);
    await db.save();
    await m.reply(
      `✅ *VARIANTE DE MENÚ CAMBIADA*\n\n` +
      `${selected.emoji} *V${selected.id} — ${selected.name}*\n` +
      `_${selected.desc}_`,
    );
    return;
  }

  const current = db.setting("menuVariant") || config.ui?.menuVariant || 2;

  const rows = [];
  for (const [key, val] of Object.entries(VARIANTS)) {
    const mark = val.id === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} ${key.toUpperCase()}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}configurar_menu ${key}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "🎨 Elegir Variante de Menú",
        sections: [{ title: "Lista de Variantes de Menú", rows }],
      }),
    },
  ];

  const bodyText =
    `🎨🖼️ *VARIANTE DE MENÚ*\n\n` +
    `Configura la visualización del menú principal del bot cuando el usuario escribe el comando menu 📋✨\n` +
    `Variante activa actualmente: *V${current} — ${VARIANTS[`v${current}`]?.name || "Desconocida"}* 🎯\n\n` +
    `> Elige la variante del menú con el botón de abajo 👇`;

  await sock.sendButton(
    m.chat,
    getAssetBuffer("luffy"),
    bodyText,
    m,
    { buttons },
  );
}

export { pluginConfig as config, handler };
