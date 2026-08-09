import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "boss",
  alias: ["raidboss", "bigboss"],
  category: "rpg",
  description: "Lawan boss untuk hadiah besar",
  usage: ".boss",
  example: ".boss",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 600,
  carne: 3,
  isEnabled: true,
};

const BOSSES = [
  {
    name: "🐉 Elder Dragon",
    hp: 500,
    attack: 50,
    minLevel: 10,
    exp: 2000,
    gold: 5000,
    drops: ["dragonscale", "dragonbone"],
  },
  {
    name: "👹 Demon Lord",
    hp: 400,
    attack: 60,
    minLevel: 15,
    exp: 2500,
    gold: 7000,
    drops: ["demonsoul", "cursedgem"],
  },
  {
    name: "🧟 Undead King",
    hp: 350,
    attack: 45,
    minLevel: 8,
    exp: 1500,
    gold: 4000,
    drops: ["soulstone", "ancientbone"],
  },
  {
    name: "🦑 Kraken",
    hp: 600,
    attack: 40,
    minLevel: 12,
    exp: 2200,
    gold: 6000,
    drops: ["krakententacle", "seagem"],
  },
  {
    name: "🌋 Volcanic Titan",
    hp: 700,
    attack: 55,
    minLevel: 20,
    exp: 3000,
    gold: 10000,
    drops: ["titancore", "lavagem"],
  },
  {
    name: "❄️ Frost Queen",
    hp: 450,
    attack: 50,
    minLevel: 18,
    exp: 2800,
    gold: 8000,
    drops: ["frostheart", "icecrown"],
  },
  {
    name: "⚡ Thunder God",
    hp: 550,
    attack: 65,
    minLevel: 25,
    exp: 4000,
    gold: 15000,
    drops: ["thunderstone", "divinecore"],
  },
];

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const userLevel = user.level || 1;
  const availableBosses = BOSSES.filter((b) => userLevel >= b.minLevel);

  if (availableBosses.length === 0) {
    const lowestBoss = BOSSES.reduce((a, b) => (a.minLevel < b.minLevel ? a : b));
    let txt = `¡Uy bro, tu nivel aún es demasiado bajo para unirte a un Raid Boss! 😭\n\n`;
    txt += `Tu nivel actual: *${userLevel}*\n`;
    txt += `Nivel mínimo requerido: *${lowestBoss.minLevel}*\n\n`;
    txt += `💡 _Consejo: ¡Sé constante farmeando EXP con \`.dungeon\`, \`.fishing\` o \`.mining\` primero bro!_`;
    return m.reply(txt);
  }

  const staminaCost = 50;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ ¡Vaya, se te acabó la resistencia bro!\n\nNecesitas *${staminaCost} de Resistencia* para luchar contra el jefe.\nTu resistencia restante: *${user.rpg.stamina}*`);
  }

  user.rpg.stamina -= staminaCost;

  const boss = availableBosses[Math.floor(Math.random() * availableBosses.length)];

  await m.react("⚔️");
  let introTxt = `⚠️ *¡ALERTA DE PELIGRO!* ⚠️\n\n`;
  introTxt += `Un aura de oscuridad cubre la arena... *${boss.name}* ha aparecido frente a ti!\n\n`;
  introTxt += `❤️ Vida del Jefe: *${boss.hp} HP*\n`;
  introTxt += `⚔️ Poder: *${boss.attack} ATK*\n\n`;
  introTxt += `_¡Prepara tu arma bro! La batalla comienza..._`;
  
  await m.reply(introTxt);
  await new Promise((r) => setTimeout(r, 2500));

  const userAttack = (user.rpg.attack || 10) + userLevel * 3;
  const userDefense = (user.rpg.defense || 5) + userLevel * 2;
  const userMaxHp = (user.rpg.health || 100) + userLevel * 5;

  let userHp = userMaxHp;
  let bossHp = boss.hp;
  let round = 0;
  let battleLog = [];

  while (userHp > 0 && bossHp > 0 && round < 15) {
    round++;

    const playerDmg = Math.max(10, userAttack + Math.floor(Math.random() * 20) - 5);
    const critChance = Math.random();
    const finalPlayerDmg = critChance > 0.9 ? playerDmg * 2 : playerDmg;
    bossHp -= finalPlayerDmg;

    if (critChance > 0.9) {
      battleLog.push(`💥 *¡GOLPE CRÍTICO!!* Tu ataque mortal impacta: *-${finalPlayerDmg} HP*`);
    } else {
      battleLog.push(`⚔️ Cortas al jefe: *-${finalPlayerDmg} HP*`);
    }

    if (bossHp <= 0) break;

    const bossDmg = Math.max(10, boss.attack - userDefense + Math.floor(Math.random() * 15));
    userHp -= bossDmg;
    battleLog.push(`👹 El jefe se enfurece y te golpea: *-${bossDmg} HP*`);
  }

  await m.reply(
    `⚔️ *La batalla fue intensa...*\n\n${battleLog
      .slice(-6)
      .map((l) => `> ${l}`)
      .join("\n")}`,
  );
  await new Promise((r) => setTimeout(r, 1500));

  const isWin = bossHp <= 0;

  let txt = ``;

  if (isWin) {
    const expReward = boss.exp + Math.floor(Math.random() * 500);
    const goldReward = boss.gold + Math.floor(Math.random() * 2000);

    user.berry = (user.berry || 0) + goldReward;
    await addExpWithLevelCheck(sock, m, db, user, expReward);

    const droppedItems = [];
    for (const drop of boss.drops) {
      if (Math.random() > 0.5) {
        const qty = Math.floor(Math.random() * 3) + 1;
        user.inventory[drop] = (user.inventory[drop] || 0) + qty;
        droppedItems.push(`${drop} (x${qty})`);
      }
    }

    txt = `🏆 *¡¡EL JEFE FUE DERROTADO!!* 🎉\n\n`;
    txt += `¡Vaya locura, lograste tumbar al monstruo gigante *${boss.name}* bro!\n\n`;
    txt += `*🎁 Tesoro del Jefe:*\n`;
    txt += `✨ EXP: *+${expReward.toLocaleString()}*\n`;
    txt += `💰 Berry de Oro: *+Rp ${goldReward.toLocaleString()}*\n`;
    if (droppedItems.length > 0) {
      txt += `📦 Botín de Items: *${droppedItems.join(", ")}*\n`;
    }
    txt += `\n> ❤️ Tu HP restante: *${Math.max(0, userHp)}/${userMaxHp}*`;

    await m.react("🏆");
  } else {
    const goldLoss = Math.floor((user.berry || 0) * 0.15);
    user.berry = Math.max(0, (user.berry || 0) - goldLoss);
    user.rpg.health = Math.max(1, (user.rpg.health || 100) - 50);

    txt = `💀 *BUENO... FUISTE VENCIDO...* 💔\n\n`;
    txt += `El poder de *${boss.name}* resultó ser demasiado para ti bro!\n\n`;
    txt += `*Penalización por Derrota:*\n`;
    txt += `💸 Berry Perdidos: *-Rp ${goldLoss.toLocaleString()}*\n`;
    txt += `❤️ HP Reducido: *-50 HP*\n\n`;
    txt += `> 💡 _Consejo: ¡Sube de nivel y mejora tus armas antes de volver a retarlo bro!_`;

    await m.react("💀");
  }

  db.save();
  return m.reply(txt);
}

export { pluginConfig as config, handler };
