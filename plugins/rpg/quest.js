import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "quest",
  alias: ["misi", "mission", "bounty"],
  category: "rpg",
  description: "Tomar misiones diarias para recompensas extra",
  usage: ".quest",
  example: ".quest",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

const QUESTS = [
  {
    id: "mining5",
    name: "Minero Principiante",
    desc: "Minar 5 veces",
    target: 5,
    reward: { money: 10000, exp: 1000 },
  },
  {
    id: "fishing5",
    name: "Pescador Hábil",
    desc: "Pescar 5 veces",
    target: 5,
    reward: { money: 8000, exp: 800 },
  },
  {
    id: "adventure3",
    name: "Aventurero Verdadero",
    desc: "Aventura 3 veces",
    target: 3,
    reward: { money: 15000, exp: 1500 },
  },
  {
    id: "work10",
    name: "Trabajador Incansable",
    desc: "Trabajar 10 veces",
    target: 10,
    reward: { money: 20000, exp: 2000 },
  },
  {
    id: "hunt5",
    name: "Cazador Experto",
    desc: "Cazar 5 veces",
    target: 5,
    reward: { money: 12000, exp: 1200 },
  },
];

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.quest) user.quest = {};

  const args = m.args || [];
  const sub = args[0]?.toLowerCase();

  if (sub === "claim") {
    const questId = args[1];
    if (!questId || !user.quest[questId]) {
      return m.reply(`Hmm.. ¡Esa misión no está en tu lista! 📜❌`);
    }

    const quest = QUESTS.find((q) => q.id === questId);
    if (!quest) {
      return m.reply(`¡ID de misión incorrecto! ¡Revisa el panel de misiones! 🔍`);
    }

    if (user.quest[questId].progress < quest.target) {
      return m.reply(`¡Esta misión aún no está completa!\nTu progreso: *${user.quest[questId].progress}/${quest.target}* 🏃‍♂️💦`);
    }

    if (user.quest[questId].claimed) {
      return m.reply(`¡Ya reclamaste esta recompensa! 😒`);
    }

    user.belly = (user.belly || 0) + quest.reward.money;
    db.updateExp(m.sender, quest.reward.exp);
    user.quest[questId].claimed = true;

    db.save();
    let txt = `💰 ¡¡MISIÓN COMPLETADA!! 💰\n\n`;
    txt += `¡Completaste la misión *${quest.name}*!\n`;
    txt += `Aquí está tu recompensa:\n`;
    txt += `💵 Dinero de Misión: *+Belly ${quest.reward.money.toLocaleString("es-ES")}*\n`;
    txt += `📈 EXP Extra: *+${quest.reward.exp}*\n\n`;
    txt += `> _"¡Buen trabajo!" - Recepcionista del Guild_ 👩‍💼`;
    return m.reply(txt);
  }

  if (sub === "take") {
    const questId = args[1];
    const quest = QUESTS.find((q) => q.id === questId);
    if (!quest) {
      return m.reply(`¡Misión no encontrada! Mira la lista completa en \`.quest\``);
    }

    if (user.quest[questId]) {
      return m.reply(`¡Ya tomaste esta misión! ¡Vamos, a trabajar! ⚔️`);
    }

    user.quest[questId] = { progress: 0, claimed: false, takenAt: Date.now() };
    db.save();

    let txt = `📜 ¡¡MISIÓN ACEPTADA! 📜\n\n`;
    txt += `¡Tomaste un papel de misión del Panel de Recompensas! 📜✨\n`;
    txt += `🎯 Objetivo: *${quest.name}* (${quest.desc})\n`;
    txt += `🎁 Recompensa: *Belly ${quest.reward.money.toLocaleString("es-ES")}* & *${quest.reward.exp} EXP*\n\n`;
    txt += `> _"¡Buena suerte en tu viaje!"_ 💖`;
    return m.reply(txt);
  }

  let txt = `📌 *PANEL DE RECOMPENSAS (MISIONES DIARIAS)* 📌\n\n`;
  txt += `¡Completa estas tareas diarias para obtener recompensas extra!\n\n`;

  for (const quest of QUESTS) {
    const userQuest = user.quest[quest.id];
    let status = "📜 Disponible";
    if (userQuest) {
      if (userQuest.claimed) {
        status = "✅ Completada";
      } else if (userQuest.progress >= quest.target) {
        status = "🎁 Lista para reclamar";
      } else {
        status = `🏃 En progreso (${userQuest.progress}/${quest.target})`;
      }
    }

    txt += `🎯 *${quest.name}*\n`;
    txt += `   ├ Tarea: ${quest.desc}\n`;
    txt += `   ├ Recompensa: Belly ${quest.reward.money.toLocaleString("es-ES")} & ${quest.reward.exp} EXP\n`;
    txt += `   ├ Estado: *${status}*\n`;
    txt += `   └ Aceptar: \`${m.prefix}quest take ${quest.id}\`\n\n`;
  }

  txt += `> 💡 Cuando la misión esté completa, escribe: \`.quest claim <id_misión>\``;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
