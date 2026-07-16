import fetch from "node-fetch";

const pluginConfig = {
    name: 'stalkml',
    alias: ['mlstalk', 'ceknickml', 'nickml'],
    category: 'stalker',
    description: 'Conocer el nombre/nickname de una cuenta de Mobile Legends por ID y Servidor.',
    usage: '.stalkml <id> | <server>',
    example: '.stalkml 1264042367 | 15139',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true
};

const REGION_MAP = {
  "1":"Indonesia","2":"Indonesia","3":"Indonesia","4":"Indonesia",
  "5":"Indonesia","6":"Indonesia","7":"Indonesia","8":"Indonesia","9":"Indonesia",
  "10":"Malaysia / SG / BN","11":"Philippines","12":"Thailand",
  "13":"Vietnam","14":"Cambodia","15":"Myanmar","16":"Laos",
  "17":"Timor-Leste","19":"Middle East","20":"North America",
  "21":"Europe","22":"South America",
};

function getRegion(sid) {
  const s = String(sid);
  return REGION_MAP[s.slice(0, 2)] ?? REGION_MAP[s.slice(0, 1)] ?? "Unknown";
}

async function handler(m, { text }) {
    if (!text) {
        return m.reply(
            `🎮 *STALKER MOBILE LEGENDS* 🎮\n\n` +
            `¡Esta función te ayudará a rastrear y conocer el *nickname* o nombre de una cuenta de Mobile Legends solo usando su *ID* y *Servidor*!\n\n` +
            `*CÓMO USAR:*\n` +
            `- Escribe \`${m.prefix}stalkml <ID> | <Servidor>\`\n` +
            `- Ejemplo: \`${m.prefix}stalkml 1264042367 | 15139\`\n\n` +
            `_La separación de ID y Servidor también se puede hacer con espacio o formato entre paréntesis como 1264042367(15139)._`
        );
    }

    try {
        await m.react('🕕');

        let userId = "";
        let serverId = "";

        if (text.includes('|')) {
            const parts = text.split('|').map(v => v.trim());
            userId = parts[0];
            serverId = parts[1];
        } else if (text.includes('(') && text.includes(')')) {
            const match = text.match(/(\d+)\s*\(\s*(\d+)\s*\)/);
            if (match) {
                userId = match[1];
                serverId = match[2];
            } else {
                const pureNumbers = text.replace(/[^\d]/g, '');
                if (pureNumbers.length > 4) {
                    serverId = pureNumbers.slice(-4);
                    userId = pureNumbers.slice(0, -4);
                }
            }
        } else {
            const parts = text.split(/\s+/).filter(v => v.trim().length > 0);
            if (parts.length >= 2) {
                userId = parts[0];
                serverId = parts[1];
            } else {
                const pureNumbers = text.replace(/[^\d]/g, '');
                if (pureNumbers.length > 4) {
                    serverId = pureNumbers.slice(-4);
                    userId = pureNumbers.slice(0, -4);
                } else {
                    userId = pureNumbers;
                }
            }
        }

        if (!userId || !serverId) {
            await m.react('❌');
            return m.reply(`❌ *FORMATO INCORRECTO*\n\nAsegúrate de ingresar el ID y Servidor completos.\nEjemplo: \`${m.prefix}stalkml 1264042367 | 15139\``);
        }

        const res = await fetch(`https://api.isan.eu.org/nickname/ml?id=${userId}&server=${serverId}`, { 
            headers: { "User-Agent": "StalkML/1.0", "Accept": "application/json" },
            timeout: 10000
        });

        const json = await res.json();

        if (json.success) {
            const region = getRegion(serverId);
            
            let caption = `🎮 *MOBILE LEGENDS STALKER* 🎮\n\n`;
            caption += `Pencarian berhasil! Berikut adalah detail akun yang kamu lacak:\n\n`;
            caption += `👤 *Nickname:* ${json.name}\n`;
            caption += `🆔 *User ID:* ${userId}\n`;
            caption += `🌐 *Server ID:* ${serverId}\n`;
            caption += `🗺️ *Region:* ${region}\n`;

            await m.reply(caption);
            await m.react('✅');
        } else {
            await m.react('❌');
            return m.reply(`❌ *CUENTA NO ENCONTRADA*\n\nLo siento, el sistema no pudo encontrar una cuenta con ID *${userId}* y Servidor *${serverId}*. Asegúrate de que el ID y Servidor estén escritos correctamente.`);
        }
    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply(`❌ *FALLÓ EL RASTREO DE LA CUENTA*\n\nLo siento, el sistema tuvo problemas al llamar a la API para rastrear la cuenta. Por favor, inténtalo de nuevo en unos momentos.`);
    }
}

export { pluginConfig as config, handler };
