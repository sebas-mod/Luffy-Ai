import axios from "axios";
import te from "../../src/lib/luffy-error.js";
import { uploadImage } from "../../src/lib/luffy-uploader.js";
import { downloadMediaMessage } from "ourin";

const pluginConfig = {
    name: "profileig",
    alias: ["profileig", "igprofile"],
    category: "canvas",
    description: "Crea canvas de perfil de Instagram",
    usage: ".profileig <seguidores>|<siguiendo>|<publicaciones>|<usuario>|<bio>|<verif(true/false)>",
    example: ".profileig 10M|1|150|jokowi|Presidente de RI|true",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 2,
    isEnabled: true,
};

async function handler(m, { sock, text }) {
    if (!text) return m.reply(`❖ Formato incorrecto!\n\n☽◯☾ ♰ Ejemplo: .profileig 10M|1|150|jokowi|Presidente de RI|true\n──────────\n☽◯☾ ♰ _Nota: Responde una imagen para usarla como foto de perfil._`);
    const [pengikut, mengikuti, postingan, username, bio, verif] = text.split("|").map(v => v.trim());
    if (!pengikut || !mengikuti || !postingan || !username || !bio || !verif) return m.reply(`♰ ┄ ── ☽◯☾ ── ┄ ♰\n⚠️ Asegúrate de que todos los argumentos estén completos y separados por el signo |.`);

    let imgUrl = "";
    const isImage = m.type === "imageMessage" || (m.quoted && m.quoted.type === "imageMessage");

    await m.react("🕕");
    try {
        if (isImage) {
            const msg = m.quoted ? m.quoted : m;
            const buffer = await downloadMediaMessage(msg, "buffer", {}, { logger: console });
            imgUrl = await uploadImage(buffer);
        } else {
            try {
                imgUrl = await sock.profilePictureUrl(m.sender, 'image');
            } catch (e) {
                // If user doesn't have a profile picture, provide a default URL
                imgUrl = "https://i.ibb.co/3Fh9Q6M/blank-profile-picture.png";
            }
        }

        const url = `https://kyzznekoo.zone.id/api/canvas/profileig?url=${encodeURIComponent(imgUrl)}&pengikut=${encodeURIComponent(pengikut)}&mengikuti=${encodeURIComponent(mengikuti)}&postingan=${encodeURIComponent(postingan)}&username=${encodeURIComponent(username)}&bio=${encodeURIComponent(bio)}&verif=${encodeURIComponent(verif)}`;

        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
                "Content-Type": "application/json"
            }
        });

        await sock.sendMessage(m.chat, { image: Buffer.from(res.data), caption: "♰ ┄ ── ☽◯☾ ── ┄ ♰\n✅ Perfil IG creado con éxito" }, { quoted: m });
        await m.react("✅");
    } catch (e) {
        console.error("[ProfileIG Error]", e);
        await m.react("❌");
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler };
