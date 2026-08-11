import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
    name: "configurar_audio_menu",
    alias: ["setaudioam", "audioallmenu"],
    category: "owner",
    description: "Configurar el estilo de audio para All Menu",
    usage: ".setaudioallmenu <1-4>",
    example: ".setaudioallmenu 1",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    carne: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    const db = getDatabase();
    const args = m.text?.trim();

    if (!args) {
        return m.reply(
            `⚠️ *CONFIGURACIÓN DE AUDIO ALL MENU*\n\n` +
            `Sistema de gestión del estilo de audio para la visualización de All Menu.\n\n` +
            `*USO:*\n` +
            `• *${m.prefix}configurar_audio_menu 1* — PTT Voice Note con reply al mensaje original\n` +
            `• *${m.prefix}configurar_audio_menu 2* — PTT Voice Note con reply fake de encuesta\n` +
            `• *${m.prefix}configurar_audio_menu 3* — Audio de música normal con reply fake de texto\n` +
            `• *${m.prefix}configurar_audio_menu 4* — Audio de música normal con reply fake de carrito de pedido\n\n` +
            `*EXPLICACIÓN DE VARIANTES:*\n` +
            `- *Variant 1 y 2* convierten automáticamente el archivo MP3 a Opus (Voice Note) puro usando ffmpeg, por lo que se ve más natural, como una grabación de voz real.\n` +
            `- *Variant 3 y 4* envían el archivo en formato MP3 normal sin conversión, pero usando *Fake Quoted* que se ve elegante y llamativo en la pantalla del chat.\n\n` +
            `Actualmente All Menu usa la variante: *${db.setting("allmenuAudioStyle") || 1}*`
        );
    }

    const newStyle = parseInt(args);
    if (isNaN(newStyle) || newStyle < 1 || newStyle > 4) {
        return m.reply(`❌ *FALLIDO*\n\nLa opción de variante de audio debe ser un número del 1 al 4.\nEjemplo: *${m.prefix}configurar_audio_menu 2*`);
    }

    await m.react("🕕");
    db.setting("allmenuAudioStyle", newStyle);
    await m.reply(`✅ *EXITOSO*\n\nEl estilo de audio de All Menu se cambió correctamente a *Variante ${newStyle}*. Haz una prueba escribiendo *${m.prefix}menu_todo*.`);
    await m.react("✅");
}

export { pluginConfig as config, handler };
