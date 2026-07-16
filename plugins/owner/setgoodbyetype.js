import { getAssetBuffer } from "../../src/lib/ourin-asset-manager.js";
import fs from "fs";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "setgoodbyetype",
  alias: ["goodbyetype", "goodbyevariant", "goodbyestyle"],
  category: "owner",
  description: "Configura la variante visual del mensaje de despedida",
  usage: ".setgoodbyetype",
  example: ".setgoodbyetype",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};
const VARIANTS = {
  1: {
    name: "Canvas Image",
    desc: "Imagen canvas con foto profil",
    emoji: "🎨",
  },
  2: {
    name: "Carousel Cards",
    desc: "Tarjetas de carrusel interactivo con botones",
    emoji: "🃏",
  },
  3: {
    name: "Text Only",
    desc: "Mensaje de texto minimalista sin imagen",
    emoji: "📝",
  },
  4: { name: "Group", desc: "ContextInfo group style", emoji: "👥" },
  5: { name: "Simple", desc: "Mensaje de texto simple + foto de perfil", emoji: "✨" },
  6: { name: "Video", desc: "Envía video ucapan adiós", emoji: "🎥" },
  7: { name: "Interactive Quoted", desc: "Mensaje interactivo con faa quoted", emoji: "💬" },
};
async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();
  const current = db.setting("goodbyeType") || 1;
  if (variant && /^v?[1-7]$/.test(variant)) {
    const id = parseInt(variant.replace("v", ""));
    db.setting("goodbyeType", id);
    await db.save();
    await m.reply(
      `✅ *GOODBYE TYPE DIUBAH*\n\n` +
        `${VARIANTS[id].emoji} *V${id} — ${VARIANTS[id].name}*\n` +
        `_${VARIANTS[id].desc}_`,
    );
    return;
  }
  const rows = [];
  for (const [id, val] of Object.entries(VARIANTS)) {
    const mark = parseInt(id) === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} V${id}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}setgoodbyetype v${id}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "👋 Pilih Tipe Goodbye",
        sections: [{ title: "Lista Tipe Goodbye", rows }],
      }),
    },
  ];
  const bodyText =
    `👋🚪 *GOODBYE TYPE*\n\n` +
    `Configura el aspecto del mensaje de despedida cuando un miembro sale del grupo 🚶💨\n` +
    `Tipe activo actualmente: *V${current} — ${VARIANTS[current].name}* 🎯\n\n` +
    `*PENJELASAN TIPE:*\n\n` +
    `- *V1 Canvas Image* 🎨 — El bot crea automáticamente una imagen de canvas con la foto de perfil y el nombre del miembro que se va, y luego la envía como imagen\n\n` +
    `- *V2 Carousel Cards* 🃏 — Muestra tarjetas de carrusel interactivo que se pueden deslizar con botones de acción, ideal para un aspecto moderno\n\n` +
    `- *V3 Text Only* 📝 — Mensaje de texto normal sin imagen alguna, ligero y minimalista\n\n` +
    `- *V4 Group* 👥 — Usa contextInfo con estilo de reenvío de grupo, aspecto limpio con etiqueta de newsletter\n\n` +
    `- *V5 Simple* ✨ — Mensaje de texto sencillo acompañado de la foto de perfil del miembro que se va, no muy llamativo pero informativo\n\n` +
    `- *V6 Video* 🎥 — Envía un video de despedida estético con pie de foto automático para el miembro\n\n` +
    `- *V7 Interactive Quoted* 💬 — Envía un mensaje interactivo y faa quoted de la persona que se va\n\n` +
    `> Pilih tipe goodbye de tombol di bawah 👇`;
  await sock.sendButton(
    m.chat,
    getAssetBuffer("ourin"),
    bodyText,
    m,
    { buttons },
  );
}
export { pluginConfig as config, handler };
