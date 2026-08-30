import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";
import { getDatabase } from "../../src/lib/luffy-database.js";

const NEOXR_APIKEY = config.APIkey?.neoxr || "Milik-Bot-Luffy-Ai";

const pluginConfig = {
    name: "character-ai",
    alias: ["cai", "charai"],
    category: "ai",
    description: "Busca un personaje AI y actívalo como Auto AI en este chat",
    usage: ".character-ai search <nombre> | .character-ai off | .character-ai reset",
    example: ".character-ai search yuji",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 1,
    isEnabled: true,
};

async function handler(m, { sock, args, text }) {
    if (!args || args.length === 0) {
        return m.reply(`☽◯☾ ╭━ ♰ ✦ ♰ ━╮ ☽◯☾\n\n` +
            `🤖 *CHARACTER AI*\n\n` +
            `Usa los siguientes comandos:\n` +
            `> *.character-ai search <nombre>* (Buscar personaje)\n` +
            `> *.character-ai off* (Apagar Auto AI)\n` +
            `> *.character-ai reset* (Borrar memoria de la conversación)\n\n` +
            `*Ejemplo:* .character-ai search gojo\n\n` +
            `╰━ ⊱༺༒༻⊰ ━╯`);
    }

    const cmd = args[0].toLowerCase();

    if (cmd === "search") {
        const query = args.slice(1).join(" ");
        if (!query) return m.reply(`✧ ¡Escribe el nombre del personaje que quieres buscar!\n☽◯☾ ♰ Ejemplo: .character-ai search yuji`);

        await m.react("🕕");
        try {
            const searchUrl = `https://api.neoxr.eu/api/cai-search?q=${encodeURIComponent(query)}&apikey=${NEOXR_APIKEY}`;
            const response = await axios.get(searchUrl, { timeout: 30000 });
            const resData = response.data;

            if (!resData || !resData.status || !resData.data || resData.data.length === 0) {
                await m.react("❌");
                return m.reply(`✧ ❌ No se encontró el personaje "${query}".`);
            }

            const maxResults = Math.min(resData.data.length, 10);
            let listTxt = `🤖 *RESULTADOS DE BÚSQUEDA DE PERSONAJE: ${query.toUpperCase()}*\n✧────────✧\n\n`;
            listTxt += `Elige uno de los personajes de abajo:\n\n`;

            const searchResults = [];

            for (let i = 0; i < maxResults; i++) {
                const item = resData.data[i].document;
                searchResults.push({
                    character_id: item.character_id,
                    name: item.name,
                    title: item.title,
                    creator: item.creator_username,
                    is_nsfw: item.is_nsfw
                });
                const nsfwTag = item.is_nsfw ? " 🔞" : "";
                listTxt += `*${i + 1}.* ${item.name}${nsfwTag}\n`;
                listTxt += `> ${item.title}\n`;
                listTxt += `> 👤 by ${item.creator_username}\n\n`;
            }

            listTxt += `> 💡 *Envía un número (ejemplo: 1)* para elegir y activar la IA, o escribe \`batal\` para cancelar.`;

            const db = getDatabase();
            const user = db.getUser(m.sender);
            
            user.cai_search_session = {
                results: searchResults,
                time: Date.now()
            };
            db.save();

            await m.react("✅");
            await m.reply(listTxt);

        } catch (error) {
            console.error("[CAI Search Error]", error);
            await m.react("☢");
            m.reply(te(m.prefix, m.command, m.pushName));
        }
    } else if (cmd === "off") {
        const db = getDatabase();
        if (!db.db.data.characterai) db.db.data.characterai = {};
        
        if (db.db.data.characterai[m.chat]?.enabled) {
            delete db.db.data.characterai[m.chat];
            db.save();
            m.reply(`✧ ✅ *Auto Character AI desactivado en este chat.*`);
        } else {
            m.reply(`✧ ❌ No hay ningún Auto Character AI activo en este chat.`);
        }
    } else if (cmd === "reset") {
        const db = getDatabase();
        if (!db.db.data.characterai) db.db.data.characterai = {};
        
        const chatAi = db.db.data.characterai[m.chat];
        if (chatAi?.enabled) {
            chatAi.conversation_id = null;
            db.save();
            m.reply(`✅ *Memoria de la conversación reiniciada exitosamente.*\n✧────────✧\nEl personaje "${chatAi.name}" ya no recuerda las conversaciones anteriores.`);
        } else {
            m.reply(`✧ ❌ No hay ningún Auto Character AI activo en este chat.`);
        }
    } else {
        m.reply(`☽◯☾ ♰ Comando no válido. Usa search, off o reset.`);
    }
}

async function caiAnswerHandler(m, sock) {
    if (!m.body || m.isCommand) return false;

    const db = getDatabase();
    const user = db.getUser(m.sender);

    if (!user || !user.cai_search_session) return false;

    const session = user.cai_search_session;
    const SESSION_TIMEOUT = 5 * 60 * 1000;
    
    if (Date.now() - session.time > SESSION_TIMEOUT) {
        delete user.cai_search_session;
        db.save();
        await m.reply(`⏰ *SESIÓN EXPIRADA*\n✧────────✧\nLa sesión de búsqueda de personaje AI ha terminado.`);
        return true;
    }

    const text = m.body.trim().toLowerCase();

    if (text === "cancelar" || text === "cancel") {
        delete user.cai_search_session;
        db.save();
        await m.reply(`☽◯☾ ♰ 🚪 Búsqueda de personaje cancelada.`);
        return true;
    }

    const choice = parseInt(text);
    if (isNaN(choice) || choice < 1 || choice > session.results.length) {
        return false;
    }

    const selected = session.results[choice - 1];
    delete user.cai_search_session;
    
    if (!db.db.data.characterai) db.db.data.characterai = {};
    
    db.db.data.characterai[m.chat] = {
        enabled: true,
        character_id: selected.character_id,
        name: selected.name,
        is_nsfw: selected.is_nsfw,
        conversation_id: null,
        activatedAt: Date.now(),
        activatedBy: m.sender
    };
    db.save();

    await m.react("✅");
    const nsfwWarning = selected.is_nsfw ? "\n⚠️ *ADVERTENCIA: Este personaje está etiquetado como NSFW.*" : "";
    await m.reply(`🤖 *CHARACTER AI ACTIVADO*\n✧────────✧\n\n¡El personaje *${selected.name}* fue elegido! A partir de ahora, la IA responderá a todos los mensajes normales en este chat.\n\n> Escribe \`.character-ai off\` para apagarlo.${nsfwWarning}`);

    return true;
}

async function caiChatHandler(m, sock) {
    if (!m.body || m.isCommand) return false;

    const db = getDatabase();
    if (!db.db.data.characterai) return false;

    const chatAi = db.db.data.characterai[m.chat];
    if (!chatAi || !chatAi.enabled) return false;

    if (m.fromMe) return false;

    if (chatAi.isProcessing) return false;

    chatAi.isProcessing = true;
    
    try {
        let apiUrl = `https://api.neoxr.eu/api/cai?character_id=${chatAi.character_id}&message=${encodeURIComponent(m.body)}&apikey=${NEOXR_APIKEY}`;
        
        if (chatAi.conversation_id) {
            apiUrl += `&conversation_id=${encodeURIComponent(chatAi.conversation_id)}`;
        }

        const response = await axios.get(apiUrl, { timeout: 45000 });
        const resData = response.data;

        if (resData && resData.status && resData.data) {
            if (resData.data.conversation_id) {
                chatAi.conversation_id = resData.data.conversation_id;
                db.save();
            }

            let replyText = resData.data.content || "";
            if (resData.data.is_nsfw) {
                replyText = `🔞 [NSFW]\n` + replyText;
            }

            await m.reply(replyText);
        }
    } catch (error) {
        console.error("[CAI Chat Error]", error.message);
    } finally {
        chatAi.isProcessing = false;
    }

    return true;
}

export { pluginConfig as config, handler, caiAnswerHandler, caiChatHandler };
