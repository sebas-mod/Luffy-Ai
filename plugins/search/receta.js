import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";
import { getDatabase } from "../../src/lib/luffy-database.js";

const NEOXR_APIKEY = config.APIkey?.neoxr || "Milik-Bot-Luffy-Ai";

const pluginConfig = {
    name: "receta",
    alias: ["resepmasak", "resepmasakan", "caramasak"],
    category: "search",
    description: "Busca recetas de comida completas y deliciosas",
    usage: ".resep <nombre de la comida>",
    example: ".resep ayam geprek",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 1,
    isEnabled: true,
};

async function handler(m, { sock, text }) {
    if (!text) {
        return m.reply(`🍳 *BÚSQUEDA DE RECETAS*\n\nEscribe el nombre de la comida cuya receta quieres buscar.\n*Ejemplo:* ${m.prefix}receta Nasi Goreng`);
    }

    await m.react("🕕");

    try {
        const query = encodeURIComponent(text.trim());
        const searchUrl = `https://api.neoxr.eu/api/resep-search?q=${query}&apikey=${NEOXR_APIKEY}`;

        const response = await axios.get(searchUrl, { timeout: 30000 });
        const data = response.data;

        if (!data || !data.status || !data.data || data.data.length === 0) {
            await m.react("❌");
            return m.reply(`Lo siento, no se encontró ninguna receta para "${text}". Intenta con otra palabra clave.`);
        }

        const maxResults = Math.min(data.data.length, 10);
        let listTxt = `🍳 *RESULTADOS DE BÚSQUEDA DE RECETAS: ${text.toUpperCase()}*\n\n`;
        listTxt += `Se encontraron varias recetas, elige una:\n\n`;

        const searchResults = [];

        for (let i = 0; i < maxResults; i++) {
            const item = data.data[i];
            searchResults.push({
                name: item.name,
                url: item.url
            });
            listTxt += `*${i + 1}.* ${item.name}\n`;
        }

        listTxt += `\n> 💡 *Envía un número (ejemplo: 1)* para ver los detalles de la receta, o escribe \`batal\` para cancelar la búsqueda.`;
        const db = getDatabase();
        const user = db.getUser(m.sender);

        user.resep_session = {
            results: searchResults,
            time: Date.now()
        };
        db.save();

        await m.react("✅");
        await m.reply(listTxt);

    } catch (error) {
        console.error("[RESEP Plugin Error]", error);
        await m.react("☢");
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

async function resepAnswerHandler(m, sock) {
    if (!m.body || m.isCommand) return false;
    const db = getDatabase();
    const user = db.getUser(m.sender);
    if (!user || !user.resep_session) return false;

    const session = user.resep_session;
    const SESSION_TIMEOUT = 5 * 60 * 1000;

    if (Date.now() - session.time > SESSION_TIMEOUT) {
        delete user.resep_session;
        db.save();
        await m.reply(`⏰ *SESIÓN CADUCADA*\n\nLa sesión de búsqueda de recetas terminó porque pasaron más de 5 minutos. Escribe el comando .resep de nuevo.`);
        return true;
    }

    const text = m.body.trim().toLowerCase();

    if (text === "cancelar" || text === "cancel") {
        delete user.resep_session;
        db.save();
        await m.reply(`🚪 Búsqueda de recetas cancelada.`);
        return true;
    }

    const choice = parseInt(text);
    if (isNaN(choice) || choice < 1 || choice > session.results.length) {
        return false;
    }

    const selectedRecipe = session.results[choice - 1];
    delete user.resep_session;
    db.save();

    await m.react("🕕");

    try {
        const detailUrl = `https://api.neoxr.eu/api/resep?url=${encodeURIComponent(selectedRecipe.url)}&apikey=${NEOXR_APIKEY}`;
        const detailResponse = await axios.get(detailUrl, { timeout: 30000 });
        const resData = detailResponse.data;

        if (!resData || !resData.status || !resData.data) {
            await m.react("❌");
            return m.reply(`Lo siento, error al obtener los detalles de la receta para "${selectedRecipe.name}".`);
        }

        const recipe = resData.data;
        let recipeTxt = `👨‍🍳 *${recipe.title.toUpperCase()}* 👩‍🍳\n\n`;
        recipeTxt += `⏱️ *Tiempo:* ${recipe.timeout || "-"}\n`;
        recipeTxt += `🍽️ *Porciones:* ${recipe.portion || "-"}\n\n`;

        if (recipe.ingredients && recipe.ingredients.length > 0) {
            recipeTxt += `*🥬 INGREDIENTES:*\n`;
            recipe.ingredients.forEach(bahan => {
                recipeTxt += `- ${bahan}\n`;
            });
            recipeTxt += `\n`;
        }

        if (recipe.steps && recipe.steps.length > 0) {
            recipeTxt += `*🍳 PREPARACIÓN:*\n`;
            recipe.steps.forEach((step, index) => {
                recipeTxt += `*${index + 1}.* ${step}\n\n`;
            });
        }

        await m.react("✅");

        if (recipe.thumbnail) {
            await sock.sendMessage(m.chat, {
                image: { url: recipe.thumbnail },
                caption: recipeTxt
            }, { quoted: m });
        } else {
            await m.reply(recipeTxt);
        }

    } catch (error) {
        console.error("[RESEP Detail Error]", error);
        await m.react("☢");
        await m.reply(`Ocurrió un error al cargar la receta. Inténtalo de nuevo.`);
    }

    return true;
}

export { pluginConfig as config, handler, resepAnswerHandler };
