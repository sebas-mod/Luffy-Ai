import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "quest",
  alias: ["misi", "mission", "bounty"],
  category: "rpg",
  description: "Acepta misiones diarias para obtener recompensas extra",
  usage: ".quest",
  example: ".quest",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  carne: 0,
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
    name: "Pescador Experto",
    desc: "Pescar 5 veces",
    target: 5,
    reward: { money: 8000, exp: 800 },
  },
  {
    id: "adventure3",
    name: "Aventurero Verdadero",
    desc: "Aventurar 3 veces",
    target: 3,
    reward: { money: 15000, exp: 1500 },
  },
  {
    id: "work10",
    name: "Trabajador Duro",
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
      return m.reply(`Hmm.. ¡Esa misión no está en tu lista bro! 📜❌`);
    }

    const quest = QUESTS.find((q) => q.id === questId);
    if (!quest) {
      return m.reply(`¡El ID de la misión es incorrecto bro! ¡Revisa de nuevo el tablón de recompensas! 🔍`);
    }

    if (user.quest[questId].progress < quest.target) {
      return m.reply(`¡Esta misión aún no está terminada bro!\nTu progreso: *${user.quest[questId].progress}/${quest.target}* 🏃‍♂️💦`);
    }

    if (user.quest[questId].claimed) {
      return m.reply(`¡Ya tomaste la recompensa de esta misión bro! 😒`);
    }

    user.berry = (user.berry || 0) + quest.reward.money;
    db.updateExp(m.sender, quest.reward.exp);
    user.quest[questId].claimed = true;

    db.save();
    let txt = `💰 *¡¡MISIÓN COMPLETADA!!* 💰\n\n`;
    txt += `¡Lograste completar la misión *${quest.name}*!\n`;
    txt += `Esta es tu recompensa bro:\n`;
    txt += `💵 Dinero de Misión: *+Rp ${quest.reward.money.toLocaleString("id-ID")}*\n`;
    txt += `📈 EXP Bonus: *+${quest.reward.exp}*\n\n`;
    txt += `> _"¡Buen trabajo bro!" - Recepcionista del Gremio_ 👩‍💼`;
    return m.reply(txt);
  }

  if (sub === "take") {
    const questId = args[1];
    const quest = QUESTS.find((q) => q.id === questId);
    if (!quest) {
      return m.reply(`¡No se encontró la misión! Mira la lista completa en \`.quest\``);
    }

    if (user.quest[questId]) {
      return m.reply(`¡Ya tomaste esta misión bro! ¡Completa la primero! ⚔️`);
    }

    user.quest[questId] = { progress: 0, claimed: false, takenAt: Date.now() };
    db.save();

    let txt = `📜 *¡MISIÓN TOMADA!* 📜\n\n`;
    txt += `¡Tomaste una hoja de misión del Tablón de Recompensas! 📜✨\n`;
    txt += `🎯 Objetivo: *${quest.name}* (${quest.desc})\n`;
    txt += `🎁 Recompensa: *Rp ${quest.reward.money.toLocaleString("id-ID")}* & *${quest.reward.exp} EXP*\n\n`;
    txt += `> _"¡Buena suerte en tu camino bro!"_ 💖`;
    return m.reply(txt);
  }

  let txt = `📌 *TABLÓN DE RECOMPENSAS (MISIÓN DIARIA)* 📌\n\n`;
  txt += `¡Completa estas tareas diarias para ganar recompensas extra bro!\n\n`;

  for (const quest of QUESTS) {
    const userQuest = user.quest[quest.id];
    let status = "📜 Disponible";
    if (userQuest) {
      if (userQuest.claimed) {
        status = "✅ Completada";
      } else if (userQuest.progress >= quest.target) {
        status = "🎁 Lista para Reclamar";
      } else {
        status = `🏃 En Progreso (${userQuest.progress}/${quest.target})`;
      }
    }

    txt += `🎯 *${quest.name}*\n`;
    txt += `   ├ Tarea: ${quest.desc}\n`;
    txt += `   ├ Recompensa: Rp ${quest.reward.money.toLocaleString("id-ID")} & ${quest.reward.exp} EXP\n`;
    txt += `   ├ Estado: *${status}*\n`;
    txt += `   └ Tomar: \`${m.prefix}quest take ${quest.id}\`\n\n`;
  }

  txt += `> 💡 Si la misión ya está completa, escribe: \`.quest claim <id_mision>\``;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
