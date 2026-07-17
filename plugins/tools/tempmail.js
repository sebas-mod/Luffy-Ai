import { getDatabase } from "../../src/lib/ourin-database.js";
import { TempMailCreate, TempMailInbox } from "../../src/scraper/tempmail.js";

const pluginConfig = {
  name: "tempmail",
  alias: ["tmpmail", "tmp", "trashmail"],
  category: "tools",
  description: "Crear correo temporal y revisar bandeja de entrada",
  usage: ".tempmail create/inbox",
  example: ".tempmail create",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const saved = db.getUser(m.sender)?.tempmail;
    return m.reply(
      `📧 *Temp Mail*\n\n` +
        `Crea un correo temporal que puede recibir mensajes — perfecto para registrar cuentas sin usar tu correo real.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}tempmail create* — Crear correo nuevo\n` +
        `> *${m.prefix}tempmail inbox* — Revisar bandeja de entrada\n\n` +
        (saved
          ? `> Email activo: *${saved}*\n`
          : `> No tienes correo, escribe *${m.prefix}tempmail create* primero\n`) +
        `\n_Este correo es temporal, puede desaparecer en cualquier momento_`
    );
  }

  if (option === "create") {
    m.react("🕕");
    const result = await TempMailCreate();

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌ *Error al Crear Correo*\n\n> ${result.error}`);
    }

    const userData = db.getUser(m.sender) || {};
    userData.tempmail = result.email;
    db.setUser(m.sender, userData);

    m.react("✅");
    return m.reply(
      `📧 *¡Correo Temporal Creado!*\n\n` +
        `> 📬 Correo: *${result.email}*\n\n` +
        `Ahora puedes usar este correo para registrarte en cualquier cosa.\n` +
        `Revisa tu bandeja de entrada con *${m.prefix}tempmail inbox*\n\n` +
        `_Este correo es temporal, no lo uses para cosas importantes_`
    );
  }

  if (option === "inbox") {
    const saved = db.getUser(m.sender)?.tempmail;
    if (!saved) {
      m.react("❌");
      return m.reply(
        `❌ *Aún No Tienes Correo*\n\n` +
          `No has creado un correo temporal aún.\n` +
          `Escribe *${m.prefix}tempmail create* primero.`
      );
    }

    m.react("🕕");
    const result = await TempMailInbox(saved);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌ *Error al Revisar Bandeja*\n\n> ${result.error}`);
    }

    if (result.count === 0) {
      m.react("📭");
      return m.reply(
        `📭 *Bandeja Vacía*\n\n` +
          `> Correo: *${saved}*\n\n` +
          `Aún no hay mensajes. Intenta de nuevo más tarde.`
      );
    }

    let txt = `📬 *Bandeja — ${result.count} Mensajes*\n\n`;
    txt += `> Email: *${saved}*\n\n`;

    for (const msg of result.messages) {
      txt += `*━━━━━━━━━━━━━━━━━━━━*\n`;
      txt += `> 📧 De: *${msg.from}*\n`;
      txt += `> 📌 Asunto: *${msg.subject}*\n`;
      txt += `> 🕐 ${msg.created_at}\n`;
      txt += `> 📝 ${msg.body_text?.substring(0, 500) || "(sin contenido)"}\n\n`;
    }

    m.react("✅");
    return m.reply(txt.trim());
  }

  return m.reply(
    `❌ *Opción No Válida*\n\n> Usa *${m.prefix}tempmail create* o *${m.prefix}tempmail inbox*`
  );
}

export { pluginConfig as config, handler };
