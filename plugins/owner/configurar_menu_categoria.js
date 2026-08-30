import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "configurar_menu_categoria",
  alias: ["menucatvariant", "menucatstyle"],
  category: "owner",
  description: "Configurar la variante de visualización de menucat",
  usage: ".setmenucat <v1-v2, v5>",
  example: ".setmenucat v2",
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
    name: "Plain Text",
    desc: "Visualización de texto simple sin medios, ideal para conexiones lentas o dispositivos que no soportan mensajes interactivos",
    emoji: "📝",
  },
  v2: {
    id: 2,
    name: "Interactive + Image Header",
    desc: "Visualización premium con imagen de cabecera, limited time offer y botones de navegación interactivos",
    emoji: "🖼️",
  },
  v5: {
    id: 5,
    name: "MENUCAT NATIVEFLOW",
    desc: "Visualización nativa flow premium con video y clima",
    emoji: "✨",
  },
  v6: {
    id: 6,
    name: "MENUCAT LOCATION",
    desc: "Visualización con mensaje de ubicación sin botones interactivos",
    emoji: "📍",
  },
};

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();

  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(`👑•─────•👑\n❌ *VARIANTE NO VÁLIDA*\n\nUsa: *v1*, *v2*, *v5* o *v6*\n♰ ──────── ♱✦`);
      return;
    }

    db.setting("menucatVariant", selected.id);
    await db.save();

    await m.reply(
      `✅ *VARIANTE DE MENUCAT CAMBIADA*\n\n` +
        `${selected.emoji} *V${selected.id} — ${selected.name}*\n` +
        `${selected.desc}`,
    );
    return;
  }

  const current =
    db.setting("menucatVariant") || config.ui?.menucatVariant || 2;

  const rows = [];
  for (const [key, val] of Object.entries(VARIANTS)) {
    const mark = val.id === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} ${key.toUpperCase()}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}configurar_menu_categoria ${key}`,
    });
  }

  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "📂 Elegir Variante de Menucat",
        sections: [{ title: "Lista de Variantes de Menucat", rows }],
      }),
    },
  ];

  const bodyText =
    `📂🗂️ *VARIANTE DE MENUCAT*\n\n` +
    `Configura el menú por categorías cuando el usuario elige una categoría del menú principal 📋✨\n` +
    `Variante activa actualmente: *V${current} — ${VARIANTS[`v${current}`]?.name || "Desconocida"}* 🎯\n\n` +
    `> Elige la variante de menucat con el botón de abajo 👇`;

  await sock.sendButton(
    m.chat,
    getAssetBuffer("luffy"),
    bodyText,
    m,
    { buttons },
  );
}

export { pluginConfig as config, handler };
