import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js";
import config from "../../config.js";
const pluginConfig = {
  name: "configurar_menu_todo",
  alias: ["allmenuvariant", "allmenustyle"],
  category: "owner",
  description: "Configurar la variante de visualización de allmenu",
  usage: ".configurar_menu_todo <v1-v5>",
  example: ".configurar_menu_todo v2",
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
    name: "ALLMENU BASIC",
    desc: "sigue el estilo de setreply",
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
    desc: "Visualización nativa flow premium con video y clima",
    emoji: "✨",
  },
  v6: {
    id: 6,
    name: "ALLMENU LOCATION",
    desc: "Visualización con mensaje de ubicación sin botones interactivos",
    emoji: "📍",
  },
  v9: {
    id: 9,
    name: "ALLMENU GOTHIC",
    desc: "Estilo semi-gótico, imagen cabecera, sin botones",
    emoji: "⛧",
  },
};

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();

  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(`👑•─────•👑\n❌ *VARIANTE NO VÁLIDA*\n\nUsa: *v1*, *v2*, *v5*, *v6* o *v9*\n✦────────✦`);
      return;
    }

    db.setting("allmenuVariant", selected.id);
    await db.save();

    await m.reply(
      `✅ *VARIANTE DE ALLMENU CAMBIADA*\n\n` +
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
      id: `${m.prefix}configurar_menu_todo ${key}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "📋 Elegir Variante de Allmenu",
        sections: [{ title: "Lista de Variantes de Allmenu", rows }],
      }),
    },
  ];

  const bodyText =
    `📋📑 *VARIANTE DE ALLMENU*\n\n` +
    `Configura la visualización del allmenu que muestra toda la lista de comandos del bot en una sola página 📖✨\n` +
    `Variante activa actualmente: *V${current} — ${VARIANTS[`v${current}`]?.name || "Desconocida"}* 🎯\n\n` +
    `*EXPLICACIÓN DE LAS VARIANTES:*\n\n` +
    `- *V1 Texto Simple* 📝 — La lista de comandos se muestra como texto plano sin imagen ni contextInfo, la más ligera y rápida de cargar\n\n` +
    `- *V2 Imagen + Contexto* 🖼️ — Imagen de cabecera del allmenu + contextInfo completo con etiqueta de newsletter reenviada, visualización estándar e informativa\n\n` +
    `- *V3 Documento* 📄 — El allmenu se envía como archivo de documento con miniatura pequeña y respuesta citada verificada, parece un archivo oficial\n\n` +
    `- *V4 Botón Interactivo* 🔘 — Mensaje interactivo con botón single_select para elegir categoría y quick_reply para navegar, visualización moderna\n\n` +
    `- *V5 NativeFlow* ✨ — Mensaje NativeFlow con insignia limited_time_offer y botones interactivos, la visualización más premium y llamativa\n\n` +
    `> Elige la variante del allmenu con el botón de abajo 👇`;

  await sock.sendButton(
    m.chat,
    getAssetBuffer("luffy"),
    bodyText,
    m,
    { buttons },
  );
}

export { pluginConfig as config, handler };
