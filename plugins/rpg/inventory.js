import { getDatabase } from "../../src/lib/ourin-database.js";

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
  energi: 0,
  isEnabled: true,
};

const ITEMS = {
  common: { emote: "📦", name: "Common Crate" },
  uncommon: { emote: "🛍️", name: "Uncommon Crate" },
  mythic: { emote: "🎁", name: "Mythic Crate" },
  legendary: { emote: "💎", name: "Legendary Crate" },

  rock: { emote: "🪨", name: "Piedra" },
  coal: { emote: "⚫", name: "Carbón" },
  iron: { emote: "⛓️", name: "Hierro" },
  gold: { emote: "🥇", name: "Oro" },
  diamond: { emote: "💠", name: "Diamante" },
  emerald: { emote: "💚", name: "Esmeralda" },

  trash: { emote: "🗑️", name: "Basura" },
  fish: { emote: "🐟", name: "Pez" },
  prawn: { emote: "🦐", name: "Camarón" },
  octopus: { emote: "🐙", name: "Pulpo" },
  shark: { emote: "🦈", name: "Tiburón" },
  whale: { emote: "🐳", name: "Ballena" },

  potion: { emote: "🥤", name: "Health Potion" },
  mpotion: { emote: "🧪", name: "Mana Potion" },
  stamina: { emote: "⚡", name: "Stamina Potion" },

  herb: { emote: "🌿", name: "Hierba" },
  leather: { emote: "👞", name: "Cuero" },
  mysterybox: { emote: "📦", name: "Mystery Box" },

  kunai: { emote: "🗡️", name: "Kunai" },
  shuriken: { emote: "⚔️", name: "Shuriken" },
  chakra: { emote: "🌀", name: "Chakra" },
  scroll: { emote: "📜", name: "Scroll Ninja" },
  bowlramen: { emote: "🍜", name: "Ramen" },
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  if (!user.inventory) user.inventory = {};

  let invText = `🎒 ¡Este es el contenido de tu Mochila! ✨\n\n`;

  invText += `❤️ HP: *${user.rpg?.health || 100}*\n`;
  invText += `💸 Koin: *${(user.koin || 0).toLocaleString("id-ID")}*\n`;
  invText += `📈 EXP: *${(user.exp || 0).toLocaleString("id-ID")}*\n\n`;

  let hasItem = false;
  const categories = {
    "📦 *Colección de Cajas*": ["common", "uncommon", "mythic", "legendary"],
    "⛏️ *Minerales*": [
      "rock",
      "coal",
      "iron",
      "gold",
      "diamond",
      "emerald",
    ],
    "🎣 *Pesca*": [
      "trash",
      "fish",
      "prawn",
      "octopus",
      "shark",
      "whale",
    ],
    "🌿 *Objetos de Dungeon*": ["herb", "leather", "mysterybox"],
    "🧪 *Pociones y Buffs*": ["potion", "mpotion", "stamina"],
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
    invText += `¡Vaya, tu mochila aún está vacía! 🕸️\n`;
    invText += `¡Prueba otros comandos RPG para obtener objetos! 🚀\n`;
  } else {
    invText += `Escribe *.use <nombre del objeto>* para usarlo. 🎒💖\n`;
  }

  await m.reply(invText);
}

export { pluginConfig as config, handler };
