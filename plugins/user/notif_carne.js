import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
    name: "notif_carne",
    alias: ["notiflimite"],
    category: "owner",
    description: "Activar o desactivar la notificación de descuento de carne globalmente.",
    usage: ".notifcarne",
    example: ".notifcarne",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    carne: 0,
    isEnabled: true,
};

async function handler(m, { sock }) {
    const db = getDatabase();

    const currentStatus = db.setting("notifcarne") ?? false;
    db.setting("notifcarne", !currentStatus);

    const newStatus = db.setting("notifcarne") ? "ACTIVADO ✅" : "APAGADO ❌";

    await m.reply(`☽◯☾ ╭━ ♰ 🔔 NOTIFICACIÓN ♰ ━╮ ☽◯☾\n\n*NOTIFICACIÓN DE CARNE (GLOBAL)*\n\n♰ ──────── ♱\n\nEstado actual: *${newStatus}*\n\n> Cuando está activo, el bot siempre notificará la carne restante de TODOS LOS USUARIOS cada vez que haya un descuento al usar las funciones del bot.\n\n╰━ ⊱༺༒༻⊰ ━╯`);
}

export { pluginConfig as config, handler };
