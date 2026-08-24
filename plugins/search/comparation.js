import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";
import { getDatabase } from "../../src/lib/luffy-database.js";

const NEOXR_APIKEY = config.APIkey?.neoxr || "Milik-Bot-Luffy-Ai";

const pluginConfig = {
    name: "advance-comparation",
    alias: ["bandingkan-device", "compare"],
    category: "search",
    description: "Compara dos dispositivos (smartphone, tablet, laptop, etc.)",
    usage: ".bandingkan-device [type] <query>",
    example: ".bandingkan-device phone samsung s24",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 2,
    isEnabled: true,
};

const VALID_TYPES = ["phone", "tablet", "laptop", "cpu", "gpu", "soc"];

async function handler(m, { sock, args, text }) {
    if (!args || args.length === 0) {
        return m.reply(`📊 *ADVANCE COMPARATION*\n\n` +
            `Usa el siguiente comando para comparar dispositivos:\n` +
            `> *.bandingkan-device <tipo> <query>*\n\n` +
            `*Tipos disponibles:*\n` +
            VALID_TYPES.map(t => `> - ${t}`).join("\n") + `\n\n` +
            `*Ejemplo:* .bandingkan-device phone samsung s24`);
    }

    let type = "phone";
    let query = text;

    if (VALID_TYPES.includes(args[0].toLowerCase())) {
        type = args[0].toLowerCase();
        query = args.slice(1).join(" ");
    }

    if (!query.trim()) {
        return m.reply(`╰┈➤ ¡Escribe el nombre del dispositivo que quieres buscar!\nEjemplo: .bandingkan-device phone samsung s24`);
    }

    await m.react("🕕");
    try {
        const searchUrl = `https://api.neoxr.eu/api/compare-search?q=${encodeURIComponent(query)}&type=${type}&apikey=${NEOXR_APIKEY}`;
        const response = await axios.get(searchUrl, { timeout: 30000 });
        const resData = response.data;

        if (!resData || !resData.status || !resData.data || resData.data.length === 0) {
            await m.react("❌");
            return m.reply(`╰┈➤ Dispositivo "${query}" no encontrado.`);
        }

        const maxResults = Math.min(resData.data.length, 10);
        let listTxt = `╭━━━〔 📊 DISPOSITIVO 1: ${query.toUpperCase()} 〕━━━╮\n──────────\n`;
        listTxt += `Por favor elige uno más específico:\n\n`;

        const searchResults = [];

        for (let i = 0; i < maxResults; i++) {
            const item = resData.data[i];
            searchResults.push(item);
            listTxt += `*${i + 1}.* ${item.label}\n`;
        }

        listTxt += `\n> 💡 *Envía un número (ejemplo: 1)* para elegir el primer dispositivo, o escribe \`batal\` para cancelar.`;

        const db = getDatabase();
        const user = db.getUser(m.sender);

        user.compare_session = {
            step: 1,
            type: type,
            results: searchResults,
            device1: null,
            time: Date.now()
        };
        db.save();

        await m.react("✅");
        await m.reply(listTxt);

    } catch (error) {
        console.error("[Compare Search Error]", error);
        await m.react("☢");
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

async function comparationAnswerHandler(m, sock) {
    if (!m.body || m.isCommand) return false;

    const db = getDatabase();
    const user = db.getUser(m.sender);

    if (!user || !user.compare_session) return false;

    const session = user.compare_session;
    const SESSION_TIMEOUT = 5 * 60 * 1000;

    if (Date.now() - session.time > SESSION_TIMEOUT) {
        delete user.compare_session;
        db.save();
        await m.reply(`╰┈➤ ⏰ *SESIÓN CADUCADA*\n\nLa sesión de comparación de dispositivos ha terminado.`);
        return true;
    }

    const text = m.body.trim();
    const textLower = text.toLowerCase();

    if (textLower === "cancelar" || textLower === "cancel") {
        delete user.compare_session;
        db.save();
        await m.reply(`╰┈➤ 🚪 Sesión de comparación cancelada.`);
        return true;
    }

    if (session.step === 1) {
        const choice = parseInt(text);
        if (isNaN(choice) || choice < 1 || choice > session.results.length) {
            return false;
        }

        const selected = session.results[choice - 1];

        session.device1 = selected;
        session.step = 2;
        session.results = [];
        session.time = Date.now();
        db.save();

        await m.react("✅");
        await m.reply(`╰┈➤ Bien, elegiste *${selected.label}* con tipo *${session.type}* para el primer dispositivo.\n\n¿Con qué quieres compararlo?\n\n> 💡 _Envía el nombre del segundo dispositivo a buscar (ejemplo: iphone 17 pro max)_`);
        return true;
    }

    if (session.step === 2) {
        const query = text;

        await m.react("🕕");
        try {
            const searchUrl = `https://api.neoxr.eu/api/compare-search?q=${encodeURIComponent(query)}&type=${session.type}&apikey=${NEOXR_APIKEY}`;
            const response = await axios.get(searchUrl, { timeout: 30000 });
            const resData = response.data;

            if (!resData || !resData.status || !resData.data || resData.data.length === 0) {
                await m.react("❌");
                await m.reply(`╰┈➤ Dispositivo "${query}" no encontrado. Escribe el nombre de otro dispositivo a buscar, o escribe \`batal\`.`);
                return true;
            }

            const maxResults = Math.min(resData.data.length, 10);
            let listTxt = `╭━━━〔 📊 DISPOSITIVO 2: ${query.toUpperCase()} 〕━━━╮\n──────────\n`;
            listTxt += `Por favor elige uno más específico:\n\n`;

            const searchResults = [];

            for (let i = 0; i < maxResults; i++) {
                const item = resData.data[i];
                searchResults.push(item);
                listTxt += `*${i + 1}.* ${item.label}\n`;
            }

            listTxt += `\n> 💡 *Envía un número (ejemplo: 1)* para elegir el segundo dispositivo, o escribe \`batal\` para cancelar.`;

            session.results = searchResults;
            session.step = 3;
            session.time = Date.now();
            db.save();

            await m.react("✅");
            await m.reply(listTxt);
            return true;

        } catch (error) {
            console.error("[Compare Search 2 Error]", error);
            await m.react("☢");
            await m.reply("╰┈➤ Ocurrió un error al buscar el segundo dispositivo. Inténtalo de nuevo más tarde o escribe `batal`.");
            return true;
        }
    }

    if (session.step === 3) {
        const choice = parseInt(text);
        if (isNaN(choice) || choice < 1 || choice > session.results.length) {
            return false;
        }

        const selected = session.results[choice - 1];
        const device1 = session.device1;
        const device2 = selected;

        delete user.compare_session;
        db.save();

        await m.react("🔄");
        await m.reply(`╰┈➤ Procesando la comparación entre:\n*1. ${device1.label}*\n*2. ${device2.label}*\n\nEspera un momento, los datos de comparación se están obteniendo...`);

        try {
            const compareUrl = `https://api.neoxr.eu/api/compare?item1=${encodeURIComponent(device1.name)}&item2=${encodeURIComponent(device2.name)}&type=${session.type}&apikey=${NEOXR_APIKEY}`;
            const response = await axios.get(compareUrl, { timeout: 60000 });
            const resData = response.data;

            if (!resData || !resData.status || !resData.data) {
                await m.react("❌");
                await m.reply(`╰┈➤ Error al obtener los datos de comparación.`);
                return true;
            }

            const data = resData.data;
            let resultTxt = `📊 *ADVANCE COMPARISON*\n`;
            resultTxt += `*${data.title || `${device1.name} vs ${device2.name}`}*\n\n`;

            if (data.overallScore && data.overallScore.length >= 2) {
                resultTxt += `🏆 *OVERALL SCORE*\n`;
                resultTxt += `> ${data.overallScore[0].item}: *${data.overallScore[0].value}*\n`;
                resultTxt += `> ${data.overallScore[1].item}: *${data.overallScore[1].value}*\n\n`;
            }

            if (data.reviewScores && data.reviewScores.length > 0) {
                resultTxt += `⭐ *REVIEW SCORES*\n`;
                data.reviewScores.forEach(cat => {
                    if (cat.data && cat.data.length >= 2) {
                        resultTxt += `*${cat.category}*\n`;
                        resultTxt += `- ${cat.data[0].item}: ${cat.data[0].value}\n`;
                        resultTxt += `- ${cat.data[1].item}: ${cat.data[1].value}\n`;
                    }
                });
                resultTxt += `\n`;
            }

            if (data.reasonsToConsider && data.reasonsToConsider.length > 0) {
                resultTxt += `💡 *REASONS TO CONSIDER*\n`;
                data.reasonsToConsider.forEach(reason => {
                    resultTxt += `*${reason.item}*\n`;
                    if (reason.pros && reason.pros.length > 0) {
                        reason.pros.forEach(p => {
                            resultTxt += `✅ ${p}\n`;
                        });
                    } else {
                        resultTxt += `- No hay datos.\n`;
                    }
                });
                resultTxt += `\n`;
            }

            if (data.specifications && data.specifications.length > 0) {
                resultTxt += `⚙️ *SPECIFICATIONS*\n`;
                data.specifications.forEach(spec => {
                    resultTxt += `\n*--- ${spec.category.toUpperCase()} ---*\n`;
                    if (spec.items && spec.items.length > 0) {
                        spec.items.forEach(item => {
                            if (item.data && item.data.length >= 2) {
                                resultTxt += `\n*${item.name}*\n`;
                                resultTxt += `> ${item.data[0].item}: ${item.data[0].value}\n`;
                                resultTxt += `> ${item.data[1].item}: ${item.data[1].value}\n`;
                            }
                        });
                    }
                });
            }

            await m.react("✅");
            await m.reply(resultTxt)
            return true;

        } catch (error) {
            console.error("[Compare Fetch Error]", error);
            await m.react("❌");
            await m.reply("╰┈➤ Ocurrió un error al procesar los datos de comparación.");
            return true;
        }
    }

    return false;
}

export { pluginConfig as config, handler, comparationAnswerHandler };
