import axios from 'axios'
import FormData from 'form-data'
import te from '../../src/lib/luffy-error.js'

const pluginConfig = {
    name: ['fake_llamada', 'fakecall-android', 'fakecall-ios'],
    alias: ['fakecallwa'],
    category: 'canvas',
    description: 'Crea una imagen de fake call de WhatsApp (Disponible en versión Android y iOS)',
    usage: '.fakecall nombre | duración',
    example: '.fakecall Zann | 19:00',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const cmd = m.command.toLowerCase()
    const text = m.text

    if (!text || !text.includes('|')) {
        let helpText = `¡Hola! Parece que el formato que ingresaste no es el correcto.\n\n`
        helpText += `Esta función se usa para crear una imagen de llamada falsa (Fake Call), como si alguien te estuviera llamando directamente.\n\n`
        helpText += `*Lista de Comandos Disponibles:*\n`
        helpText += `- *${m.prefix}fake_llamada* (Para la pantalla de llamada de Android)\n`
        helpText += `- *${m.prefix}fakecall-ios* (Para la pantalla de llamada de iPhone o iOS)\n\n`
        helpText += `*Cómo Usarlo:*\n`
        helpText += `Escribe el comando seguido del *Nombre* y la *Duración*, separados por el signo de barra vertical (|).\n\n`
        helpText += `*Ejemplos de Uso:*\n`
        helpText += `- *${m.prefix}fake_llamada Zann | 03:33:33*\n`
        helpText += `- *${m.prefix}fakecall-ios Mi amor | 12:00:00*\n\n`
        helpText += `*Consejo Adicional:*\n`
        helpText += `Puedes responder a una imagen si quieres usar esa foto como foto de perfil de la persona que llama!`
        
        return m.reply(helpText)
    }

    const [nombre, duracion] = text.split('|').map(s => s.trim())

    if (!nombre) {
        return m.reply(`☽◯☾ ╭━ ♰ ✦ ♰ ━╮ ☽◯☾\n⚠️ Lo siento, el nombre de la persona que llama no puede estar vacío. ¡Completa el nombre primero!\n╰━ ⊱༺༒༻⊰ ━╯`)
    }

    if (!duracion) {
        return m.reply(`☽◯☾ ╭━ ♰ ✦ ♰ ━╮ ☽◯☾\n⚠️ Lo siento, la duración de la llamada no puede estar vacía. ¡Completa la duración primero!\n╰━ ⊱༺༒༻⊰ ━╯`)
    }

    await m.react('🕕')

    try {
        let bufferBase
        
        if (m.isImage) {
            try {
                bufferBase = await m.download()
            } catch (err) {}
        } else if (m.quoted?.isImage) {
            try {
                bufferBase = await m.quoted.download()
            } catch (err) {}
        }

        if (!bufferBase) {
            try {
                const ppUrl = await sock.profilePictureUrl(m.sender, 'image')
                const res = await axios.get(ppUrl, { responseType: 'arraybuffer' })
                bufferBase = Buffer.from(res.data)
            } catch (err) {
                const res = await axios.get('https://files.catbox.moe/nwvkbt.png', { responseType: 'arraybuffer' })
                bufferBase = Buffer.from(res.data)
            }
        }

        const form = new FormData()
        form.append('avatarUrl', bufferBase, { filename: 'avatar.jpg', contentType: 'image/jpeg' })
        form.append('name', nombre)
        form.append('duration', duracion)

        let endpoint = 'fakecall-android'
        if (cmd === 'fakecall-ios') {
            endpoint = 'fakecall-ios'
        }

        const apiUrl = `https://my.izuka-api.xyz/api/canvas/${endpoint}`

        const response = await axios.post(apiUrl, form, {
            headers: form.getHeaders(),
            responseType: 'arraybuffer'
        })

        await sock.sendMessage(m.chat, { image: Buffer.from(response.data) }, { quoted: m })

        await m.react('📞')

    } catch (err) {
        await m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }