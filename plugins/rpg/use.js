import { getDatabase } from "../../src/lib/luffy-database.js";
const pluginConfig = {
  name: "use",
  alias: ["pake", "makan", "open"],
  category: "rpg",
  description: "Usar un item consumible o abrir un crate",
  usage: ".use <item>",
  example: ".use potion",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  const args = m.args || [];
  const itemKey = args[0]?.toLowerCase();

  if (!itemKey) {
    return m.reply(
      `🎒 *ᴜsᴀʀ ɪᴛᴇᴍ*\n\n` +
      `*📋 *ᴜsᴏ:*
\n` +
      `> > \`.use <nombre_item>\`\n` +
      `> > Ver inventario: \`.inventory\`\n` +
      ``,
    );
  }

  user.inventory = user.inventory || {};
  user.rpg = user.rpg || {};
  user.rpg.health = user.rpg.health || 100;
  user.rpg.maxHealth = user.rpg.maxHealth || 100;
  user.rpg.mana = user.rpg.mana || 100;
  user.rpg.maxMana = user.rpg.maxMana || 100;
  user.rpg.stamina = user.rpg.stamina || 100;
  user.rpg.maxStamina = user.rpg.maxStamina || 100;

  const count = user.inventory[itemKey] || 0;

  if (count <= 0) {
    return m.reply(
      `❌ *ɪᴛᴇᴍ ɴᴏ ᴇxɪsᴛᴇ*\n\n` +
      `> No tienes el item *${itemKey}*!\n` +
      `> Ver inventario: \`.inventory\``,
    );
  }

  let msg = "";

  switch (itemKey) {
    case "potion":
      if (user.rpg.health >= user.rpg.maxHealth) {
        return m.reply(`❤️ *ᴠɪᴅᴀ ʟʟᴇɴᴀ*\n\n> Tu vida ya está llena!`);
      }
      user.rpg.health = Math.min(user.rpg.health + 50, user.rpg.maxHealth);
      user.inventory[itemKey]--;
      msg = `🥤 *ɪᴛᴇᴍ ᴜsᴀᴅᴏ*\n\n> Bebiste la *Poción de Salud*.\n> ❤️ Vida ahora: ${user.rpg.health}/${user.rpg.maxHealth}`;
      break;

    case "mpotion":
      if (user.rpg.mana >= user.rpg.maxMana) {
        return m.reply(`💧 *ᴍᴀɴᴀ ʟʟᴇɴᴏ*\n\n> Tu maná ya está lleno!`);
      }
      user.rpg.mana = Math.min(user.rpg.mana + 50, user.rpg.maxMana);
      user.inventory[itemKey]--;
      msg = `🧪 *ɪᴛᴇᴍ ᴜsᴀᴅᴏ*\n\n> Bebiste la *Poción de Maná*.\n> 💧 Maná ahora: ${user.rpg.mana}/${user.rpg.maxMana}`;
      break;

    case "stamina":
      if (user.rpg.stamina >= user.rpg.maxStamina) {
        return m.reply(`⚡ *sᴛᴀᴍɪɴᴀ ʟʟᴇɴᴀ*\n\n> Tu resistencia ya está llena!`);
      }
      user.rpg.stamina = Math.min(user.rpg.stamina + 20, user.rpg.maxStamina);
      user.inventory[itemKey]--;
      msg = `⚡ *ɪᴛᴇᴍ ᴜsᴀᴅᴏ*\n\n> Bebiste la *Poción de Resistencia*.\n> ⚡ Resistencia ahora: ${user.rpg.stamina}/${user.rpg.maxStamina}`;
      break;

    case "herb":
      if (user.rpg.health >= user.rpg.maxHealth) {
        return m.reply(`❤️ *ᴠɪᴅᴀ ᴘʟᴇɴᴀ*\n\n> ¡Tu vida ya está llena!`);
      }
      user.rpg.health = Math.min(user.rpg.health + 20, user.rpg.maxHealth);
      user.inventory[itemKey]--;
      msg = `🌿 *ɪᴛᴇᴍ ᴜsᴀᴅᴏ*\n\n> Masticaste la *Hierba*.\n> ❤️ Vida ahora: ${user.rpg.health}/${user.rpg.maxHealth}`;
      break;

    case "leather":
      user.rpg.attack = (user.rpg.attack || 10) + 3;
      user.inventory[itemKey]--;
      msg = `👞 *ɪᴛᴇᴍ ᴜsᴀᴅᴏ*\n\n> Te pusiste el *Cuero* como protección.\n> ⚔️ Ataque aumentado: +3 (ahora: ${user.rpg.attack})`;
      break;

    case "mysterybox": {
      user.inventory[itemKey]--;
      const rewards = [
        { type: "berry", min: 1000, max: 50000, icon: "💰" },
        { type: "exp", min: 500, max: 5000, icon: "✨" },
        { type: "potion", qty: [1, 3], icon: "🥤" },
        { type: "diamond", qty: [1, 2], icon: "💠" },
      ];
      const pick = rewards[Math.floor(Math.random() * rewards.length)];
      let rewardMsg = "";
      if (pick.type === "berry") {
        const amount =
          Math.floor(Math.random() * (pick.max - pick.min)) + pick.min;
        user.berry = (user.berry || 0) + amount;
        rewardMsg = `${pick.icon} Berry: +${amount.toLocaleString("id-ID")}`;
      } else if (pick.type === "exp") {
        const amount =
          Math.floor(Math.random() * (pick.max - pick.min)) + pick.min;
        db.updateExp(m.sender, amount);
        rewardMsg = `${pick.icon} EXP: +${amount.toLocaleString("id-ID")}`;
      } else {
        const qty =
          Math.floor(Math.random() * (pick.qty[1] - pick.qty[0] + 1)) +
          pick.qty[0];
        user.inventory[pick.type] = (user.inventory[pick.type] || 0) + qty;
        rewardMsg = `${pick.icon} ${pick.type}: +${qty}`;
      }
      msg = `📦 *ᴍʏsᴛᴇʀʏ ʙᴏx ᴀʙɪᴇʀᴛᴏ!*\n\n> Abriste una Mystery Box...\n> ${rewardMsg}`;
      break;
    }

    case "bowlramen":
      if (user.rpg.health >= user.rpg.maxHealth) {
        return m.reply(`❤️ *ᴠɪᴅᴀ ʟʟᴇɴᴀ*\n\n> Tu vida ya está llena, no hace falta comer más ramen!`);
      }
      user.rpg.health = Math.min(user.rpg.health + 40, user.rpg.maxHealth);
      user.inventory[itemKey]--;
      msg = `🍜 *ɪᴛᴇᴍ ᴜsᴀᴅᴏ*\n\n> Comiste un tazón de *Ramen Caliente*.\n> ❤️ Vida recuperada: ${user.rpg.health}/${user.rpg.maxHealth}`;
      break;

    case "chakra":
      if (user.rpg.stamina >= user.rpg.maxStamina) {
        return m.reply(`⚡ *sᴛᴀᴍɪɴᴀ ʟʟᴇɴᴀ*\n\n> Tu resistencia/chakra ya está lleno!`);
      }
      user.rpg.stamina = Math.min(user.rpg.stamina + 30, user.rpg.maxStamina);
      user.inventory[itemKey]--;
      msg = `🌀 *ɪᴛᴇᴍ ᴜsᴀᴅᴏ*\n\n> Absorbiste *Fragmentos de Chakra*.\n> ⚡ Resistencia aumentada: ${user.rpg.stamina}/${user.rpg.maxStamina}`;
      break;

    case "kunai":
    case "shuriken":
      user.rpg.attack = (user.rpg.attack || 10) + 2;
      user.inventory[itemKey]--;
      msg = `🗡️ *ɪᴛᴇᴍ ᴜsᴀᴅᴏ*\n\n> Te equipaste con *${itemKey.toUpperCase()}*.\n> ⚔️ Ataque aumentado: +2 (ahora: ${user.rpg.attack})`;
      break;

    case "scroll": {
      user.inventory[itemKey]--;
      const scrollRewards = [
        { type: "berry", min: 2000, max: 10000, icon: "💰" },
        { type: "exp", min: 1000, max: 8000, icon: "✨" },
      ];
      const sPick = scrollRewards[Math.floor(Math.random() * scrollRewards.length)];
      let sRewardMsg = "";
      if (sPick.type === "berry") {
        const amount = Math.floor(Math.random() * (sPick.max - sPick.min)) + sPick.min;
        user.berry = (user.berry || 0) + amount;
        sRewardMsg = `${sPick.icon} Ryo (Berry): +${amount.toLocaleString("id-ID")}`;
      } else {
        const amount = Math.floor(Math.random() * (sPick.max - sPick.min)) + sPick.min;
        db.updateExp(m.sender, amount);
        sRewardMsg = `${sPick.icon} EXP Ninja: +${amount.toLocaleString("id-ID")}`;
      }
      msg = `📜 *sᴄʀᴏʟʟ ʟᴇɪᴅᴏ!*\n\n> Abriste el Pergamino Secreto Ninja...\n> ${sRewardMsg}`;
      break;
    }

    case "common":
    case "uncommon":
    case "mythic":
    case "legendary":
      user.inventory[itemKey]--;
      const rewardMoney =
        Math.floor(Math.random() * (itemKey === "legendary" ? 100000 : 10000)) +
        1000;
      const rewardExp =
        Math.floor(Math.random() * (itemKey === "legendary" ? 5000 : 500)) +
        100;

      user.berry = (user.berry || 0) + rewardMoney;
      db.updateExp(m.sender, rewardExp);

      msg =
        `🎁 *ᴄʀᴀᴛᴇ ᴀʙɪᴇʀᴛᴏ*\n\n` +
        `> Abriste el *${itemKey} Crate*!\n` +
        `> 💰 Berry: +Rp ${rewardMoney.toLocaleString("id-ID")}\n` +
        `> 🚄 Exp: +${rewardExp}`;
      break;

    default:
      return m.reply(
        `❌ *ɪᴛᴇᴍ ɴᴏ ᴜsᴀʙʟᴇ*\n\n> El item *${itemKey}* no se puede usar directamente.`,
      );
  }

  db.save();
  await m.reply(msg);
}

export { pluginConfig as config, handler };
