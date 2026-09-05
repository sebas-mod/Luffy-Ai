import axios from "axios";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
    name: "fakegopay",
    alias: [],
    category: "canvas",
    description: "Crea canvas de fake gopay",
    usage: ".fakegopay <saldo>|<moneda>|<usado>|<mes>",
    example: ".fakegopay 100000|500|20000|Enero",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 2,
    isEnabled: true,
};

async function handler(m, { sock, text }) {
    if (!text) return m.reply(`❖ Formato incorrecto!\n\n☽◯☾ ♰ Ejemplo: .fakegopay 100000|500|20000|Enero`);
    const [saldo, coin, terpakai, bulan] = text.split("|").map(v => v.trim());
    if (!saldo || !coin || !terpakai || !bulan) return m.reply(`♰ ┄ ── ☽◯☾ ── ┄ ♰\n⚠️ Asegúrate de que todos los argumentos estén completos y separados por el signo |.`);
    
    await m.react("🕕");
    try {
        const url = `https://kyzznekoo.zone.id/api/canvas/fakegopay?saldo=${encodeURIComponent(saldo)}&coin=${encodeURIComponent(coin)}&terpakai=${encodeURIComponent(terpakai)}&bulan=${encodeURIComponent(bulan)}`;
        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
                "Content-Type": "application/json"
            }
        });
        await sock.sendMessage(m.chat, { image: Buffer.from(res.data), caption: "♰ ┄ ── ☽◯☾ ── ┄ ♰\n✅ Fake gopay creado con éxito" }, { quoted: m });
        await m.react("✅");
    } catch (e) {
        console.error("[FakeGopay Error]", e);
        await m.react("❌");
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler };
