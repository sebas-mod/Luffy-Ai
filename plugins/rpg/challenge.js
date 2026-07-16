import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "challenge",
  alias: ["daily", "dailychallenge", "tantangan"],
  category: "rpg",
  description: "Desafíos diarios para recompensas especiales",
  usage: ".challenge",
  example: ".challenge",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const CHALLENGES = [
  { name: "⚔️ Derrotar 5 Monstruos", type: "kill", target: 5, reward: { gold: 500, exp: 200 } },
  { name: "🎣 Pescar 3 Peces", type: "fish", target: 3, reward: { gold: 300, exp: 150 } },
  { name: "⛏️ Minar 10 Minerales", type: "mine", target: 10, reward: { gold: 400, exp: 180 } },
  { name: "🌱 Cosechar 5 Cultivos", type: "harvest", target: 5, reward: { gold: 350, exp: 160 } },
  { name: "🧪 Preparar 3 Pociones", type: "craft", target: 3, reward: { gold: 450, exp: 190 } },
  { name: "💰 Recoger 1000 Monedas", type: "earn", target: 1000, reward: { gold: 500, exp: 250 } },
  { name: "🗺️ Completar 2 Expediciones", type: "expedition", target: 2, reward: { gold: 600, exp: 300 } },
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
      return m.reply(`❌ ¡El desafío no está terminado!\nTu progreso: *${challenge.progress}/${challenge.target}*`);
    }

    if (challenge.claimed) {
      return m.reply(`¡Ya reclamaste la recompensa de hoy! Espera al desafío de mañana. 😉`);
    }

    user.koin = (user.koin || 0) + challenge.reward.gold;
    await addExpWithLevelCheck(sock, m, db, user, challenge.reward.exp);

    challenge.claimed = true;
    db.save();

    await m.react("🎉");
    return m.reply(
      `🎉 *TANTANGAN HARIAN SELESAI!!* 🎉\n\n` +
        `¡Buen trabajo! Aquí está tu recompensa del Guild:\n` +
        `💰 Koin: *+Rp ${challenge.reward.gold.toLocaleString()}*\n` +
        `✨ EXP: *+${challenge.reward.exp}*\n` +
        `\n\n` +
        `> _¡Nuevos desafíos se entregarán mañana por la mañana!_`
    );
  }

  txt += `📋 *DESAFÍOS DIARIOS DEL GUILD* 📋\n\n`;
  txt += `¡Completa las tareas especiales de hoy para ganar dinero extra!\n\n`;
  
  txt += `*Tu Tarea de Hoy:*\n`;
  txt += `🎯 *${challenge.name}*\n`;
  txt += `📊 Progreso: *${challenge.progress}/${challenge.target}*\n`;
  txt += `Status: ${isComplete ? "✅ ¡¡LISTO PARA RECLAMAR!!" : "⏳ _En progreso..._"}\n\n`;

  txt += `*🎁 Recompensa Extra:*\n`;
  txt += `💰 Koin: *Rp ${challenge.reward.gold.toLocaleString()}*\n`;
  txt += `✨ EXP: *${challenge.reward.exp}*\n\n`;

  if (isComplete && !challenge.claimed) {
    txt += `> 💡 ¡Escribe \`${m.prefix}challenge claim\` para reclamar tu recompensa!`;
  } else if (challenge.claimed) {
    txt += `> ✅ ¡Eres genial! Ya reclamaste la recompensa. ¡Mañana habrá nueva misi!`;
  } else {
    txt += `> ¡Esfuérzate en completarla! Cuando termines, reclama tu recompensa.`;
  }

  return m.reply(txt);
}

export { pluginConfig as config, handler };
