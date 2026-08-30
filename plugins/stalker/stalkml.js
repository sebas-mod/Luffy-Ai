import fetch from "node-fetch";

const pluginConfig = {
    name: 'stalkml',
    alias: ["mlstalk", "ver_nick_ml", "nickml"],
    category: 'stalker',
    description: 'Saber el nombre/nickname de la cuenta de Mobile Legends por ID y Server.',
    usage: '.stalkml <id> | <server>',
    example: '.stalkml 1264042367 | 15139',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 2,
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
            `☽◯☾ ╭━ ♰ 🎮 STALKER MOBILE LEGENDS ♰ ━╮ ☽◯☾ 🎮\n\n` +
            `Esta función te ayudará a rastrear y saber el *nickname* o nombre de la cuenta de Mobile Legends de alguien solo con su *ID* y *Server*!\n\n` +
            `*CÓMO USARLO:*\n` +
            `- Escribe \`${m.prefix}stalkml <ID> | <Server>\`\n` +
            `- Ejemplo: \`${m.prefix}stalkml 1264042367 | 15139\`\n\n` +
            `_También puedes separar el ID y el Server con un espacio o con el formato de paréntesis como 1264042367(15139)._\n\n╰━ ⊱༺༒༻⊰ ━╯`
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
            return m.reply(`☽◯☾ ♰ ❌ *FORMATO INCORRECTO*\n\nAsegúrate de ingresar el ID y el Server completos.\nEjemplo: \`${m.prefix}stalkml 1264042367 | 15139\``);
        }

        const res = await fetch(`https://api.isan.eu.org/nickname/ml?id=${userId}&server=${serverId}`, { 
            headers: { "User-Agent": "StalkML/1.0", "Accept": "application/json" },
            timeout: 10000
        });

        const json = await res.json();

        if (json.success) {
            const region = getRegion(serverId);
            
            let caption = `☽◯☾ ╭━ ♰ 🎮 MOBILE LEGENDS STALKER ♰ ━╮ ☽◯☾\n──────────\n`;
            caption += `¡Búsqueda exitosa! Estos son los detalles de la cuenta que rastreaste:\n\n`;
            caption += `👤 *Nickname:* ${json.name}\n`;
            caption += `🆔 *User ID:* ${userId}\n`;
            caption += `🌐 *Server ID:* ${serverId}\n`;
            caption += `🗺️ *Region:* ${region}\n`;

            await m.reply(caption);
            await m.react('✅');
        } else {
            await m.react('❌');
            return m.reply(`☽◯☾ ♰ ❌ *CUENTA NO ENCONTRADA*\n\nLo siento, el sistema no pudo encontrar la cuenta con ID *${userId}* y Server *${serverId}*. Asegúrate de que el ID y el Server estén escritos correctamente.`);
        }
    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply(`☽◯☾ ♰ ❌ *ERROR AL RASTREAR LA CUENTA*\n\nLo siento, el sistema está teniendo problemas al consultar la API para rastrear esa cuenta. Vuelve a intentarlo en unos momentos.`);
    }
}

export { pluginConfig as config, handler };
