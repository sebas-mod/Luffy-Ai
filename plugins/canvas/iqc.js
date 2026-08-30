import axios from 'axios'
import te from '../../src/lib/luffy-error.js'

const pluginConfig = {
    name: "iqc",
    alias: ["qc2"],
    category: "canvas",
    description: "Crea Fake Quote estilo iOS al instante.",
    usage: ".iqc [text/reply]",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 2,
    isEnabled: true,
};

async function handler(m, { sock, text }) {
    try {
        const targetText = text || (m.quoted && m.quoted.text ? m.quoted.text : "");
        
        if (!targetText) {
            let help = `💬 *FUNCIÓN FAKE QUOTE iOS*\n\n`
            help += `Esta función se usa para crear una imagen de quote elegante estilo iOS muy rápidamente.\n\n`
            help += `*Cómo Usarlo:*\n`
            help += `- Escribe *${m.prefix}iqc <tu texto>*\n`
            help += `- O puedes responder al mensaje de texto de otra persona con el comando *${m.prefix}iqc*\n\n`
            help += `_¡Ese mensaje se convertirá automáticamente en un quote genial!_`
            return m.reply(help)
        }

        await m.react('🕕');

        const apiUrl = `https://my.izuka-api.xyz/api/canvas/iqc?text=${encodeURIComponent(targetText)}`
        
        await sock.sendMessage(m.chat, { image: { url: apiUrl } }, { quoted: m });
        
        await m.react('✅');

    } catch (error) {
        console.error("[IQC Plugin Error]", error)
        await m.react('❌')
        m.reply(`☽◯☾ ╭━ ♰ ✦ ♰ ━╮ ☽◯☾\n😔 Lo siento, ocurrió un error al intentar crear la imagen de quote. Inténtalo de nuevo en unos momentos.\n╰━ ⊱༺༒༻⊰ ━╯`)
    }
}

export { pluginConfig as config, handler };
