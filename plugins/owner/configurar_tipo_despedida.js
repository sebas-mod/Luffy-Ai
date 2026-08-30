import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js";
import fs from "fs";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/luffy-database.js";
const pluginConfig = {
  name: "configurar_tipo_despedida",
  alias: ["goodbyetype", "goodbyevariant", "goodbyestyle"],
  category: "owner",
  description: "Configurar la variante de visualización del mensaje de despedida",
  usage: ".configurar_tipo_despedida",
  example: ".configurar_tipo_despedida",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};
const VARIANTS = {
  1: {
    name: "Canvas Image",
    desc: "Imagen canvas con foto de perfil",
    emoji: "🎨",
  },
  2: {
    name: "Carousel Cards",
    desc: "Tarjetas carousel interactivas con botones",
    emoji: "🃏",
  },
  3: {
    name: "Text Only",
    desc: "Mensaje de texto minimalista sin imagen",
    emoji: "📝",
  },
  4: { name: "Group", desc: "Estilo ContextInfo de grupo", emoji: "👥" },
  5: { name: "Simple", desc: "Mensaje de texto simple + foto de perfil", emoji: "✨" },
  6: { name: "Video", desc: "Enviar video de despedida", emoji: "🎥" },
  7: { name: "Interactive Quoted", desc: "Mensaje interactivo con fake quoted", emoji: "💬" },
  8: { name: "Super Simple", desc: "Mensaje de texto muy breve sin adornos", emoji: "👋" },
};
async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();
  const current = db.setting("goodbyeType") || 1;
  if (variant && /^v?[1-8]$/.test(variant)) {
    const id = parseInt(variant.replace("v", ""));
    db.setting("goodbyeType", id);
    await db.save();
    await m.reply(
      `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n` +
        `┃ ✅ *TIPO DE GOODBYE CAMBIADO*\n` +
        `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
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
      id: `${m.prefix}configurar_tipo_despedida v${id}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "👋 Elegir Tipo de Goodbye",
        sections: [{ title: "Lista de Tipos de Goodbye", rows }],
      }),
    },
  ];
  const bodyText =
    `👋🚪 *TIPO DE GOODBYE*\n\n` +
    `Configura la visualización del mensaje de despedida cuando un miembro sale del grupo 🚶💨\n` +
    `Tipo activo actualmente: *V${current} — ${VARIANTS[current].name}* 🎯\n\n` +
    `*EXPLICACIÓN DE LOS TIPOS:*\n\n` +
    `- *V1 Canvas Image* 🎨 — El bot genera automáticamente una imagen canvas con la foto de perfil y el nombre del miembro que sale, y la envía como imagen\n\n` +
    `- *V2 Carousel Cards* 🃏 — Muestra tarjetas carousel interactivas con swipe, completas con botones de acción, ideal para una visualización moderna\n\n` +
    `- *V3 Text Only* 📝 — Mensaje de texto normal sin imagen alguna, ligero y minimalista\n\n` +
    `- *V4 Group* 👥 — Usa contextInfo con estilo de reenvío de grupo, visualización limpia con etiqueta de newsletter\n\n` +
    `- *V5 Simple* ✨ — Mensaje de texto simple acompañado de la foto de perfil del miembro que sale, discreto pero informativo\n\n` +
    `- *V6 Video* 🎥 — Envía un video de despedida estético con caption automático para el miembro\n\n` +
    `- *V7 Interactive Quoted* 💬 — Envía un mensaje interactivo y fake quoted de la persona que sale\n\n` +
    `- *V8 Super Simple* 👋 — Mensaje de texto muy breve sin adornos (Ejemplo: Adiós @usuario, del grupo...)\n\n` +
    `> Elige el tipo de goodbye con el botón de abajo 👇`;
  await sock.sendButton(
    m.chat,
    getAssetBuffer("luffy"),
    bodyText,
    m,
    { buttons },
  );
}
export { pluginConfig as config, handler };
