import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "marry",
  alias: ["nikah", "wedding", "propose"],
  category: "rpg",
  description: "Menikahi player lain",
  usage: ".marry @user",
  example: ".marry @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 60,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const target = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!target) {
    let txt = `💒 *REGISTRO CIVIL RPG* 💒\n\n`;
    txt += `¿Quieres proponerle a tu amado? ¡Etiquétalo aquí!\n\n`;
    txt += `*Cómo Proponer:*\n`;
    txt += `👉 \`${m.prefix}marry @user\`\n\n`;
    txt += `*Requisitos:* \n`;
    txt += `💍 Costo de la Boda: *Rp 50.000*\n`;
    txt += `(¡Asegúrate de que aún no tenga pareja!)`;
    return m.reply(txt);
  }

  if (target === m.sender) {
    return m.reply(`Qué pena, qué solterón crónico... ¿Casarte contigo mismo? ¡Busca pareja de verdad! 😭💔`);
  }

  const partner = db.getUser(target) || db.setUser(target);
  if (!partner.rpg) partner.rpg = {};

  if (user.rpg.spouse) {
    return m.reply(`¡OYE! Ya tienes pareja, la @${user.rpg.spouse.split("@")[0]}!\n¿Poligamia? ¡En este servidor no está permitido! ¡Divórciate primero con \`.divorce\` 😡🔪`, { mentions: [user.rpg.spouse] });
  }

  if (partner.rpg.spouse) {
    return m.reply(`Un dolor sin sangre... 🥀\n@${target.split("@")[0]} resulta que ya está casado con otra persona!\nTu paso se detuvo en la *friendzone*...`, { mentions: [target] });
  }

  const marriageCost = 50000;
  if ((user.berry || 0) < marriageCost) {
    return m.reply(`Vaya... ¿pobre y aun así quieres casarte? 🤦‍♂️\nEl costo del registro y el banquete es *Rp 50.000*, pero solo tienes *Rp ${(user.berry || 0).toLocaleString("id-ID")}*.\n¡Trabaja duro primero campeón!`);
  }

  user.berry -= marriageCost;
  user.rpg.spouse = target;
  user.rpg.marriedAt = Date.now();
  partner.rpg.spouse = m.sender;
  partner.rpg.marriedAt = Date.now();

  db.save();

  await m.react("💍");

  let txt = `💒 *¡¡ANUNCIO DE BODA!!* 💒\n\n`;
  txt += `Todos los habitantes del servidor felicitan a:\n\n`;
  txt += `👨‍💼/👰 @${m.sender.split("@")[0]}\n`;
  txt += `           💖 con 💖\n`;
  txt += `👨‍💼/👰 @${target.split("@")[0]}\n\n`;
  txt += `🎉 *¡SON OFICIALMENTE PAREJA!* 🎉\n\n`;
  txt += `💍 Costo de la Recepción: *Rp -${marriageCost.toLocaleString("id-ID")}*\n\n`;
  txt += `> _"¡Que duren hasta el final de este servidor!" - El Cura del Bot_ 🥺💕`;

  await m.reply(txt, { mentions: [m.sender, target] });
}

export { pluginConfig as config, handler };
