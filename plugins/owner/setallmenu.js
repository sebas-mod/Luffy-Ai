import { getAssetBuffer } from "../../src/lib/ourin-asset-manager.js";
import config from "../../config.js";
const pluginConfig = {
  name: "setallmenu",
  alias: ["allmenuvariant", "allmenustyle"],
  category: "owner",
  description: "Configura la variante visual de allmenu",
  usage: ".setallmenu <v1-v5>",
  example: ".setallmenu v2",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const VARIANTS = {
  v1: {
    id: 1,
    name: "ALLMENU BASIC",
    desc: "esto mengikuti de setreply",
    emoji: "📝",
  },
  v2: {
    id: 2,
    name: "ALLMENU PREMIUM",
    desc: "",
    emoji: "🖼️",
  },
  v5: {
    id: 5,
    name: "ALLMENU NATIVEFLOW",
    desc: "Aspecto de flujo nativo premium con video y clima",
    emoji: "✨",
  },
  v6: {
    id: 6,
    name: "ALLMENU LOCATION",
    desc: "Aspecto de mensaje de ubicación sin botones interactivos",
    emoji: "📍",
  },
};

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();

  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(`❌ *VARIANT TIDAK VALID*\n\nUsa: *v1*, *v2*, *v5*, o *v6*`);
      return;
    }

    db.setting("allmenuVariant", selected.id);
    await db.save();

    await m.reply(
      `✅ *ALLMENU VARIANT DIUBAH*\n\n` +
      `${selected.emoji} *V${selected.id} — ${selected.name}*\n` +
      `_${selected.desc}_`,
    );
    return;
  }

  const current =
    db.setting("allmenuVariant") || config.ui?.allmenuVariant || 2;

  const rows = [];
  for (const [key, val] of Object.entries(VARIANTS)) {
    const mark = val.id === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} ${key.toUpperCase()}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}setallmenu ${key}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "📋 Pilih Variant Allmenu",
        sections: [{ title: "Lista Variant Allmenu", rows }],
      }),
    },
  ];

  const bodyText =
    `📋📑 *ALLMENU VARIANT*\n\n` +
    `Configura el aspecto del allmenu que muestra toda la lista de comandos del bot en una sola página 📖✨\n` +
    `Variant activo actualmente: *V${current} — ${VARIANTS[`v${current}`]?.name || "Unknown"}* 🎯\n\n` +
    `*PENJELASAN VARIANT:*\n\n` +
    `- *V1 Simple Text* 📝 — Lista comando mostrado como texto simple sin imagen o contextInfo, más ligero y rápido de cargar\n\n` +
    `- *V2 Image + Context* 🖼️ — Imagen header allmenu + full contextInfo con label forwarded newsletter, tampilan standar yang informatif\n\n` +
    `- *V3 Document* 📄 — Allmenu se envía como archivo documento con miniatura personal y respuesta verificada, se ve como un archivo oficial\n\n` +
    `- *V4 Interactive Button* 🔘 — Mensaje interactivo con botón single_select para elegir categoría y quick_reply para navegación, diseño moderno\n\n` +
    `- *V5 NativeFlow* ✨ — Mensaje NativeFlow con insignia de oferta limitada y botones interactivos, el diseño más premium y llamativo\n\n` +
    `> Pilih variant allmenu de tombol di bawah 👇`;

  await sock.sendButton(
    m.chat,
    getAssetBuffer("ourin"),
    bodyText,
    m,
    { buttons },
  );
}

export { pluginConfig as config, handler };
