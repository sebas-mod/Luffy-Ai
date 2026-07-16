import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "divorce",
  alias: ["cerai", "pisah"],
  category: "rpg",
  description: "Divorciarse de tu pareja",
  usage: ".divorce",
  example: ".divorce",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  if (!user.rpg.spouse) {
    return m.reply(`Alucinación nivel extremo... ¿Todavía no te has casado y ya quieres divorciarte? 😂💔\nBusca una pareja primero usando \`.marry @user\``);
  }

  const spouseJid = user.rpg.spouse;
  const partner = db.getUser(spouseJid);

  const divorceCost = 25000;
  if ((user.koin || 0) < divorceCost) {
    return m.reply(`¡Uf, los honorarios del abogado para divorciarte son caros! 😭\nNecesitas *Rp 25.000* para firmar los papeles, tu dinero es solo *Rp ${(user.koin || 0).toLocaleString("id-ID")}*.\n¡Aguanta un poco más peleando!`);
  }

  user.koin -= divorceCost;
  user.rpg.spouse = null;
  user.rpg.marriedAt = null;

  if (partner && partner.rpg) {
    partner.rpg.spouse = null;
    partner.rpg.marriedAt = null;
  }

  db.save();

  await m.react("💔");

  let txt = `⛈️ *SIDANG PERCERAIAN SELESAI* ⛈️\n\n`;
  txt += `El martillo ha caído. Con pesar, la relación entre:\n`;
  txt += `💔 @${m.sender.split("@")[0]}\n`;
  txt += `         -- PUTUS DENGAN --\n`;
  txt += `💔 @${spouseJid.split("@")[0]}\n\n`;
  txt += `😭 *RESMI BERAKHIR! KINI KALIAN KEMBALI JOMBLO!* 😭\n\n`;
  txt += `💸 Biaya Pengacara/Sidang: *Rp -${divorceCost.toLocaleString("id-ID")}*\n\n`;
  txt += `> _"Ya basta... llora en un rincón. ¡La vida debe continuar!" - Juez Bot_ 🥀🚬`;

  await m.reply(txt, { mentions: [m.sender, spouseJid] });
}

export { pluginConfig as config, handler };
