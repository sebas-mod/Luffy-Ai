import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
import { sendRpgPreview } from "../../src/lib/ourin-context.js";

const pluginConfig = {
  name: "rob",
  alias: ["rampok", "mug"],
  category: "rpg",
  description: "Robar dinero a otros jugadores (riesgoso)",
  usage: ".rob @user",
  example: ".rob @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 600,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();

  const target = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!target) {
    return m.reply(`Oye, ¿a quién vas a asaltar? 🦹‍♂️🔪\n¡Etiqueta al objetivo que quieres robar!\nEjemplo: \`.rob @user\``);
  }

  if (target === m.sender) {
    return m.reply(`¿Estás loco? ¿Robarle a tu propia cartera? 😂❌`);
  }

  const robber = db.getUser(m.sender);
  const victim = db.getUser(target);

  if (!victim) {
    return m.reply(`¡No se encontró al objetivo en la base de datos! Parece que ya huyó. 🏃💨`);
  }

  if ((victim.koin || 0) < 1000) {
    return m.reply(`Vaya, ¡tu objetivo está en la pobreza total! Tiene menos de Rp 1.000, ¿cómo vas a robarle? ¡Busca a alguien con más dinero! 😤`);
  }

  if (!robber.rpg) robber.rpg = {};
  robber.rpg.health = robber.rpg.health || 100;

  if (robber.rpg.health < 30) {
    return m.reply(`Oye jefe, ¡estás hecho polvo y aun así quieres asaltar?! 🤒\nNecesitas mínimo *30 HP*, tu vida es solo *${robber.rpg.health} HP*. ¡Ve a curarte!`);
  }

  await sendRpgPreview(sock, m.chat, `*Sssstttt...* Bersembunyi di gang gelap nunggu target lewat... 🦹‍♂️🔪`, "🦹 BEGAL", "Beraksi!", { quoted: m });
  await new Promise((r) => setTimeout(r, 2500));

  const successRate = 0.4;
  const isSuccess = Math.random() < successRate;

  if (isSuccess) {
    const maxSteal = Math.floor((victim.koin || 0) * 0.3);
    const stolen = Math.floor(Math.random() * maxSteal) + 1000;

    victim.koin = (victim.koin || 0) - stolen;
    robber.koin = (robber.koin || 0) + stolen;

    const expGain = 300;
    await addExpWithLevelCheck(sock, m, db, robber, expGain);

    db.save();

    let txt = `¡GENIAL! ¡OBJETIVO ASALTADO CON ÉXITO! 🦹‍♂️💰\n\n`;
    txt += `¡Asustaste a @${target.split("@")[0]} hasta que se hizo pipí encima!\n`;
    txt += `Dinero robado: *+Rp ${stolen.toLocaleString("id-ID")}*\n`;
    txt += `Bonus EXP del asalto: *+${expGain}*\n\n`;
    txt += `*¡¡¡Corre antes de que llegue la policía!!!* 🚓💨`;

    await m.reply(txt, { mentions: [target] });
  } else {
    const fine = Math.floor(Math.random() * 10000) + 5000;
    const actualFine = Math.min(fine, robber.koin || 0);
    const healthLoss = 25;

    robber.koin = Math.max(0, (robber.koin || 0) - actualFine);
    robber.rpg.health = Math.max(0, robber.rpg.health - healthLoss);

    db.save();

    let txt = `¡¡IDIOTA! ¡¡TE PILLARON LOS VECINOS!! 🚨🤬\n\n`;
    txt += `En vez de ganar dinero, ¡te atraparon y te *montonaron a palazos todo el barrio*!\n`;
    txt += `💸 Tu dinero confiscado: *-Rp ${actualFine.toLocaleString("id-ID")}*\n`;
    txt += `🤕 Cuerpo apaleado: *-${healthLoss} HP*\n\n`;
    txt += `*¡¡TE LO MERECES, para que no juegues aquí!!* 🤣`;

    await m.reply(txt);
  }
}

export { pluginConfig as config, handler };
