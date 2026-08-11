import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "divorce",
  alias: ["cerai", "pisah"],
  category: "rpg",
  description: "Divorciarte de tu pareja",
  usage: ".divorce",
  example: ".divorce",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  if (!user.rpg.spouse) {
    return m.reply(`¿Delirando mucho...? Ni siquiera estás casado y ya quieres divorciarte? 😂💔\n¡Busca pareja primero con \`.marry @user\``);
  }

  const spouseJid = user.rpg.spouse;
  const partner = db.getUser(spouseJid);

  const divorceCost = 25000;
  if ((user.berry || 0) < divorceCost) {
    return m.reply(`Uy, los honorarios del abogado para divorciarse son caros jefe! 😭\nNecesitas *Rp 25.000* para firmar el acta de divorcio, solo tienes *Rp ${(user.berry || 0).toLocaleString("id-ID")}*.\n¡Aguanta la pelea un poco más!`);
  }

  user.berry -= divorceCost;
  user.rpg.spouse = null;
  user.rpg.marriedAt = null;

  if (partner && partner.rpg) {
    partner.rpg.spouse = null;
    partner.rpg.marriedAt = null;
  }

  db.save();

  await m.react("💔");

  let txt = `⛈️ *JUICIO DE DIVORCIO CONCLUIDO* ⛈️\n\n`;
  txt += `El martillo ha golpeado. Con pesar, la relación entre:\n`;
  txt += `💔 @${m.sender.split("@")[0]}\n`;
  txt += `         -- SE ROMPE CON --\n`;
  txt += `💔 @${spouseJid.split("@")[0]}\n\n`;
  txt += `😭 *¡OFICIALMENTE TERMINADO! ¡AHORA ESTÁN SOLTEROS OTRA VEZ!* 😭\n\n`;
  txt += `💸 Honorarios del Abogado/Juicio: *Rp -${divorceCost.toLocaleString("id-ID")}*\n\n`;
  txt += `> _"Ya ya... lloren en un rincón. La vida sigue..." - Juez Bot_ 🥀🚬`;

  await m.reply(txt, { mentions: [m.sender, spouseJid] });
}

export { pluginConfig as config, handler };
