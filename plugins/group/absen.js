import moment from 'moment-timezone'
import config from '../../config.js'
const pluginConfig = {
    name: 'absen',
    alias: ['hadir', 'present'],
    category: 'group',
    description: 'Marca tu presencia en la sesión de asistencia',
    usage: '.absen',
    example: '.absen',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}
if (!global.absensi) global.absensi = {}
async function handler(m, { sock }) {
    const chatId = m.chat
    if (!global.absensi[chatId]) {
        return m.reply(
            `❌ *ɴᴏ ʜᴀʏ sᴇsɪᴏ ᴅᴇ ᴀsɪsᴛᴇɴᴄɪᴀ*\n\n` +
            `> ¡Todavía no hay sesión de asistencia en este grupo!\n\n` +
            `> Un admin puede iniciarla con\n` +
            `> *.mulaiabsen [descripción]*`
        )
    }
    const absen = global.absensi[chatId]
    if (absen.peserta.includes(m.sender)) {
        return m.reply(`❌ ¡Ya marcaste tu presencia! ¡Shishishi!`)
    }
    absen.peserta.push(m.sender)
    const now = moment().tz('Asia/Jakarta')
    const dateStr = now.format('D MMMM YYYY')
    const list = absen.peserta
        .map((jid, i) => `┃ ${i + 1}. @${jid.split('@')[0]}`)
        .join('\n')
    await m.reply(`✅ *PERFECTO, @${m.sender.split('@')[0]} PRESENTE*\n` +
            `OBJETIVO DE ASISTENCIA: ${absen.keterangan}\n` +
            `╭┈┈⬡「 📋 OTRA INFO 」\n` +
            `┃ 📅 ${dateStr}\n` +
            `┃ 👥 Total: ${absen.peserta.length}\n` +
            `├┈┈⬡「 📝 *ʟɪsᴛᴀ ᴅᴇ ᴘʀᴇsᴇɴᴄɪᴀs* 」\n` +
            `${list}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> _Escribe *${m.prefix}absen* para marcar presencia_\n` +
            `> _Escribe *${m.prefix}cekabsen* para ver la lista_`,
            { mentions: absen.peserta })
}
export { pluginConfig as config, handler }