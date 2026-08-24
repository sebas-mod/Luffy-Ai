import moment from 'moment-timezone'
import config from '../../config.js'
const pluginConfig = {
    name: 'asistencia',
    alias: ['presente', 'present'],
    category: 'group',
    description: 'Marcar asistencia en la sesión de asistencia',
    usage: '.absen',
    example: '.absen',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}
if (!global.absensi) global.absensi = {}
async function handler(m, { sock }) {
    const chatId = m.chat
    if (!global.absensi[chatId]) {
        return m.reply(
            `❌ *ɴᴏ ʜᴀʏ ᴀsɪsᴛᴇɴᴄɪᴀ*\n\n` +
            `> Todavía no hay una sesión de asistencia en este grupo!\n\n` +
            `> Un admin puede iniciarla con\n` +
            `> *.mulaiabsen [nota]*`
        )
    }
    const absen = global.absensi[chatId]
    if (absen.peserta.includes(m.sender)) {
        return m.reply("╰┈➤ "+`❌ ¡Ya estás registrado en la asistencia!`)
    }
    absen.peserta.push(m.sender)
    const now = moment().tz('Asia/Jakarta')
    const dateStr = now.format('D MMMM YYYY')
    const list = absen.peserta
        .map((jid, i) => `┃ ${i + 1}. @${jid.split('@')[0]}`)
        .join('\n')
    await m.reply(`✅ *GENIAL, @${m.sender.split('@')[0]} PRESENTE*\n` +
            `MOTIVO DE LA ASISTENCIA: ${absen.keterangan}\n` +
            `╭┈┈⬡「 📋 OTRA INFO 」\n` +
            `┃ 📅 ${dateStr}\n` +
            `┃ 👥 Total: ${absen.peserta.length}\n` +
            `├┈┈⬡「 📝 *ʟɪsᴛᴀ ᴅᴇ ᴘʀᴇsᴇɴᴛᴇs* 」\n` +
            `${list}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> _Escribe *${m.prefix}asistencia* para marcar presencia_\n` +
            `> _Escribe *${m.prefix}ver_asistencia* para ver la lista_`,
            { mentions: absen.peserta })
}
export { pluginConfig as config, handler }