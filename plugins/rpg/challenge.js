import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "challenge",
  alias: ["daily", "dailychallenge", "tantangan"],
  category: "rpg",
  description: "Desafío diario para premios especiales",
  usage: ".challenge",
  example: ".challenge",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

const CHALLENGES = [
  { name: "⚔️ Derrota 5 Monstruos", type: "kill", target: 5, reward: { gold: 500, exp: 200 } },
  { name: "🎣 Captura 3 Peces", type: "fish", target: 3, reward: { gold: 300, exp: 150 } },
  { name: "⛏️ Mina 10 Minerales", type: "mine", target: 10, reward: { gold: 400, exp: 180 } },
  { name: "🌱 Cosecha 5 Cultivos del Huerto", type: "harvest", target: 5, reward: { gold: 350, exp: 160 } },
  { name: "🧪 Prepara 3 Pócimas", type: "craft", target: 3, reward: { gold: 450, exp: 190 } },
  { name: "💰 Junta 1000 Berry", type: "earn", target: 1000, reward: { gold: 500, exp: 250 } },
  { name: "🗺️ Completa 2 Expediciones", type: "expedition", target: 2, reward: { gold: 600, exp: 300 } },
];

function getNewDailyChallenge() {
  return {
    ...CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)],
    progress: 0,
    date: new Date().toDateString(),
    claimed: false,
  };
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const today = new Date().toDateString();

  if (!user.rpg.dailyChallenge || user.rpg.dailyChallenge.date !== today) {
    user.rpg.dailyChallenge = getNewDailyChallenge();
    db.save();
  }

  const challenge = user.rpg.dailyChallenge;
  const isComplete = challenge.progress >= challenge.target;

  const args = m.args || [];
  const action = args[0]?.toLowerCase();

  if (action === "claim") {
    if (!isComplete) {
      return m.reply(`❌ ¡El desafío aún no está terminado bro!\nTu progreso actual: *${challenge.progress}/${challenge.target}*`);
    }

    if (challenge.claimed) {
      return m.reply(`Uy bro, la recompensa de hoy ya fue tomada! ¡Espera el nuevo desafío de mañana! 😉`);
    }

    user.berry = (user.berry || 0) + challenge.reward.gold;
    await addExpWithLevelCheck(sock, m, db, user, challenge.reward.exp);

    challenge.claimed = true;
    db.save();

    await m.react("🎉");
    return m.reply(
      `🎉 *¡¡DESAFÍO DIARIO COMPLETADO!!* 🎉\n\n` +
        `¡Buen trabajo bro! Esta es la recompensa del Guild para ti:\n` +
        `💰 Berry: *+Rp ${challenge.reward.gold.toLocaleString()}*\n` +
        `✨ EXP: *+${challenge.reward.exp}*\n` +
        `\n\n` +
        `> _¡Un nuevo desafío llegará mañana por la mañana!_`
    );
  }

  let txt = `📋 *DESAFÍO DIARIO DEL GUILD* 📋\n\n`;
  txt += `¡Completa la tarea especial de hoy para ganar dinero extra de bolsillo bro!\n\n`;
  
  txt += `*Tu Tarea de Hoy:*\n`;
  txt += `🎯 *${challenge.name}*\n`;
  txt += `📊 Progreso: *${challenge.progress}/${challenge.target}*\n`;
  txt += `Estado: ${isComplete ? "✅ *¡RECLAMABLE!*" : "⏳ _En progreso..._"}\n\n`;

  txt += `*🎁 Recompensa Extra:*\n`;
  txt += `💰 Berry: *Rp ${challenge.reward.gold.toLocaleString()}*\n`;
  txt += `✨ EXP: *${challenge.reward.exp}*\n\n`;

  if (isComplete && !challenge.claimed) {
    txt += `> 💡 ¡Apúrate y escribe \`${m.prefix}challenge claim\` para reclamar la recompensa bro!`;
  } else if (challenge.claimed) {
    txt += `> ✅ ¡Eres genial! La recompensa ya fue tomada. ¡Mañana habrá otra misión!`;
  } else {
    txt += `> ¡Échale ganas bro! Cuando termines, reclama tu recompensa.`;
  }

  return m.reply(txt);
}

export { pluginConfig as config, handler };
