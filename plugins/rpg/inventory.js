import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "inventory",
  alias: ["inv", "tas", "bag"],
  category: "rpg",
  description: "Ver el contenido del inventario RPG",
  usage: ".inventory",
  example: ".inventory",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

const ITEMS = {
  common: { emote: "📦", name: "Cofre Común" },
  uncommon: { emote: "🛍️", name: "Cofre Poco Común" },
  mythic: { emote: "🎁", name: "Cofre Mítico" },
  legendary: { emote: "💎", name: "Cofre Legendario" },

  rock: { emote: "🪨", name: "Roca" },
  coal: { emote: "⚫", name: "Carbón" },
  iron: { emote: "⛓️", name: "Hierro" },
  gold: { emote: "🥇", name: "Oro" },
  diamond: { emote: "💠", name: "Diamante" },
  emerald: { emote: "💚", name: "Esmeralda" },

  trash: { emote: "🗑️", name: "Basura" },
  fish: { emote: "🐟", name: "Pescado" },
  prawn: { emote: "🦐", name: "Camarón" },
  octopus: { emote: "🐙", name: "Pulpo" },
  shark: { emote: "🦈", name: "Tiburón" },
  whale: { emote: "🐳", name: "Ballena" },

  potion: { emote: "🥤", name: "Poción de Salud" },
  mpotion: { emote: "🧪", name: "Poción de Maná" },
  stamina: { emote: "⚡", name: "Poción de Resistencia" },

  herb: { emote: "🌿", name: "Hierba" },
  leather: { emote: "👞", name: "Cuero" },
  mysterybox: { emote: "📦", name: "Caja Misteriosa" },

  kunai: { emote: "🗡️", name: "Kunai" },
  shuriken: { emote: "⚔️", name: "Shuriken" },
  chakra: { emote: "🌀", name: "Chakra" },
  scroll: { emote: "📜", name: "Pergamino Ninja" },
  bowlramen: { emote: "🍜", name: "Ramen" },
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  if (!user.inventory) user.inventory = {};

  let invText = `🎒 *¡Así Va Tu Bolsa Bro!* ✨\n\n`;

  invText += `❤️ HP: *${user.rpg?.health || 100}*\n`;
  invText += `💸 Berry: *${(user.berry || 0).toLocaleString("id-ID")}*\n`;
  invText += `📈 EXP: *${(user.exp || 0).toLocaleString("id-ID")}*\n\n`;

  let hasItem = false;
  const categories = {
    "📦 *Colección de Cofres*": ["common", "uncommon", "mythic", "legendary"],
    "⛏️ *Resultados de Minería*": [
      "rock",
      "coal",
      "iron",
      "gold",
      "diamond",
      "emerald",
    ],
    "🎣 *Resultados de Pesca*": [
      "trash",
      "fish",
      "prawn",
      "octopus",
      "shark",
      "whale",
    ],
    "🌿 *Resultados de Mazmorra*": ["herb", "leather", "mysterybox"],
    "🧪 *Pociones y Mejoras*": ["potion", "mpotion", "stamina"],
    "⛩️ *Equipo Shinobi*": ["kunai", "shuriken", "chakra", "scroll", "bowlramen"],
  };

  for (const [catName, items] of Object.entries(categories)) {
    let catText = "";
    for (const itemKey of items) {
      const count = user.inventory[itemKey] || 0;
      if (count > 0) {
        const item = ITEMS[itemKey];
        catText += `${item.emote} ${item.name}: *${count}x*\n`;
        hasItem = true;
      }
    }
    if (catText) {
      invText += `${catName}\n`;
      invText += catText;
      invText += `\n`;
    }
  }

  if (!hasItem) {
    invText += `Vaya, ¡tu bolsa sigue vacía bro! 🕸️\n`;
    invText += `¡Juega otros comandos RPG para conseguir ítems divertidos! 🚀\n`;
  } else {
    invText += `Escribe *.use <nombre del ítem>* para usar tus objetos! 🎒💖\n`;
  }

  await m.reply(invText);
}

export { pluginConfig as config, handler };
