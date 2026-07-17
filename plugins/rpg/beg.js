import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
const pluginConfig = {
  name: "beg",
  alias: ["ngemis", "minta"],
  category: "rpg",
  description: "Mendigar para obtener dinero suelto",
  usage: ".beg",
  example: ".beg",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  await m.reply("🙏 *sᴇᴅᴀɴɢ ᴍᴇɴɢᴇᴍɪs...*");
  await new Promise((r) => setTimeout(r, 2000));

  const responses = [
    { success: true, money: 500, exp: 10, msg: "¡Un benefactor te dio dinero!" },
    { success: true, money: 1000, exp: 20, msg: "¡Recibiste propina de una buena persona!" },
    { success: true, money: 2000, exp: 50, msg: "¡Vaya! ¡Un sultán se apiadó de ti!" },
    { success: false, money: 0, exp: 0, msg: "Nadie te hizo caso..." },
    { success: false, money: 0, exp: 0, msg: "La gente te ignoró..." },
    { success: true, money: 100, exp: 5, msg: "¡Conseguiste monedas de los bolsillos ajenos!" },
    { success: false, money: -500, exp: 0, msg: "¡Te asaltó otro mendigo!" },
  ];

  const result = responses[Math.floor(Math.random() * responses.length)];

  if (result.money > 0) {
    user.belly = (user.belly || 0) + result.money;
    if (result.exp > 0) {
      await addExpWithLevelCheck(sock, m, db, user, result.exp);
    }
  } else if (result.money < 0) {
    user.belly = Math.max(0, (user.belly || 0) + result.money);
  }

  db.save();

  let txt = "";
  if (result.success && result.money > 0) {
    txt = `🙏 *Mendicación Exitosa*\n\n> ${result.msg}\n> 💰 Ganaste: *+Belly ${result.money.toLocaleString("es-ES")}*`;
    if (result.exp > 0) txt += `\n> 🚄 Exp: *+${result.exp}*`;
  } else if (result.money < 0) {
    txt = `😭 *Mendicación Fallida*\n\n> ${result.msg}\n> 💸 Perdiste: *Belly ${Math.abs(result.money).toLocaleString("es-ES")}*`;
  } else {
    txt = `😢 *Mendicación Fallida*\n\n> ${result.msg}`;
  }

  await m.reply(txt);
}

export { pluginConfig as config, handler };
