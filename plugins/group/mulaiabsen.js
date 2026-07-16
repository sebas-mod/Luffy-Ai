import config from "../../config.js";
const pluginConfig = {
  name: "mulaiabsen",
  alias: ["startabsen", "bukaabsen", "openabsen"],
  category: "group",
  description: "Iniciar sesión de asistencia en el grupo (solo admin)",
  usage: ".mulaiabsen [keterangan]",
  example: ".mulaiabsen Rapat Mingguan",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
  isAdmin: true,
};

if (!global.absensi) global.absensi = {};

async function handler(m, { sock }) {
  const chatId = m.chat;

  if (global.absensi[chatId]) {
    return m.reply(
      `❌ *ᴀᴜɴ ʜᴀʏ ᴀsɪsᴛᴇɴᴄɪᴀ*\n\n` +
        `> ¡Aún hay una sesión de asistencia activa en este grupo!\n\n` +
        `> Escribe *.hapusabsen* para eliminar\n` +
        `> o *.cekabsen* para ver la lista\n\n` +
        `_¡Shishishi! ¡No se puede tener dos asistencias a la vez!_`,
    );
  }

  const keterangan = m.text?.trim() || "Asistencia Diaria";

  global.absensi[chatId] = {
    keterangan: keterangan,
    createdBy: m.sender,
    createdAt: new Date().toISOString(),
    peserta: [],
  };

  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Luffy-AI";

  await m.reply(
    `📋 *¡ASISTENCIA EN MARCHA!*\n\n` +
      `「 📋 *ɪɴꜰᴏ* 」\n` +
      `📝 ${keterangan}\n` +
      `👑 Creado por: @${m.sender.split("@")[0]}\n` +
      `👥 Participantes: 0\n\n` +
      `Si quieres unirte a la asistencia, escribe *${m.prefix}absen*\n` +
      `Si el admin quiere ver la asistencia, escribe *${m.prefix}cekabsen*\n` +
      `Si el admin quiere eliminar la asistencia, escribe *${m.prefix}hapusabsen*\n\n` +
      `_¡Vamos a ser los Reyes de los Piratas! ¡Shishishi!_`,
    { mentions: [m.sender] },
  );
}

export { pluginConfig as config, handler };
