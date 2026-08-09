import { getDatabase } from "../../src/lib/luffy-database.js";
import { TempMailCreate, TempMailInbox } from "../../src/scraper/tempmail.js";

const pluginConfig = {
  name: "tempmail",
  alias: ["tmpmail", "tmp", "trashmail"],
  category: "tools",
  description: "Crea un email temporal y revisa la bandeja de entrada",
  usage: ".tempmail create/inbox",
  example: ".tempmail create",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const saved = db.getUser(m.sender)?.tempmail;
    return m.reply(
      `📧 *Temp Mail*\n\n` +
        `Crea un email temporal que puede recibir mensajes, ideal para registrarte en cuentas sin dar tu email real.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}tempmail create* — Crear un email nuevo\n` +
        `> *${m.prefix}tempmail inbox* — Revisar los mensajes recibidos\n\n` +
        (saved
          ? `> Email activo: *${saved}*\n`
          : `> Aún no tienes email, escribe *${m.prefix}tempmail create* primero\n`) +
        `\n_Este email es temporal y puede desaparecer en cualquier momento_`
    );
  }

  if (option === "create") {
    m.react("🕕");
    const result = await TempMailCreate();

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌ *Fallo al crear el email*\n\n> ${result.error}`);
    }

    const userData = db.getUser(m.sender) || {};
    userData.tempmail = result.email;
    db.setUser(m.sender, userData);

    m.react("✅");
    return m.reply(
      `📧 *¡Email Temporal Creado!*\n\n` +
        `> 📬 Email: *${result.email}*\n\n` +
        `Ahora puedes usar este email para registrarte en lo que quieras.\n` +
        `Revisa los mensajes recibidos con *${m.prefix}tempmail inbox*\n\n` +
        `_Este email es temporal, no lo uses para cosas importantes_`
    );
  }

  if (option === "inbox") {
    const saved = db.getUser(m.sender)?.tempmail;
    if (!saved) {
      m.react("❌");
      return m.reply(
        `❌ *No Hay Email*\n\n` +
          `Aún no has creado un email temporal.\n` +
          `Escribe *${m.prefix}tempmail create* primero.`
      );
    }

    m.react("🕕");
    const result = await TempMailInbox(saved);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌ *Fallo al revisar la bandeja de entrada*\n\n> ${result.error}`);
    }

    if (result.count === 0) {
      m.react("📭");
      return m.reply(
        `📭 *Bandeja de Entrada Vacía*\n\n` +
          `> Email: *${saved}*\n\n` +
          `Aún no hay mensajes. Intenta revisar más tarde.`
      );
    }

    let txt = `📬 *Bandeja de Entrada — ${result.count} Mensajes*\n\n`;
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
    `❌ *Opción Inválida*\n\n> Usa *${m.prefix}tempmail create* o *${m.prefix}tempmail inbox*`
  );
}

export { pluginConfig as config, handler };
