import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "lottery",
  alias: ["gacha", "spin", "undian"],
  category: "rpg",
  description: "Gacha/lotería para premios aleatorios",
  usage: ".lottery <1/10>",
  example: ".lottery 10",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  carne: 1,
  isEnabled: true,
};

const GACHA_POOL = [
  { item: "trash", name: "🗑️ Basura Podrida", chance: 30, rarity: "common" },
  { item: "wood", name: "🪵 Leña", chance: 20, qty: [3, 8], rarity: "common" },
  { item: "iron", name: "🔩 Hierro Usado", chance: 15, qty: [2, 5], rarity: "common" },
  { item: "gold", name: "🪙 Lingote de Oro", chance: 10, qty: [1, 3], rarity: "uncommon" },
  { item: "potion", name: "🧪 Poción Mágica", chance: 8, qty: [1, 3], rarity: "uncommon" },
  { item: "diamond", name: "💎 Diamante Puro", chance: 5, qty: [1, 2], rarity: "rare" },
  { item: "goldchest", name: "🎁 Cofre de Oro", chance: 3, qty: [1, 1], rarity: "rare" },
  { item: "diamondchest", name: "💎 Cofre de Diamante", chance: 1.5, qty: [1, 1], rarity: "epic" },
  { item: "mysterybox", name: "🎲 Caja Misteriosa", chance: 0.8, qty: [1, 1], rarity: "epic" },
  { item: "goldsword", name: "🗡️ Espada Excalibur Dorada", chance: 0.3, qty: [1, 1], rarity: "legendary" },
  { item: "diamondarmor", name: "🛡️ Armadura de Diamante Eterna", chance: 0.2, qty: [1, 1], rarity: "legendary" },
  { item: "divinecore", name: "⚡ Núcleo Divino (Divine Core)", chance: 0.1, qty: [1, 1], rarity: "mythic" },
];

const RARITY_COLORS = {
  common: "⚪",
  uncommon: "🟢",
  rare: "🔵",
  epic: "🟣",
  legendary: "🟡",
  mythic: "🔴",
};

const GACHA_COST = 500;

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.inventory) user.inventory = {};
  if (!user.rpg) user.rpg = {};

  const args = m.args || [];
  const pulls = Math.min(10, Math.max(1, parseInt(args[0]) || 1));
  const totalCost = GACHA_COST * pulls;

  if ((user.berry || 0) < totalCost) {
    return m.reply(
      `💸 *¡TE FALTA DINERO PARA GACHA!* 💸\n\n` +
        `Precio de Gacha: *Rp ${GACHA_COST.toLocaleString()}/Tirada*\n` +
        `Total Necesario: *Rp ${totalCost.toLocaleString()} (${pulls}x)*\n\n` +
        `Solo te queda: *Rp ${(user.berry || 0).toLocaleString()}*. ¡Mejor trabaja primero!`
    );
  }

  user.berry -= totalCost;

  await m.react("🎰");
  await m.reply(`✨ Luces de discoteca encendidas... El bote gacha gira a toda velocidad... ¡Sacando *${pulls}x* premios! 🎁✨`);
  await new Promise((r) => setTimeout(r, 2500));

  const results = [];
  let totalExp = 0;

  for (let i = 0; i < pulls; i++) {
    const roll = Math.random() * 100;
    let cumulative = 0;
    let result = GACHA_POOL[0];

    for (const item of GACHA_POOL) {
      cumulative += item.chance;
      if (roll <= cumulative) {
        result = item;
        break;
      }
    }

    if (result.item !== "trash") {
      const qty = result.qty ? Math.floor(Math.random() * (result.qty[1] - result.qty[0] + 1)) + result.qty[0] : 1;
      user.inventory[result.item] = (user.inventory[result.item] || 0) + qty;
      results.push({ ...result, finalQty: qty });

      const expByRarity = { common: 10, uncommon: 30, rare: 80, epic: 150, legendary: 300, mythic: 500 };
      totalExp += expByRarity[result.rarity] || 10;
    } else {
      results.push({ ...result, finalQty: 0 });
    }
  }

  await addExpWithLevelCheck(sock, m, db, user, totalExp);
  db.save();

  const grouped = {};
  for (const r of results) {
    if (!grouped[r.item]) {
      grouped[r.item] = { ...r, count: 0, totalQty: 0 };
    }
    grouped[r.item].count++;
    grouped[r.item].totalQty += r.finalQty;
  }

  let txt = `🎉 *¡¡¡BAMMM!!! ¡BOTE ABIERTO!!* 🎉\n\n`;
  txt += `Tiradas *${pulls}x* | Dinero gastado: *Rp ${totalCost.toLocaleString()}*\n\n`;
  txt += `*🎁 TUS RESULTADOS DE GACHA:* \n`;

  let hasRare = false;
  let hasLegendary = false;

  for (const [key, item] of Object.entries(grouped)) {
    const rarityIcon = RARITY_COLORS[item.rarity] || "⚪";
    if (item.item === "trash") {
      txt += `> ${rarityIcon} ${item.name} *(Basura x${item.count})*\n`;
    } else {
      txt += `> ${rarityIcon} ${item.name} *x${item.totalQty}*\n`;
    }

    if (["epic", "legendary", "mythic"].includes(item.rarity)) hasRare = true;
    if (["legendary", "mythic"].includes(item.rarity)) hasLegendary = true;
  }

  txt += `\n📈 *EXP Bonus:* +${totalExp} ✨\n`;

  if (hasLegendary) {
    txt += `\n🌟🌟 *¡¡¡WOOOYYY!!! ¡CONSEGUISTE UN ÍTEM LEGENDARIO!! ¡SE TE ACABÓ LA SUERTE DE TU VIDA!!* 🌟🌟`;
  } else if (hasRare) {
    txt += `\n✨ *¡Oye, nada mal conseguir algo raro bro!*`;
  } else {
    txt += `\n🥲 *Basura... Conseguiste puros objetos chatarra.*`;
  }

  await m.react(hasLegendary ? "🌟" : hasRare ? "🎉" : "✅");

  return m.reply(txt);
}

export { pluginConfig as config, handler };
