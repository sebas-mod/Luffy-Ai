import axios from "axios";
import FormData from "form-data";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
    name: "identificar_anime",
    alias: ["whatanime", "animesearch", "sauceanime", "searchanime", "anime-checker", "animechecker"],
    category: "search",
    description: "Identifica el título del anime desde imagen/captura",
    usage: ".animeapaini (reply gambar)",
    example: ".animeapaini",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    carne: 1,
    isEnabled: true,
};

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === "imageMessage");

    if (!isImage) {
        let help = `🔍 *¿QUÉ ANIME ES ESTE?*\n\n`
        help += `Función inteligente para saber el título de un anime solo con una captura o recorte de imagen!\n\n`
        help += `*Cómo usar:*\n`
        help += `- Envía una imagen de la escena del anime con el caption *${m.prefix}identificar_anime*\n`
        help += `- O responde (reply) la imagen de la escena del anime con el comando *${m.prefix}identificar_anime*\n\n`
        help += `⚠️ *Nota:* Los videos no son compatibles, solo imágenes/capturas.`
        return m.reply(help);
    }

    await m.react("🕕");

    try {
        let buffer;
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download();
        } else if (m.isMedia) {
            buffer = await m.download();
        }

        if (!buffer) {
            await m.react("❌");
            return m.reply(`Lo siento, el sistema no pudo descargar la imagen que enviaste. ¡Intenta enviarla de nuevo!`);
        }

        const form = new FormData();
        form.append("image", buffer, { filename: "image.jpg", contentType: "image/jpeg" });

        const response = await axios.post("https://my.izuka-api.xyz/api/anime/anime-checker", form, {
            headers: form.getHeaders(),
            timeout: 60000
        });

        const data = response.data;
        if (!data || !data.status || !data.result || !data.result.full_matches) {
            await m.react("❌");
            return m.reply(`Lo siento, el título del anime no fue encontrado. Intenta con una captura de la escena más clara o un personaje más específico.`);
        }

        await m.react("✅");

        const resObj = data.result;
        const match = resObj.full_matches[0];

        const similarityRaw = resObj.similarity ? parseFloat(resObj.similarity) : (match.similarity * 100);
        const similarity = isNaN(similarityRaw) ? resObj.similarity : similarityRaw.toFixed(2);

        let txt = `🔍 *¡ANIME ENCONTRADO!*\n\n`;
        txt += `🎬 *Título Romaji:* ${resObj.title_romaji || match.anilist.title.romaji}\n`;
        txt += `🇯🇵 *Título Original:* ${resObj.title_native || match.anilist.title.native}\n`;
        txt += `📺 *Episodio:* ${resObj.episode || match.episode}\n`;
        txt += `📊 *Similitud:* ${similarity}%\n`;
        txt += `🔞 *Adulto (18+):* ${resObj.is_adult ? 'Sí' : 'No'}\n\n`;
        txt += `🔗 *Detalle Anilist:*\n${match.anilist.siteUrl || `https://anilist.co/anime/${match.anilist.id}`}`;

        if (resObj.image_preview || match.image) {
            await sock.sendMessage(m.chat, { image: { url: resObj.image_preview || match.image }, caption: txt }, { quoted: m });
        } else {
            await m.reply(txt);
        }

    } catch (error) {
        console.error("[ANIMECHECKER Plugin Error]", error);
        await m.react("☢");
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler };