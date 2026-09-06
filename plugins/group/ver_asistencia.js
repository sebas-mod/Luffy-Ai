import moment from "moment-timezone";
import config from "../../config.js";
const pluginConfig = {
  name: "ver_asistencia",
  alias: ["listabsen", "lista_asistencia", "ver_presentes"],
  category: "group",
  description: "Ver la lista de participantes que ya hicieron acto de presencia",
  usage: ".ver_asistencia",
  example: ".ver_asistencia",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};
if (!global.absensi) global.absensi = {};
async function handler(m, { sock }) {
  const chatId = m.chat;
  if (!global.absensi[chatId]) {
    return m.reply(
      `❌ *ɴᴏ ʜᴀʏ ᴀʙsᴇɴ*\n\n` +
        `> Aún no hay sesión de asistencia en este grupo!\n\n` +
        `> Los admins pueden iniciar una con\n` +
        `> *.mulaiabsen [descripción]*`,
    );
  }
  const absen = global.absensi[chatId];
  const now = moment().tz("America/Argentina/Buenos_Aires");
  const dateStr = now.format("D MMMM YYYY");
  const createdDate = moment(absen.createdAt).tz("America/Argentina/Buenos_Aires");
  const timeStr = createdDate.format("HH:mm");
  let list = "┃ _Aún no hay nadie presente_";
  if (absen.peserta.length > 0) {
    list = absen.peserta
      .map((jid, i) => `┃ ${i + 1}. @${jid.split("@")[0]}`)
      .join("\n");
  }
  const saluranId = config.saluran?.canalId || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Luffy-Ai";
  await m.reply(
    `📋 *LISTA DE ASISTENCIA*\n\n` +
      `☽◯☾ ♰ 「 📋 *INFO* 」\n` +
      `┃ 📝 ${absen.keterangan}\n` +
      `┃ 📅 ${dateStr}\n` +
      `┃ ⏰ Iniciada: ${timeStr}\n` +
      `┃ 👑 Creada por: @${absen.createdBy.split("@")[0]}\n` +
      `├┈┈⬡「 👥 *PARTICIPANTES (${absen.peserta.length})* 」\n` +
      `${list}\n` +
      `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
      `Escribe *${m.prefix}asistencia* para asistir`,
    { mentions: [...absen.peserta, absen.createdBy] },
  );
}
export { pluginConfig as config, handler };
