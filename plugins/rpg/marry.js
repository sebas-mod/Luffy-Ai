import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "marry",
  alias: ["nikah", "wedding", "propose"],
  category: "rpg",
  description: "Casarse con otro jugador",
  usage: ".marry @user",
  example: ".marry @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const target = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!target) {
    let txt = `💒 *CATATAN SIPIL RPG* 💒\n\n`;
    txt += `¡¿Quieres proponerle matrimonio a tu ser amado? ¡Menciona a la persona aquí!\n\n`;
    txt += `*Cómo Proponer:*\n`;
    txt += `👉 \`${m.prefix}marry @user\`\n\n`;
    txt += `*Requisitos:* \n`;
    txt += `💍 Costo de Boda: *Rp 50.000*\n`;
    txt += `(¡Asegúrate de que no tenga pareja!)`;
    return m.reply(txt);
  }

  if (target === m.sender) {
    return m.reply(`Pobrecito, soltero crónico... ¿Quieres casarte contigo mismo? ¡Busca a alguien! 😭💔`);
  }

  const partner = db.getUser(target) || db.setUser(target);
  if (!partner.rpg) partner.rpg = {};

  if (user.rpg.spouse) {
    return m.reply(`¡EY! Ya tienes pareja, @${user.rpg.spouse.split("@")[0]}!\n¿Quieres poligamia? ¡En este servidor no está permitido! Divórciate primero usando \`.divorce\` 😡🔪`, { mentions: [user.rpg.spouse] });
  }

  if (partner.rpg.spouse) {
    return m.reply(`Dolor sin sangre... 🥀\n@${target.split("@")[0]} resulta que ya está casado con otra persona!\nTu avance se detuvo en la *zona de amigos*...`, { mentions: [target] });
  }

  const marriageCost = 50000;
  if ((user.koin || 0) < marriageCost) {
    return m.reply(`Dios mío... ¿pobre pero insistiendo en casarte? 🤦‍♂️\nEl costo de la boda y el catering es *Rp 50.000*, pero solo tienes *Rp ${(user.koin || 0).toLocaleString("id-ID")}*.\n¡Trabaja duro primero, hermano!`);
  }

  user.koin -= marriageCost;
  user.rpg.spouse = target;
  user.rpg.marriedAt = Date.now();
  partner.rpg.spouse = m.sender;
  partner.rpg.marriedAt = Date.now();

  db.save();

  await m.react("💍");

  let txt = `💒 *PENGUMUMAN PERNIKAHAN!!* 💒\n\n`;
  txt += `Todos los habitantes del servidor felicitan a:\n\n`;
  txt += `👨‍💼/👰 @${m.sender.split("@")[0]}\n`;
  txt += `           💖 con 💖\n`;
  txt += `👨‍💼/👰 @${target.split("@")[0]}\n\n`;
  txt += `🎉 *¡SON OFICIALMENTE UNA PAREJA!* 🎉\n\n`;
  txt += `💍 Costo de Recepción: *Rp -${marriageCost.toLocaleString("id-ID")}*\n\n`;
  txt += `> _"¡Que duren hasta el último día de este servidor!" - Sacerdote Bot_ 🥺💕`;

  await m.reply(txt, { mentions: [m.sender, target] });
}

export { pluginConfig as config, handler };
