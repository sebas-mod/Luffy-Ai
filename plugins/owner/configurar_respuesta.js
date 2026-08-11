import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js";
import fs from "fs";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/luffy-database.js";
const pluginConfig = {
  name: "configurar_respuesta",
  alias: ["replyvariant", "replystyle"],
  category: "owner",
  description: "Configurar la variante de visualización de la respuesta",
  usage: ".setreply <v1-v11>",
  example: ".setreply v5",
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
    emoji: "✨",
  },
  v2: {
    id: 2,
    name: "PREMIUM",
    desc: "",
    emoji: "🖼️",
  },
  v3: {
    id: 3,
    name: "TITANIUM",
    desc: "",
    emoji: "📨",
  },
  v4: {
    id: 4,
    name: "LV",
    desc: "",
    emoji: "💼",
  },
  v5: {
    id: 5,
    name: "FAKE ORDER",
    desc: "Texto con fake quoted de mensaje de pedido",
    emoji: "🛒",
  },
  v6: {
    id: 6,
    name: "SIMPLE DOCUMENT",
    desc: "Como V2 pero sin fake contact quote (quoted original)",
    emoji: "📄",
  },
  v7: {
    id: 7,
    name: "FAKE LOCATION",
    desc: "Texto con fake quoted de mensaje de ubicación",
    emoji: "📍",
  },
  v8: {
    id: 8,
    name: "FAKE SIGNUP",
    desc: "Texto con fake quoted de mensaje de registro",
    emoji: "🥠",
  },
  v9: {
    id: 9,
    name: "FAKE ORDER",
    desc: "Texto con fake quoted de mensaje de pedido (no recomendado)",
    emoji: "🍙",
  },
  v10: {
    id: 10,
    name: "FACTURA / PAGO",
    desc: "Visualización de recibo de pago (Payment Request)",
    emoji: "💳",
  },
  v11: {
    id: 11,
    name: "PREVIEW",
    desc: "Vista previa de enlace",
    emoji: "🌀",
  },
};

async function handler(m, { sock, db }) {
  const variant = m.text

  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(`❌ *VARIANTE NO VÁLIDA*\n\nUsa: *v1* hasta *v11*`);
      return;
    }

    db.setting("replyVariant", selected.id);
    await db.save();
    await m.reply(
      `✅ *VARIANTE DE RESPUESTA CAMBIADA*\n\n` +
      `${selected.emoji} *V${selected.id} — ${selected.name}*\n` +
      `_${selected.desc}_`,
    );
    return;
  }

  const current = db.setting("replyVariant") || config.ui?.replyVariant || 1;

  const rows = [];
  for (const [key, val] of Object.entries(VARIANTS)) {
    const mark = val.id === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} ${key.toUpperCase()}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}configurar_respuesta ${key}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "💬 Elegir Variante de Respuesta",
        sections: [{ title: "Lista de Variantes de Respuesta", rows }],
      }),
    },
  ];

  const bodys =
    `💬📨 *VARIANTE DE RESPUESTA*\n\n` +
    `Configura la visualización de la respuesta del bot al contestar los mensajes de los usuarios 💬✨\n` +
    `Variante activa actualmente: *V${current} — ${VARIANTS[`v${current}`]?.name || "Desconocida"}* 🎯\n\n`

  await sock.sendButton(
    m.chat,
    getAssetBuffer("luffy"),
    bodys,
    m,
    { buttons },
  );
}

export { pluginConfig as config, handler };
