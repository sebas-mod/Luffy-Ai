import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";
import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
    name: "stickerly",
    alias: ["stikerly", "stickerlysearch"],
    category: "sticker",
    description: "Busca y descarga sticker packs de Sticker.ly",
    usage: ".stickerly <query / url>",
    example: ".stickerly anime",
    cooldown: 10,
    carne: 2,
};

async function handler(m, { sock, text }) {
    if (!text) {
        return m.reply(`⚠️ ¡Ingresa la palabra clave de búsqueda o la URL de Sticker.ly!\nEjemplo: \`${m.prefix}${m.command} anime\``);
    }

    await m.react("🕕");

    try {
        if (text.includes("sticker.ly/s/")) {
            return await downloadStickerlyPack(sock, m, text);
        }

        const searchUrl = `https://my.izuka-api.xyz/api/search/stickerly-search?query=${encodeURIComponent(text.trim())}`;
        const response = await axios.get(searchUrl, { timeout: 30000 });
        const data = response.data;

        if (!data || !data.status || !data.result || data.result.length === 0) {
            await m.react("❌");
            return m.reply(`Lo siento, no se encontró el sticker pack para "${text}". Prueba con otra palabra clave.`);
        }

        const maxResults = Math.min(data.result.length, 10);
        let listTxt = `🎨 *RESULTADOS DE BÚSQUEDA STICKER.LY: ${text.toUpperCase()}*\n\n`;
        listTxt += `Se encontraron varios packs, elige uno:\n\n`;

        const searchResults = [];

        for (let i = 0; i < maxResults; i++) {
            const item = data.result[i];
            searchResults.push({
                name: item.name,
                url: item.shareUrl,
                author: item.authorName
            });
            listTxt += `*${i + 1}.* ${item.name} by ${item.authorName}\n`;
        }

        listTxt += `\n> 💡 *Envía un número (ejemplo: 1)* para descargar el pack, o escribe \`batal\` para cancelar la búsqueda.`;
        
        const db = getDatabase();
        const user = db.getUser(m.sender);

        user.stickerly_session = {
            results: searchResults,
            time: Date.now()
        };
        db.save();

        await m.react("✅");
        await m.reply(listTxt);
    } catch (error) {
        console.error("[Stickerly Search Error]", error);
        await m.react("☢");
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

async function stickerlyAnswerHandler(m, sock) {
    if (!m.body || m.isCommand) return false;
    
    const db = getDatabase();
    const user = db.getUser(m.sender);
    
    if (!user || !user.stickerly_session) return false;

    const session = user.stickerly_session;
    const SESSION_TIMEOUT = 5 * 60 * 1000;

    if (Date.now() - session.time > SESSION_TIMEOUT) {
        delete user.stickerly_session;
        db.save();
        await m.reply(`⏰ *SESIÓN EXPIRADA*\n\nLa sesión de búsqueda de stickerly terminó porque pasaron más de 5 minutos. Por favor repite el comando.`);
        return true;
    }

    const text = m.body.trim().toLowerCase();

    if (text === "cancelar" || text === "cancel") {
        delete user.stickerly_session;
        db.save();
        await m.reply(`🚪 Búsqueda de stickerly cancelada.`);
        return true;
    }

    const choice = parseInt(text);
    if (isNaN(choice) || choice < 1 || choice > session.results.length) {
        return false;
    }

    const selectedPack = session.results[choice - 1];
    delete user.stickerly_session;
    db.save();

    await downloadStickerlyPack(sock, m, selectedPack.url);
    return true;
}

async function downloadStickerlyPack(sock, m, packUrl) {
    await m.react("🕕");
    await m.reply(`> Descargando sticker pack... ⏳`);

    try {
        const url = `https://my.izuka-api.xyz/api/search/stickerly-pack?url=${encodeURIComponent(packUrl)}`;
        const response = await axios.get(url, { timeout: 30000 });
        const data = response.data;

        if (!data || !data.status || !data.result || !data.result.stickers || data.result.stickers.length === 0) {
            await m.react("❌");
            return m.reply(`❌ No se pudo obtener el detalle del pack.`);
        }

        const stickersData = data.result.stickers;
        const packInfo = stickersData[0].stickerPack;
        const prefix = packInfo.trayResourceUrl.split('/').slice(0, -1).join('/') + '/';

        const stickerUrls = [];
        for (const sticker of stickersData) {
            stickerUrls.push(prefix + sticker.fileName);
        }

        if (stickerUrls.length === 0) {
            await m.react("❌");
            return m.reply(`❌ No hay stickers en este pack.`);
        }

        const packname = packInfo.name || "Sticker.ly Pack";
        const author = packInfo.authorName || config.sticker.author || "Bot";
        const urlsToProcess = stickerUrls.slice(0, 20);
        
        try {
            await sock.sendStickerPack(m.chat, urlsToProcess, m, {
                name: packname,
                packname: packname,
                publisher: author,
                author: author,
                description: `Sticker pack de Sticker.ly`,
                emojis: ["✨"]
            });
            await m.react("✅");
        } catch (packErr) {
            console.error("[Stickerly Pack Send Error]", packErr.message);
            await m.reply(`❌ No se pudo enviar el pack completo, intentando enviar uno por uno...`);
            
            let sent = 0;
            for (const sUrl of urlsToProcess) {
                try {
                    await sock.sendImageAsSticker(m.chat, sUrl, m, {
                        packname: packname,
                        author: author
                    });
                    sent++;
                    await new Promise(r => setTimeout(r, 700));
                } catch {
                    continue;
                }
            }
            if (sent > 0) {
                await m.react("✅");
                await m.reply(`✅ Se enviaron ${sent} stickers.`);
            } else {
                await m.react("❌");
                await m.reply(`❌ No se pudieron enviar todos los stickers.`);
            }
        }
    } catch (error) {
        console.error("[Stickerly Pack Fetch Error]", error);
        await m.react("☢");
        m.reply(te(m.prefix, "stickerly", m.pushName));
    }
}

export { pluginConfig as config, handler, stickerlyAnswerHandler };
