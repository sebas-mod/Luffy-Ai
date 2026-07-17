import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
    name: "notiflimit",
    alias: ["notifenergi"],
    category: "owner",
    description: "Activar o desactivar notificación de corte de límite globalmente.",
    usage: ".notiflimit",
    example: ".notiflimit",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true,
};

async function handler(m, { sock }) {
    const db = getDatabase();

    const currentStatus = db.setting("notiflimit") ?? false;
    db.setting("notiflimit", !currentStatus);

    const newStatus = db.setting("notiflimit") ? "ACTIVO ✅" : "APAGADO ❌";

    await m.reply(`*NOTIFICACIÓN DE LÍMITE (GLOBAL)*\n\nEstado actual: *${newStatus}*\n\n> Cuando está activo, el bot siempre notificará el límite restante de TODOS LOS USUARIOS cada vez que se haga un corte al usar funciones del bot.`);
}

export { pluginConfig as config, handler };
