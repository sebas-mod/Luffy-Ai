import axios from 'axios';
import te from '../../src/lib/luffy-error.js';

const pluginConfig = {
    name: "iqc2",
    alias: ["qc3"],
    category: "canvas",
    description: "Crea Fake Quote estilo iOS con información de batería y proveedor.",
    usage: ".iqc2 [text/reply]",
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
            return m.reply(
                `Hola *${m.pushName}*, parece que aún no has ingresado el texto.\n\n` +
                `Por favor, usa el comando con el formato:\n` +
                `- .iqc2 <tu texto>\n` +
                `- O responde al mensaje de otra persona con .iqc2`
            );
        }

        await m.react('🕕');

        const providers = ["INDOSAT", "TELKOMSEL", "XL", "TRI", "SMARTFREN", "WIFI"];
        const randomProvider = providers[Math.floor(Math.random() * providers.length)];
        
        const now = new Date();
        const jam = now.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).replace('.', ':');
        
        const randomBaterai = Math.floor(Math.random() * (100 - 10 + 1)) + 10; // 10-100

        const apiUrl = `https://api.nexray.eu.cc/maker/v1/iqc?text=${encodeURIComponent(targetText)}&provider=${encodeURIComponent(randomProvider)}&jam=${encodeURIComponent(jam)}&baterai=${randomBaterai}`;
        
        await sock.sendMessage(m.chat, { image: { url: apiUrl } }, { quoted: m });
        
        await m.react('✅');

    } catch (error) {
        console.error("[IQC2 Plugin Error]", error);
        await m.react('❌');
        m.reply(`Lo siento *${m.pushName}*, ocurrió un error al intentar crear la imagen de quote. Inténtalo de nuevo en unos momentos.`);
    }
}

export { pluginConfig as config, handler };
