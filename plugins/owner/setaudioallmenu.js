import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
    name: "setaudioallmenu",
    alias: ["setaudioam", "audioallmenu"],
    category: "owner",
  description: "Configura el estilo de audio para All Menu",
    usage: ".setaudioallmenu <1-4>",
    example: ".setaudioallmenu 1",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    const db = getDatabase();
    const args = m.text?.trim();

    if (!args) {
        return m.reply(
            `⚠️ *PENGATURAN AUDIO ALL MENU*\n\n` +
            `Sistema de gestión de estilo de audio especial para la vista All Menu.\n\n` +
            `*PENGGUNAAN:*\n` +
            `• *${m.prefix}setaudioallmenu 1* — PTT Voice Note con reply mensaje asli\n` +
            `• *${m.prefix}setaudioallmenu 2* — PTT Voice Note con reply faa polling\n` +
            `• *${m.prefix}setaudioallmenu 3* — Audio musik biasa con reply faa text\n` +
            `• *${m.prefix}setaudioallmenu 4* — Audio musik biasa con reply faa troli order\n\n` +
            `*PENJELASAN VARIAN:*\n` +
            `- *Varian 1 & 2* va a de forma automáticamente convertirá automáticamente los archivos MP3 a Opus (Voice Note) puro usando ffmpeg, para que se vea más natural como una grabación de voz real.\n` +
            `- *Varian 3 & 4* enviará el archivo en formato MP3 sin conversión, pero usando *Faa Quoted* que se ve elegante en la pantalla del chat.\n\n` +
            `Actualmente All Menu mengusa varian: *${db.setting("allmenuAudioStyle") || 1}*`
        );
    }

    const newStyle = parseInt(args);
    if (isNaN(newStyle) || newStyle < 1 || newStyle > 4) {
        return m.reply(`❌ *GAGAL*\n\nLa opción de variante de audio debe ser un número del 1 al 4.\nEjemplo: *${m.prefix}setaudioallmenu 2*`);
    }

    await m.react("🕕");
    db.setting("allmenuAudioStyle", newStyle);
    db.save();
    await m.reply(`✅ *BERHASIL*\n\nGaya audio All Menu ha sido exitosamente cambiado a *Varian ${newStyle}*. Por favor prueba escribiendo *${m.prefix}allmenu*.`);
    await m.react("✅");
}

export { pluginConfig as config, handler };
