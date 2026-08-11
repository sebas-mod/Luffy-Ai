import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "heal",
  alias: ["sembuh", "recover"],
  category: "rpg",
  description: "Recuperar salud descansando (gratis pero lento)",
  usage: ".heal",
  example: ".heal",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 600,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  user.rpg.health = user.rpg.health || 100;
  user.rpg.maxHealth = user.rpg.maxHealth || 100;
  user.rpg.stamina = user.rpg.stamina || 100;
  user.rpg.maxStamina = user.rpg.maxStamina || 100;

  if (user.rpg.health >= user.rpg.maxHealth && user.rpg.stamina >= user.rpg.maxStamina) {
    return m.reply(`¡Ey, tu cuerpo está en plena forma bro! 🏋️✨\nNo descanses todavía, ¡mejor sigue con la aventura! 🚀`);
  }

  await m.react("🛌");
  await m.reply("Mejor duermo un rato... Zzz... 🛌💤");
  await new Promise((r) => setTimeout(r, 3000));

  const healthRecover = 30;
  const staminaRecover = 50;

  const oldHealth = user.rpg.health;
  const oldStamina = user.rpg.stamina;

  user.rpg.health = Math.min(user.rpg.health + healthRecover, user.rpg.maxHealth);
  user.rpg.stamina = Math.min(user.rpg.stamina + staminaRecover, user.rpg.maxStamina);

  let txt = `Hooammm... qué refrescante es despertar! 🥱🌞\n\n`;
  txt += `Tu estado se recuperó:\n`;
  txt += `❤️ Salud: ${oldHealth} 📈 *${user.rpg.health}*\n`;
  txt += `⚡ Resistencia: ${oldStamina} 📈 *${user.rpg.stamina}*\n\n`;
  txt += `Si te da pereza esperar el descanso, puedes comprar pociones en \`.shop\` y escribir \`.use potion\` para curarte al instante! 🥤💖`;

  db.save();
  await m.reply(txt);
}

export { pluginConfig as config, handler };
