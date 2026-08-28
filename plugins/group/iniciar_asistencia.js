import config from "../../config.js";
const pluginConfig = {
  name: "iniciar_asistencia",
  alias: ["startabsen", "abrir_asistencia", "openabsen"],
  category: "group",
  description: "Iniciar sesión de asistencia en el grupo (admin only)",
  usage: ".mulaiabsen [nota]",
  example: ".mulaiabsen Reunión Semanal",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
  isAdmin: true,
};

if (!global.absensi) global.absensi = {};

async function handler(m, { sock }) {
  const chatId = m.chat;

  if (global.absensi[chatId]) {
    return m.reply(
      `❌ *ᴀúɴ ʜᴀʏ ᴀsɪsᴛᴇɴᴄɪᴀ*\n\n` +
        `> Todavía hay una sesión de asistencia en este grupo!\n\n` +
        `> Escribe *.hapusabsen* para eliminarla\n` +
        `> o *.cekabsen* para ver la lista`,
    );
  }

  const keterangan = m.text?.trim() || "Asistencia Diaria";

  global.absensi[chatId] = {
    keterangan: keterangan,
    createdBy: m.sender,
    createdAt: new Date().toISOString(),
    peserta: [],
  };

  const saluranId = config.saluran?.canalId || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Luffy-Ai";

  await m.reply(
    `📋 *LA ASISTENCIA YA ESTÁ EN MARCHA*\n\n` +
      `「 📋 *ɪɴғᴏ* 」\n` +
      `📝 ${keterangan}\n` +
      `👑 Creado por: @${m.sender.split("@")[0]}\n` +
      `👥 Participantes: 0\n\n` +
      `Para quienes quieran unirse a la asistencia, escriban *${m.prefix}asistencia*\n` +
      `Para que el admin revise la asistencia, escriba *${m.prefix}ver_asistencia*\n` +
      `Para que el admin elimine la asistencia, escriba *${m.prefix}eliminar_asistencia*`,
    { mentions: [m.sender] },
  );
}

export { pluginConfig as config, handler };
