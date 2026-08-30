import axios from "axios";
import * as cheerio from "cheerio";
import crypto from "crypto";
import { generateWAMessageFromContent, generateWAMessage, jidNormalizedUser } from "ourin";

const pluginConfig = {
    name: 'comparar_moviles',
    alias: ['bandingkanhp', 'comparehp'],
    category: 'tools',
    description: 'Compara las especificaciones de dos smartphones desde Carisinyal.',
    usage: '.bandingkan-hp <teléfono1> | <teléfono2>',
    example: '.bandingkan-hp oppo a3s | vivo y91',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 2,
    isEnabled: true
};

async function request(url) {
    const { data } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" }
    });
    return data;
}

function normalize(text = "") {
    return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function score(title, query) {
    const t = normalize(title);
    const q = normalize(query);
    let s = 0;
    if (t === q) s += 100;
    if (t.includes(q)) s += 80;
    if (q.includes(t)) s += 60;
    const words = q.match(/[a-z]+|\d+/g) || [];
    for (const w of words) if (t.includes(w)) s += 10;
    return s;
}

async function getPhoneList() {
    const html = await request("https://carisinyal.com/compare/");
    const $ = cheerio.load(html);
    const list = [];

    $('select[name="hp_1"] option').each((_, el) => {
        const id = $(el).attr("value");
        const title = $(el).text().trim();
        if (id && title) list.push({ id, title });
    });

    return list;
}

function bestMatch(list, query) {
    let best = null;
    let bestScore = -1;
    for (const item of list) {
        const s = score(item.title, query);
        if (s > bestScore) {
            bestScore = s;
            best = item;
        }
    }
    return best;
}

function extractCell($, cell) {
    const img = cell.find("img").first();
    if (img.length) {
        return img.attr("src") || img.attr("data-src") || null;
    }

    const items = cell.find("li");
    if (items.length) {
        return items
            .map((_, li) => $(li).text().replace(/\s+/g, " ").trim())
            .get()
            .join("; ");
    }

    return cell.text().replace(/\s+/g, " ").trim();
}

async function fetchCompare(id1, id2) {
    const html = await request(`https://carisinyal.com/compare/?hp_1=${id1}&hp_2=${id2}`);
    const $ = cheerio.load(html);

    const sections = [];
    let current = { section: "UMUM", rows: [] };

    $(".ct-text-block, .ct-new-columns").each((_, el) => {
        const node = $(el);

        if (node.hasClass("ct-text-block")) {
            if (node.closest(".ct-new-columns").length > 0) return;
            const title = node.text().trim();
            if (!title) return;
            if (current.rows.length) sections.push(current);
            current = { section: title, rows: [] };
            return;
        }

        const cells = node.children(".ct-div-block");
        if (cells.length < 3) return;

        const label = cells.eq(0).text().replace(/\s+/g, " ").trim();
        const value1 = extractCell($, cells.eq(1));
        const value2 = extractCell($, cells.eq(2));

        if (!value1 && !value2) return;

        current.rows.push({ label: label || null, value1, value2 });
    });

    if (current.rows.length) sections.push(current);

    return sections;
}

async function handler(m, { sock, text }) {
    if (!text || !text.includes('|')) {
        return m.reply(
            `☽◯☾ ╭━ ♰ ⚖️ COMPARADOR DE TELÉFONOS ♰ ━╮ ☽◯☾\n\n` +
            `☽◯☾ ♰ Esta función te ayudará a comparar las especificaciones de dos *smartphones* directamente para que puedas elegir cuál es el mejor!\n\n` +
            `✦ *CÓMO USAR:*\n` +
            `☽◯☾ ♰ Escribe \`${m.prefix}comparar_moviles <primer teléfono> | <segundo teléfono>\`\n` +
            `☽◯☾ ♰ Ejemplo: \`${m.prefix}comparar_moviles iphone 13 | samsung s22\`\n\n` +
            `_Asegúrate de usar la barra vertical (|) como separador entre los dos nombres de teléfono!_\n\n` +
            `╰━ ⊱༺༒༻⊰ ━╯`
        );
    }

    try {
        await m.react('🕕');

        const [query1, query2] = text.split('|').map(v => v.trim());
        if (!query1 || !query2) {
            await m.react('❌');
            return m.reply(`☽◯☾ ♰ ❌ *FORMATO INCORRECTO*\n\nAsegúrate de escribir los dos nombres de teléfonos separados con la barra vertical (|).`);
        }

        const list = await getPhoneList();
        const phone1 = bestMatch(list, query1);
        const phone2 = bestMatch(list, query2);

        if (!phone1 || !phone2) {
            await m.react('❌');
            let errStr = `❌ *TELÉFONO NO ENCONTRADO*\n──────────\n`;
            if (!phone1) errStr += `☽◯☾ ♰ *${query1}* no se encontró en la base de datos.\n`;
            if (!phone2) errStr += `☽◯☾ ♰ *${query2}* no se encontró en la base de datos.\n`;
            errStr += `\n✧ Prueba con palabras clave diferentes.`;
            return m.reply(errStr);
        }

        const sections = await fetchCompare(phone1.id, phone2.id);

        const images = [];
        for (const sec of sections) {
            for (const row of sec.rows) {
                if (typeof row.value1 === 'string' && row.value1.startsWith("http")) {
                    images.push(row.value1);
                    row.value1 = "📸 (Cek Album)";
                }
                if (typeof row.value2 === 'string' && row.value2.startsWith("http")) {
                    if (!images.includes(row.value2)) images.push(row.value2);
                    row.value2 = "📸 (Cek Album)";
                }
            }
        }

        let caption = `☽◯☾ ╭━ ♰ ⚖️ COMPARACIÓN DE SMARTPHONES ♰ ━╮ ☽◯☾\n\n`;
        caption += `☽◯☾ ♰ 📱 *TELÉFONO 1:* ${phone1.title}\n`;
        caption += `☽◯☾ ♰ 📱 *TELÉFONO 2:* ${phone2.title}\n\n`;

        for (const sec of sections) {
            caption += `♰ ──────── ♱✦\n✨ *${sec.section.toUpperCase()}*\n`;
            for (const row of sec.rows) {
                if (!row.label) continue;
                caption += `🔹 *${row.label}:*\n`;
                caption += `☽◯☾ ♰ *1:* ${row.value1}\n`;
                caption += `☽◯☾ ♰ *2:* ${row.value2}\n`;
            }
            caption += `\n`;
        }

        caption += `──────────\n🔗 *Fuente:* Carisinyal`;

        await m.reply(caption);

        if (images.length > 0) {
            const opener = generateWAMessageFromContent(
                m.chat,
                {
                    messageContextInfo: { messageSecret: crypto.randomBytes(32) },
                    albumMessage: {
                        expectedImageCount: images.length,
                        expectedVideoCount: 0,
                    },
                },
                {
                    userJid: jidNormalizedUser(sock.user.id),
                    quoted: m,
                    upload: sock.waUploadToServer,
                }
            );

            await sock.relayMessage(opener.key.remoteJid, opener.message, {
                messageId: opener.key.id,
            });

            for (const imgUrl of images) {
                const msg = await generateWAMessage(opener.key.remoteJid, { image: { url: imgUrl } }, {
                    upload: sock.waUploadToServer,
                });

                msg.message.messageContextInfo = {
                    messageSecret: crypto.randomBytes(32),
                    messageAssociation: {
                        associationType: 1,
                        parentMessageKey: opener.key,
                    },
                };

                await sock.relayMessage(msg.key.remoteJid, msg.message, {
                    messageId: msg.key.id,
                });
            }
        }

        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply(`❌ *FALLO AL OBTENER LOS DATOS*\n──────────\n☽◯☾ ♰ Lo siento, el sistema está teniendo problemas al comparar teléfonos desde *Carisinyal*. Inténtalo de nuevo más tarde.`);
    }
}

export { pluginConfig as config, handler };
