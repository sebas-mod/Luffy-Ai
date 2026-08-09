import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "rpg",
  alias: ["togglerpg"],
  category: "group",
  description: "Activar o desactivar la función RPG en el grupo",
  usage: ".rpg <on/off>",
  example: ".rpg on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const args = m.text?.trim()?.toLowerCase();

  if (args !== "on" && args !== "off") {
    return m.reply(
      `⚔️ *FUNCIÓN RPG DEL GRUPO*\n\n` +
        `Usa este comando para gestionar el acceso de los miembros a la función RPG.\n\n` +
        `• *${m.prefix}rpg on* - Los miembros pueden jugar RPG\n` +
        `• *${m.prefix}rpg off* - Los miembros no pueden jugar RPG\n\n` +
        `*Nota:* Los admins pueden acceder al RPG aunque esté desactivado.`,
    );
  }

  const db = getDatabase();
  const group = db.getGroup(m.chat) || db.setGroup(m.chat);

  const isEnable = args === "on";

  if (group.rpg === isEnable) {
    return m.reply(`⚔️ La función RPG ya está *${isEnable ? "ACTIVA" : "INACTIVA"}* en este grupo.`);
  }

  group.rpg = isEnable;
  db.setGroup(m.chat, group);

  await m.react("✅");
  return m.reply(
    `✅ Se *${isEnable ? "ACTIVÓ" : "DESACTIVÓ"}* correctamente la función RPG en este grupo!\n\n` +
    (isEnable
      ? `Los miembros ahora pueden usar todos los comandos del menú RPG.`
      : `Los miembros ya no podrán usar los comandos RPG.`),
  );
}

export { pluginConfig as config, handler };
