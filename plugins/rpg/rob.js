import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";
import { sendRpgPreview } from "../../src/lib/luffy-context.js";

const pluginConfig = {
  name: "rob",
  alias: ["rampok", "mug"],
  category: "rpg",
  description: "Asaltar el dinero de otro jugador (arriesgado)",
  usage: ".rob @user",
  example: ".rob @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 600,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();

  const target = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!target) {
    return m.reply(`Vaya, ¿a quién piensas asaltar? 🦹‍♂️🔪\nEtiqueta al objetivo que quieres robar!\nEjemplo: \`.rob @user\``);
  }

  if (target === m.sender) {
    return m.reply(`¿Estás enfermo? ¿Robarte tu propia cartera? 😂❌`);
  }

  const robber = db.getUser(m.sender);
  const victim = db.getUser(target);

  if (!victim) {
    return m.reply(`Tu objetivo no aparece en la base de datos! Parece que ya huyó. 🏃💨`);
  }

  if ((victim.berry || 0) < 1000) {
    return m.reply(`Vaya, tu objetivo está pobre de verdad! Tiene menos de Rp 1.000, ¿cómo vas a robarlo? ¡Busca una presa más rica! 😤`);
  }

  if (!robber.rpg) robber.rpg = {};
  robber.rpg.health = robber.rpg.health || 100;

  if (robber.rpg.health < 30) {
    return m.reply(`Oye jefe, estás hecho un esqueleto y ¿aún te atreves a robar?! 🤒\nNecesitas mínimo *30 HP*, solo tienes *${robber.rpg.health} HP*. ¡Ve a curarte!`);
  }

  await sendRpgPreview(sock, m.chat, `*Sssstttt...* Escondiéndote en un callejón oscuro esperando al objetivo... 🦹‍♂️🔪`, "🦹 ASALTANTE", "¡En acción!", { quoted: m });
  await new Promise((r) => setTimeout(r, 2500));

  const successRate = 0.4;
  const isSuccess = Math.random() < successRate;

  if (isSuccess) {
    const maxSteal = Math.floor((victim.berry || 0) * 0.3);
    const stolen = Math.floor(Math.random() * maxSteal) + 1000;

    victim.berry = (victim.berry || 0) - stolen;
    robber.berry = (robber.berry || 0) + stolen;

    const expGain = 300;
    await addExpWithLevelCheck(sock, m, db, robber, expGain);

    db.save();

    let txt = `¡GENIAL! ¡EL OBJETIVO FUE ASALTADO! 🦹‍♂️💰\n\n`;
    txt += `Lograste asustar a @${target.split("@")[0]} hasta que se orinó del susto!\n`;
    txt += `Dinero robado: *+Rp ${stolen.toLocaleString("id-ID")}*\n`;
    txt += `EXP Bonus de Asalto: *+${expGain}*\n\n`;
    txt += `*¡Corre antes de que llegue la policía!!!* 🚓💨`;

    await m.reply(txt, { mentions: [target] });
  } else {
    const fine = Math.floor(Math.random() * 10000) + 5000;
    const actualFine = Math.min(fine, robber.berry || 0);
    const healthLoss = 25;

    robber.berry = Math.max(0, (robber.berry || 0) - actualFine);
    robber.rpg.health = Math.max(0, robber.rpg.health - healthLoss);

    db.save();

    let txt = `¡TORPE! ¡LOS VECINOS TE DESCUBRIERON!! 🚨🤬\n\n`;
    txt += `En vez de dinero, te atraparon en el acto y *todo el vecindario te dio una paliza*!\n`;
    txt += `💸 Tu dinero fue confiscado: *-Rp ${actualFine.toLocaleString("id-ID")}*\n`;
    txt += `🤕 Cuerpo Magullado: *-${healthLoss} HP*\n\n`;
    txt += `*¡TE LO MERECES, no andes de travieso por aquí!* 🤣`;

    await m.reply(txt);
  }
}

export { pluginConfig as config, handler };
