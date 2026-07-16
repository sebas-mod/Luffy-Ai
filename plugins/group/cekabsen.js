import moment from "moment-timezone";
import config from "../../config.js";
const pluginConfig = {
  name: "cekabsen",
  alias: ["listabsen", "daftarabsen", "lihathadir"],
  category: "group",
  description: "Ver lista de participantes que ya registraron asistencia",
  usage: ".cekabsen",
  example: ".cekabsen",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
if (!global.absensi) global.absensi = {};
async function handler(m, { sock }) {
  const chatId = m.chat;
  if (!global.absensi[chatId]) {
    return m.reply(
      `❌ *ɴᴏ ʜᴀʏ sᴇsɪ ᴅᴇ ᴀsɪsᴛᴇɴᴄɪᴀ*\n\n` +
        `> ¡Aún no hay sesión de asistencia en este grupo!\n\n` +
        `> Los admin pueden iniciar con\n` +
        `> *.mulaiabsen [descripción]*`,
    );
  }
  const absen = global.absensi[chatId];
  const now = moment().tz("Asia/Jakarta");
  const dateStr = now.format("D MMMM YYYY");
  const createdDate = moment(absen.createdAt).tz("Asia/Jakarta");
  const timeStr = createdDate.format("HH:mm");
  let list = "┃ _Aún no hay asistencia_";
  if (absen.peserta.length > 0) {
    list = absen.peserta
      .map((jid, i) => `┃ ${i + 1}. @${jid.split("@")[0]}`)
      .join("\n");
  }
  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Luffy-AI";
  await m.reply(
    `📋 *LISTA DE ASISTENCIA*\n\n` +
      `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
      `┃ 📝 ${absen.keterangan}\n` +
      `┃ 📅 ${dateStr}\n` +
      `┃ ⏰ Iniciado: ${timeStr}\n` +
      `┃ 👑 Creado por: @${absen.createdBy.split("@")[0]}\n` +
      `├┈┈⬡「 👥 *ᴘᴀʀᴛɪᴄɪᴘᴀɴᴛᴇs (${absen.peserta.length})* 」\n` +
      `${list}\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `Escribe *${m.prefix}absen* para confirmar asistencia`,
    { mentions: [...absen.peserta, absen.createdBy] },
  );
}
export { pluginConfig as config, handler };
