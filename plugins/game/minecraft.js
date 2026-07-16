import { getDatabase } from "../../src/lib/ourin-database.js";
import {
  getOrCreateMCUser,
  getRandomOre,
  formatMoney,
  addPickExp,
  addPlayerExp,
  getUpgradedStats,
  doGachaPull,
  getStreakBonus,
  doCombat,
  doSmelt,
  doCraft,
  doJackpotPull,
  applyJackpotReward,
  getAvailableMobs,
  healPlayer,
  JACKPOT_POOLS,
} from "../../src/lib/ourin-minecraft.js";
import {
  biomes,
  travelRequirements,
  pickaxes,
  pickEnchants,
  mobData,
  RARITY_EMOJI,
  UPGRADES,
  DAILY_REWARDS,
  TOKEN_SHOP,
  GACHA_COST_COINS,
  GACHA_PITY_LIMIT,
  SMELT_RECIPES,
  CRAFT_RECIPES,
} from "../../src/lib/ourin-minecraft-data.js";
import config from "../../config.js";
import path from "path";
import fs from "fs";

const MC = 15;
const rc = (r) => RARITY_EMOJI[r] || "⬜";
const encCost = (r) =>
  ({
    common: 60000,
    rare: 600000,
    epic: 6e6,
    legendary: 6e7,
    mythic: 6e8,
    godly: 6e9,
    secret: 6e10,
  })[r] || 60000;

let thumbMC = null;
try {
  const p = path.join(process.cwd(), "assets", "images", "ourin-minecraft.jpg");
  if (fs.existsSync(p)) thumbMC = fs.readFileSync(p);
} catch (e) {}

function ctx() {
  const sId = config.saluran?.id || "120363400911374213@newsletter";
  const sName = config.saluran?.name || config.bot?.name || "Luffy-AI";
  return {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: sId,
      newsletterName: sName,
      serverMessageId: 127,
    },
  };
}

function send(sock, m, text, title, body) {
  const msgId = sock.sendPreview(
    m.chat,
    {
      caption: `${config.info.website} ${text}`,
      url: `${config.info.website}`,
      title: `𝗠𝗜𝗡𝗘𝗖𝗥𝗔𝗙𝗧 𝗚𝗔𝗠𝗘𝗦`,
      description: `⛏️ mina, 🛠️ fabrica, y ⚔️ combate mobs en el mundo de minecraft`,
      jpegThumbnail: thumbMC,
      previewType: 0,
    },
    { quoted: m },
  );
  return { key: { id: msgId, remoteJid: m.chat, fromMe: true } };
}

const pluginConfig = {
  name: "mct",
  alias: ["minecraft"],
  category: "game",
  description: "Minecraft - Juego de Mineria y Fabricacion",
  usage: ".mct <command>",
  example: ".mct help",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const cmd = m.command || m.body?.split(" ")[0]?.slice(1)?.toLowerCase() || "";
  const args = m.args || m.body?.split(" ").slice(1) || [];
  const sub = args[0]?.toLowerCase() || "";
  const sa = args.slice(1);

  if (cmd === "minecraft") {
    if (!sub || sub === "on" || sub === "off") {
      if (!m.isGroup) return m.reply("_Solo en grupos_");
      if (!m.isOwner && !m.isAdmin) return m.reply("_Solo admin/propietario_");
      const gd = db.getGroup(m.chat) || {};
      if (sub === "on") {
        gd.minecraftEnabled = true;
        db.setGroup(m.chat, gd);
        return send(
          sock,
          m,
          `*🧱 MINECRAFT ACTIVADO*\n\n🎮 ¡Todos los miembros deben jugar Minecraft!\n🪧 Escribe \`.mct help\` para comenzar`,
          "🧱 Minecraft ON",
          "✅ Activo",
        );
      }
      if (sub === "off") {
        gd.minecraftEnabled = false;
        db.setGroup(m.chat, gd);
        return send(
          sock,
          m,
          `*🧱 MINECRAFT DESACTIVADO*`,
          "🧱 Minecraft OFF",
          "❌ Desactivado",
        );
      }
      return m.reply(
        `*🧱 Minecraft:* ${gd.minecraftEnabled ? "✅ ON" : "❌ OFF"}\n\`.minecraft on/off\``,
      );
    }
  }

  if (cmd !== "mct" && cmd !== "minecraft") return;

  if (!sub || sub === "help" || sub === "menu") {
    return send(
      sock,
      m,
      `*🧱 MINECRAFT GAME*\n_⛏️ Sistema de mineria y 🛠️ fabricacion mas completo_\n\n` +
        `*⛏️ MINERIA*\n\`.mct mine\` _⛏️ Empezar a minar_\n\`.mct collect\` _📦 Recoger resultados_\n\`.mct sell\` _💸 Vender mineral_\n\`.mct orebook\` _📚 Coleccion de minerales_\n\`.mct top\` _🏆 Tabla de clasificacion_\n\n` +
        `*⚔️ COMBATE*\n\`.mct fight\` _👹 Lista de mobs_\n\`.mct fight <mob>\` _⚔️ Luchar contra mob_\n\`.mct heal\` _❤️ Curar HP_\n\`.mct stats\` _📊 Estadisticas detalladas_\n\n` +
        `*👤 PERFIL*\n\`.mct me\` _🪪 Tu perfil_\n\`.mct daily\` _🎁 Recompensa diaria_\n\n` +
        `*🗺️ BIOMA Y PIQUETA*\n\`.mct travel\` _🗺️ Lista de biomas_\n\`.mct travel <biome>\` _🚪 Cambiar bioma_\n\`.mct shop\` _🛒 Tienda de picquetas_\n\`.mct buy <pick>\` _💰 Comprar piqueta_\n\`.mct equip <pick>\` _🪓 Equipar piqueta_\n\`.mct picks\` _🎒 Coleccion de picquetas_\n\`.mct enchant <key>\` _✨ Mejorar piqueta_\n\`.mct enchants\` _📜 Lista de mejoras_\n\`.mct pickup\` _⬆️ Subir nivel de piqueta_\n\n` +
        `*🔥 FABRICACION Y FUNDICION*\n\`.mct smelt\` _🔥 Fundir todos los minerales_\n\`.mct craft\` _🛠️ Lista de recetas_\n\`.mct craft <id>\` _🧪 Fabricar item_\n\`.mct inv\` _🎒 Inventario_\n\n` +
        `*👑 PRESTIGIO*\n\`.mct prestige\` _👑 Info de prestigio_\n\`.mct tokens\` _🪙 Tienda de tokens_\n\`.mct upgrade\` _📈 Mejorar estadisticas_\n\`.mct gacha\` _🎰 Gacha_\n\`.mct gacha ticket\` _🎟️ Gacha con ticket_\n\n` +
        `*🎰 JACKPOT*\n\`.mct jackpot\` _🎰 Lista de jackpot_\n\`.mct jackpot <tier>\` _💎 Jugar jackpot_\n_🎁 El jackpot puede dar _Premium_, _Partner_, _Energia_, _Limite_, ¡incluso _ILIMITADO_!_`,
      "🧱 Minecraft Game",
      "⛏️ Mining & 🛠️ Crafting",
    );
  }

  if (sub === "mine") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    if (mc.miningPending && mc.miningPending.length > 0)
      return m.reply(`_📦 ¡Todavia hay resultados de mina!_ \`.mct collect\` _primero._`);
    const now = Date.now();
    if (mc.lastMineTime && now - mc.lastMineTime < MC * 1000)
      return m.reply(
        `_⏳ Espera *${Math.ceil((MC * 1000 - (now - mc.lastMineTime)) / 1000)}* segundos_`,
      );
    const pk = mc.usedPickaxe || "woodpick";
    const pick = mc.pickaxes[pk];
    if (!pick) return m.reply(`_🪓 ¡No hay piqueta activa!_ \`.mct picks\``);
    const bk = mc.currentBiome || "plains";
    const st = getUpgradedStats(mc, pick);
    const ePick = {
      ...pick,
      luck: st.luck,
      speed: st.speed,
      fortuneBonus: st.fortune,
      sellMultiplier: st.sellMultiplier,
    };
    const ores = [];
    let tv = 0;
    for (let i = 0; i < (pick.comboOre || 1); i++) {
      const ore = getRandomOre(ePick, bk);
      if (ore) {
        ore.price = Math.round(ore.price * getStreakBonus(mc.streak || 0).mult);
        ores.push(ore);
        tv += ore.price;
      }
    }
    mc.miningPending = ores;
    mc.lastMineTime = now;
    mc.streak = (mc.streak || 0) + 1;
    await send(
      sock,
      m,
      `*_⛏️ Minando en ${biomes[bk]?.name || bk}..._*\n_🪓 Piqueta: ${pick.name} | 🍀 Suerte: ${(st.luck * 100).toFixed(1)}%_`,
      "⛏️ Minando...",
      biomes[bk]?.name || "",
    );
    await new Promise((r) =>
      setTimeout(
        r,
        Math.min(Math.max(2000, 5000 - (pick.speed || 0) * 3000), 4000),
      ),
    );
    let txt = `*⛏️ ¡RESULTADO DE MINERIA!*\n\n`;
    for (const o of ores) {
      txt += `${rc(o.rarity)} *${o.name}*\n   _💰 ${formatMoney(o.price)} | 📦 x${o.stack}_\n`;
    }
    txt += `\n*💰 Total: ${formatMoney(tv)}*`;
    if (mc.streak >= 3) txt += `\n_🔥 Streak: ${mc.streak}x_`;
    txt += `\n\n\`.mct collect\` para 📦 recoger!`;
    db.markDirty("users");
    return send(sock, m, txt, "⛏️ ¡Resultado de Mineria!", `💰 ${formatMoney(tv)}`);
  }

  if (sub === "collect") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    if (!mc.miningPending || mc.miningPending.length === 0)
      return m.reply(`_📭 No hay resultados._ \`.mct mine\` _primero!_`);
    const ores = mc.miningPending;
    let tv = 0,
      te = 0,
      nf = [];
    for (const ore of ores) {
      tv += ore.price;
      te += Math.max(10, Math.floor(ore.price / 50));
      const cn = ore.name.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
      if (!mc.oreFound.includes(cn)) {
        mc.oreFound.push(cn);
        nf.push(cn);
      }
    }
    mc.money = (mc.money || 0) + tv;
    mc.blocksMined =
      (mc.blocksMined || 0) + ores.reduce((a, o) => a + (o.stack || 1), 0);
    mc.totalEarned = (mc.totalEarned || 0) + tv;
    mc.inventory = [...(mc.inventory || []), ...ores];
    const rlu = addPickExp(mc, mc.usedPickaxe || "woodpick", te);
    const plu = addPlayerExp(mc, te);
    mc.miningPending = [];
    let txt = `*📦 ¡RESULTADOS RECOGIDOS!*\n\n💰 +${formatMoney(tv)}\n⭐ +${te} EXP\n🧱 +${ores.length} mineral\n`;
    if (nf.length > 0) txt += `\n*🆕 Mineral Nuevo:* ${nf.join(", ")}`;
    if (rlu) txt += `\n\n${rlu}`;
    if (plu) txt += `\n*⬆️ ¡SUBISTE DE NIVEL! Nivel ${mc.level}*`;
    db.markDirty("users");
    return send(sock, m, txt, "📦 ¡Resultados Recogidos!", `💰 +${formatMoney(tv)}`);
  }

  if (sub === "sell") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    if (!mc.inventory || mc.inventory.length === 0)
      return m.reply(`_🎒 ¡Inventario vacio!_ \`.mct mine\` _primero._`);
    let tv = 0;
    for (const item of mc.inventory) tv += item.price || 0;
    const sb = UPGRADES.fortune.effect(mc.fortuneUpgrade || 0);
    const pick = mc.pickaxes[mc.usedPickaxe || "woodpick"];
    const rsm = pick ? pick.sellMultiplier || 0 : 0;
    const fv = Math.round(tv * (1 + sb + rsm));
    const fc2 = mc.inventory.length;
    mc.money = (mc.money || 0) + fv;
    mc.totalEarned = (mc.totalEarned || 0) + fv;
    mc.inventory = [];
    db.markDirty("users");
    return send(
      sock,
      m,
      `*💸 ¡MINERAL VENDIDO!*\n\n📦 Cantidad: ${fc2}\n💰 Total: ${formatMoney(fv)}\n🏦 Saldo: ${formatMoney(mc.money)}`,
      "💸 ¡Mineral Vendido!",
      `💰 ${formatMoney(fv)}`,
    );
  }

  if (sub === "me") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const pick = mc.pickaxes[mc.usedPickaxe || "woodpick"];
    return send(
      sock,
      m,
      `*👤 PERFIL DEL MINERO*\n\n*⬆️ Nivel:* ${mc.level} _(${mc.exp}/${mc.expToNextLevel} EXP)_\n*💰 Dinero:* ${formatMoney(mc.money)}\n*❤️ HP:* ${mc.hp}/${mc.maxHp}\n*⚔️ ATK:* ${mc.atk}\n*🧱 Bloques:* ${mc.blocksMined}\n*🪓 Piqueta:* ${pick ? pick.name : "🪵 Wooden Pickaxe"} _(Lv.${pick ? pick.level : 1})_\n*🗺️ Bioma:* ${biomes[mc.currentBiome] ? biomes[mc.currentBiome].name : mc.currentBiome}\n*🔥 Racha:* ${mc.streak || 0}\n*⚔️ Combate:* ${mc.combatWins || 0}V/${mc.combatLosses || 0}D\n*👑 Prestigio:* ${mc.prestige || 0}\n*🪙 Tokens:* ${mc.prestigeTokens || 0}\n*🎟️ Tickets:* ${mc.gachaTickets || 0}\n*📚 LibroMinerales:* ${mc.oreFound ? mc.oreFound.length : 0}\n*📈 Mejoras:*\n  _🍀 Suerte: Nv.${mc.luckUpgrade || 0}_\n  _⚡ Velocidad: Nv.${mc.speedUpgrade || 0}_\n  _💎 Fortuna: Nv.${mc.fortuneUpgrade || 0}_\n  _⚔️ Combate: Nv.${mc.combatUpgrade || 0}_`,
      "👤 Perfil",
      `⬆️ Level ${mc.level}`,
    );
  }

  if (sub === "stats") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const pick = mc.pickaxes[mc.usedPickaxe || "woodpick"];
    const st = getUpgradedStats(mc, pick);
    let txt = `*📊 ESTADISTICAS DETALLADAS*\n\n*🪓 Piqueta: ${pick ? pick.name : "Ninguna"}*\n  _⬆️ Nv.${pick ? pick.level : 1}/${pick ? pick.maxLevel : 5} | ⭐ EXP ${pick ? pick.exp : 0}/${pick ? pick.expToNextLevel : 100}_\n  _🍀 Suerte: ${(st.luck * 100).toFixed(1)}% | ⚡ Velocidad: ${(st.speed * 100).toFixed(1)}%_\n  _💎 Fortuna: +${(st.fortune * 100).toFixed(1)}% | 💰 Venta: +${(st.sellMultiplier * 100).toFixed(1)}%_\n`;
    if (pick && pick.enchant) {
      const e = pickEnchants[pick.enchant];
      txt += `  _✨ Enchant: ${e ? e.name : pick.enchant} (${e ? e.rarity : "?"})_\n`;
    }
    txt += `\n*⚔️ Combate*\n  _⚔️ ATK: ${mc.atk} | ❤️ HP: ${mc.hp}/${mc.maxHp}_\n  _🔥 Bonus de Combate: +${(UPGRADES.combat.effect(mc.combatUpgrade || 0) * 100).toFixed(1)}%_\n  _🏆 Victorias: ${mc.combatWins || 0} | 💀 Derrotas: ${mc.combatLosses || 0}_\n`;
    txt += `\n*📈 Mejoras*\n  _🍀 Suerte: Nv.${mc.luckUpgrade || 0} (+${(UPGRADES.luck.effect(mc.luckUpgrade || 0) * 100).toFixed(1)}%)_\n  _⚡ Velocidad: Nv.${mc.speedUpgrade || 0} (+${(UPGRADES.speed.effect(mc.speedUpgrade || 0) * 100).toFixed(1)}%)_\n  _💎 Fortuna: Nv.${mc.fortuneUpgrade || 0} (+${(UPGRADES.fortune.effect(mc.fortuneUpgrade || 0) * 100).toFixed(1)}%)_\n  _⚔️ Combate: Nv.${mc.combatUpgrade || 0} (+${(UPGRADES.combat.effect(mc.combatUpgrade || 0) * 100).toFixed(1)}%)_`;
    return send(sock, m, txt, "📊 Estadisticas Detalladas", pick ? pick.name : "");
  }

  if (sub === "orebook") {
    const user = getOrCreateMCUser(db, m.sender);
    const found = user.minecraft.oreFound || [];
    if (found.length === 0)
      return m.reply(`_📚 ¡Libro de Minerales vacio!_ \`.mct mine\` _primero_`);
    let txt = `*📚 LIBRO DE MINERALES* _(${found.length} mineral)_\n\n`;
    for (const [k, b] of Object.entries(biomes)) {
      const fl = b.listOre.filter((o) =>
        found.includes(o.name.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim()),
      );
      if (fl.length > 0) {
        txt += `*${b.name}*\n`;
        for (const o of fl) txt += `  ${rc(o.rarity)} ${o.name}\n`;
        txt += `\n`;
      }
    }
    return send(sock, m, txt.trim(), "📚 Libro de Minerales", `🧱 ${found.length} mineral`);
  }

  if (sub === "travel") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    if (!sa[0]) {
      let txt = `*🗺️ LISTA DE BIOMAS*\n\n`;
      for (const [k, b] of Object.entries(biomes)) {
        const req = travelRequirements[k];
        const ok = (mc.travelFound || []).includes(k);
        txt += `${ok ? "✅" : "🔒"} *${b.name}*${mc.currentBiome === k ? " _< Now_" : ""}\n`;
        txt += req
          ? `   _💰 ${formatMoney(req.money)} | 🧱 ${req.blocks} bloques_\n`
          : `   _🆓 Gratis_\n`;
      }
      return send(
        sock,
        m,
        txt + `\n\`.mct travel <biome>\``,
        "🗺️ Lista de Biomas",
        biomes[mc.currentBiome || "plains"]?.name || "",
      );
    }
    const tk = sa[0].toLowerCase();
    if (!biomes[tk]) return m.reply(`_🗺️ ¡Bioma no existe!_ \`.mct travel\``);
    if (mc.currentBiome === tk)
      return m.reply(`_📍 ¡Ya estas en ${biomes[tk].name}!_`);
    const req = travelRequirements[tk];
    if (req) {
      if ((mc.money || 0) < req.money)
        return m.reply(`_💸 ¡Dinero insuficiente! Necesitas ${formatMoney(req.money)}_`);
      if ((mc.blocksMined || 0) < req.blocks)
        return m.reply(`_🧱 ¡Bloques insuficientes! Necesitas ${req.blocks}_`);
      mc.money -= req.money;
    }
    if (!(mc.travelFound || []).includes(tk))
      mc.travelFound = [...(mc.travelFound || []), tk];
    mc.currentBiome = tk;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🚪 ¡CAMBIO DE BIOMA!*\n\n📍 Ahora en *${biomes[tk].name}*\n🧱 ${biomes[tk].listOre.length} tipos de mineral disponibles`,
      "🚪 ¡Viaje!",
      biomes[tk].name,
    );
  }

  if (sub === "shop") {
    let txt = `*🛒 TIENDA DE PIQUETAS*\n\n`;
    for (const [k, pick] of Object.entries(pickaxes)) {
      if (pick.price > 0)
        txt += `*${pick.name}*\n   _💰 ${formatMoney(pick.price)}_\n   _🍀 Luck +${(pick.luck * 100).toFixed(0)}% | ⚡ Speed +${(pick.speed * 100).toFixed(0)}% | 📦 Combo: ${pick.comboOre}_\n   _${pick.description}_\n\n`;
    }
    return send(
      sock,
      m,
      txt + `\`.mct buy <pick>\``,
      "🛒 Tienda de Picquetas",
      "🪓 Elige la mejor piqueta",
    );
  }

  if (sub === "buy") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const pk = sa[0] ? sa[0].toLowerCase() : "";
    if (!pk) return m.reply(`_🪓 ¡Determina la piqueta!_ \`.mct shop\``);
    if (!pickaxes[pk]) return m.reply(`_🪓 ¡Piqueta no existe!_ \`.mct shop\``);
    if (mc.pickaxes[pk])
      return m.reply(`_✅ ¡Ya tienes ${pickaxes[pk].name}!_`);
    if (pickaxes[pk].price === 0)
      return m.reply(`_🪙 ¡Esta piqueta es de Token/Prestigio!_`);
    if ((mc.money || 0) < pickaxes[pk].price)
      return m.reply(
        `_💸 ¡Dinero insuficiente! Necesitas ${formatMoney(pickaxes[pk].price)}_`,
      );
    mc.money -= pickaxes[pk].price;
    mc.pickaxes[pk] = { ...pickaxes[pk] };
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🛍️ ¡PIQUETA COMPRADA!*\n\n*${pickaxes[pk].name}*\n_🪓 Escribe_ \`.mct equip ${pk}\` _para equiparla_`,
      "🪓 ¡Piqueta Nueva!",
      pickaxes[pk].name,
    );
  }

  if (sub === "equip") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const pk = sa[0] ? sa[0].toLowerCase() : "";
    if (!pk) return m.reply(`_🪓 ¡Determina la piqueta!_ \`.mct picks\``);
    if (!mc.pickaxes[pk])
      return m.reply(`_📭 ¡No tienes esta piqueta!_ \`.mct picks\``);
    mc.usedPickaxe = pk;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🪓 ¡PIQUETA EQUIPADA!*\n\n*${mc.pickaxes[pk].name}* _✅ ahora activa_`,
      "🪓 ¡Piqueta Equipada!",
      mc.pickaxes[pk].name,
    );
  }

  if (sub === "picks") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const pks = mc.pickaxes || {};
    if (Object.keys(pks).length === 0)
      return m.reply(`_📭 ¡No tienes picquetas!_`);
    let txt = `*🎒 COLECCION DE PICQUETAS*\n\n`;
    for (const [k, pick] of Object.entries(pks)) {
      txt += `*${pick.name}*${mc.usedPickaxe === k ? " _✅ ACTIVA_" : ""}\n  _⬆️ Nv.${pick.level || 1}/${pick.maxLevel} | 🍀 Suerte ${(pick.luck * 100).toFixed(0)}% | ⚡ Vel ${(pick.speed * 100).toFixed(0)}%_\n`;
      if (pick.enchant)
        txt += `  _✨ Enchant: ${pickEnchants[pick.enchant] ? pickEnchants[pick.enchant].name : pick.enchant}_\n`;
    }
    return send(
      sock,
      m,
      txt + `\n\`.mct equip <pick>\``,
      "🎒 Coleccion de Picquetas",
      `🪓 ${Object.keys(pks).length} pickaxe`,
    );
  }

  if (sub === "enchant") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const pk = mc.usedPickaxe || "woodpick";
    const pick = mc.pickaxes[pk];
    if (!pick) return m.reply(`_🪓 ¡No hay piqueta activa!_`);
    const ek = sa[0] ? sa[0].toLowerCase() : "";
    if (!ek) {
      if (pick.enchant) {
        const e = pickEnchants[pick.enchant];
        return m.reply(
          `_✨ Mejora actual: *${e ? e.name : pick.enchant}* (${e ? e.rarity : "?"})_\n\`.mct enchant <key>\` para cambiar`,
        );
      }
      return m.reply(`_✨ ¡Determina la mejora!_ \`.mct enchants\``);
    }
    if (!pickEnchants[ek])
      return m.reply(`_✨ ¡Mejora no existe!_ \`.mct enchants\``);
    const ench = pickEnchants[ek];
    const cost = encCost(ench.rarity);
    if ((mc.money || 0) < cost)
      return m.reply(`_💸 ¡Dinero insuficiente! Necesitas ${formatMoney(cost)}_`);
    mc.money -= cost;
    pick.enchant = ek;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*✨ ¡MEJORA APLICADA!*\n\n*${ench.name}* _(${ench.rarity})_ en *${pick.name}*\n_${ench.desc}_\n_💰 Costo: ${formatMoney(cost)}_`,
      "✨ Enchant!",
      ench.name,
    );
  }

  if (sub === "enchants") {
    const byR = {};
    for (const [k, e] of Object.entries(pickEnchants)) {
      if (!byR[e.rarity]) byR[e.rarity] = [];
      byR[e.rarity].push({ key: k, name: e.name, desc: e.desc });
    }
    let txt = `*📜 LISTA DE MEJORAS*\n\n`;
    for (const r of [
      "common",
      "rare",
      "epic",
      "legendary",
      "mythic",
      "godly",
      "secret",
    ]) {
      const list = byR[r];
      if (!list) continue;
      txt += `${rc(r)} *${r.toUpperCase()}* _${formatMoney(encCost(r))}_\n`;
      for (const e of list) txt += `  \`${e.key}\`: ${e.name} _${e.desc}_\n`;
      txt += `\n`;
    }
    return send(
      sock,
      m,
      txt.trim() + `\n\`.mct enchant <key>\``,
      "📜 Mejoras",
      "✨ Elige una mejora",
    );
  }

  if (sub === "pickup") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const pk = mc.usedPickaxe || "woodpick";
    const pick = mc.pickaxes[pk];
    if (!pick) return m.reply(`_🪓 ¡No hay piqueta activa!_`);
    if (pick.level >= pick.maxLevel)
      return m.reply(`_⬆️ ¡Piqueta ya esta al nivel maximo!_`);
    const cost =
      Math.floor(pick.price * 0.1 * pick.level) || 12000 * pick.level;
    if ((mc.money || 0) < cost)
      return m.reply(`_💸 ¡Dinero insuficiente! Necesitas ${formatMoney(cost)}_`);
    mc.money -= cost;
    const res = addPickExp(mc, pk, Math.floor(pick.expToNextLevel * 0.5));
    db.markDirty("users");
    return send(
      sock,
      m,
      res
        ? `*⬆️ ¡PIQUETA MEJORADA!*\n\n${res}\n_💰 Costo: ${formatMoney(cost)}_`
        : `*⭐ ¡PIQUETA EXP SUBIO!*\n\n⭐ +${Math.floor(pick.expToNextLevel * 0.5)} EXP\n_💰 Costo: ${formatMoney(cost)}_`,
      "⬆️ ¡Piqueta Mejorada!",
      pick.name,
    );
  }

  if (sub === "fight") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    if (!sa[0]) {
      const mobs = getAvailableMobs(mc);
      if (mobs.length === 0)
        return m.reply(`_👹 ¡No hay mobs disponibles! Sube de nivel primero._`);
      let txt = `*👹 LISTA DE MOBS*\n\n_❤️ HP: ${mc.hp}/${mc.maxHp} | ⚔️ ATK: ${mc.atk}_\n\n`;
      for (const mob of mobs) {
        txt += `${rc(mob.rarity)} *${mob.name}*\n  _❤️ HP: ${mob.hp} | ⚔️ ATK: ${mob.atk} | ⬆️ Lv.${mob.minLevel}+_  \n`;
      }
      txt += `\n\`.mct fight <mob>\` para ⚔️ atacar!`;
      return send(sock, m, txt, "👹 Lista de Mobs", `👾 ${mobs.length} mob`);
    }
    const mk = sa[0].toLowerCase();
    if (!mobData[mk]) return m.reply(`_👹 ¡Mob no existe!_ \`.mct fight\``);
    const result = doCombat(mc, mk);
    if (result.error) return m.reply(`_${result.error}_`);
    db.markDirty("users");
    if (result.won) {
      let txt = `*🏆 ¡VICTORIA!*\n\n⚔️ Contra *${result.mobName}*\n\n`;
      for (const line of result.log) txt += `${line}\n`;
      txt += `\n*⭐ EXP:* +${result.expGain}`;
      if (result.drops.length > 0) {
        txt += `\n*🎁 Drops:*`;
        for (const d of result.drops)
          txt += `\n  ${d.name} _💰 ${formatMoney(d.value)}_`;
      }
      return send(sock, m, txt, "🏆 ¡Victoria!", result.mobName);
    } else {
      let txt = `*💀 ¡DERROTA!*\n\n⚔️ Contra *${result.mobName}*\n\n`;
      for (const line of result.log) txt += `${line}\n`;
      txt += `\n_❤️ HP restante: ${mc.hp}/${mc.maxHp}_\n\`.mct heal\` para ❤️ curar`;
      return send(sock, m, txt, "💀 ¡Derrota!", result.mobName);
    }
  }

  if (sub === "heal") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const result = healPlayer(mc);
    if (result.error) return m.reply(`_${result.error}_`);
    db.markDirty("users");
    return send(
      sock,
      m,
      `*❤️ ¡CURADO!*\n\n❤️ HP: ${result.hp}/${mc.maxHp}\n_💰 Costo: ${formatMoney(result.cost)}_`,
      "❤️ Heal!",
      `❤️ ${result.hp}`,
    );
  }

  if (sub === "smelt") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const result = doSmelt(mc);
    if (result.count === 0)
      return m.reply(`_🔥 ¡No hay minerales para fundir!_`);
    mc.money = (mc.money || 0) + result.totalValue;
    mc.totalEarned = (mc.totalEarned || 0) + result.totalValue;
    let txt = `*🔥 ¡FUNDICION COMPLETADA!*\n\n`;
    for (const s of result.smelted)
      txt += `${s.from} → ${s.to} _💰 ${formatMoney(s.value)}_\n`;
    txt += `\n*💰 Total: ${formatMoney(result.totalValue)}*\n*🏦 Saldo: ${formatMoney(mc.money)}*`;
    db.markDirty("users");
    return send(
      sock,
      m,
      txt,
      "🔥 ¡Fundicion!",
      `💰 ${formatMoney(result.totalValue)}`,
    );
  }

  if (sub === "craft") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    if (!sa[0]) {
      let txt = `*🛠️ LISTA DE RECETAS*\n\n`;
      for (const [k, r] of Object.entries(CRAFT_RECIPES)) {
        const canCraft = (mc.level || 1) >= r.requiredLevel;
        txt += `${canCraft ? "✅" : "🔒"} *${r.name}* _\`${k}\`_\n  _💰 Valor: ${formatMoney(r.value)} | ⬆️ Nv.${r.requiredLevel}+_\n  _🧪 Materiales:_\n`;
        for (const [ing, cnt] of Object.entries(r.ingredients))
          txt += `    _${ing} x${cnt}_\n`;
        txt += `\n`;
      }
      return send(
        sock,
        m,
        txt + `\`.mct craft <id>\``,
        "🛠️ Fabricacion",
        "🧪 Elige una receta",
      );
    }
    const result = doCraft(mc, sa[0].toLowerCase());
    if (result.error) return m.reply(`_${result.error}_`);
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🛠️ ¡FABRICACION EXITOSA!*\n\n*${result.item}*\n_💰 Valor: ${formatMoney(result.value)}_`,
      "🛠️ Crafted!",
      result.item,
    );
  }

  if (sub === "inv" || sub === "inventory") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    if (!mc.inventory || mc.inventory.length === 0)
      return m.reply(`_🎒 ¡Inventario vacio!_`);
    const grouped = {};
    for (const item of mc.inventory) {
      const key = item.name;
      if (!grouped[key]) grouped[key] = { name: item.name, count: 0, value: 0 };
      grouped[key].count++;
      grouped[key].value += item.price || 0;
    }
    let txt = `*🎒 INVENTARIO*\n\n`;
    let totalV = 0;
    for (const g of Object.values(grouped)) {
      txt += `${g.name} _📦 x${g.count} | 💰 ${formatMoney(g.value)}_\n`;
      totalV += g.value;
    }
    txt += `\n*💰 Valor Total: ${formatMoney(totalV)}*`;
    return send(
      sock,
      m,
      txt,
      "🎒 Inventory",
      `📦 ${mc.inventory.length} items`,
    );
  }

  if (sub === "daily") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const now = new Date();
    if (mc.lastDaily) {
      const diff = now.getTime() - new Date(mc.lastDaily).getTime();
      if (diff < 86400000)
        return m.reply(
          `_🎁 ¡Daily ya reclamado! Espera *${Math.ceil((86400000 - diff) / 3600000)}* horas._`,
        );
    }
    const ld = mc.lastDaily ? new Date(mc.lastDaily) : null;
    mc.dailyStreak =
      ld && now.getTime() - ld.getTime() < 172800000
        ? (mc.dailyStreak || 0) + 1
        : 1;
    let rw = DAILY_REWARDS[0];
    for (const r of DAILY_REWARDS) {
      if (mc.dailyStreak >= r.streak) rw = r;
    }
    mc.money = (mc.money || 0) + rw.money;
    mc.gachaTickets = (mc.gachaTickets || 0) + rw.tickets;
    mc.lastDaily = now.toISOString();
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🎁 ¡RECOMPENSA DIARIA!*\n\n*🔥 Racha:* ${mc.dailyStreak} dias\n💰 +${formatMoney(rw.money)}\n🎟️ +${rw.tickets} Tickets Gacha\n*🏦 Saldo:* ${formatMoney(mc.money)}`,
      "🎁 ¡Recompensa Diaria!",
      `🔥 Racha ${mc.dailyStreak}`,
    );
  }

  if (sub === "gacha") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const useT = sa[0] && sa[0].toLowerCase() === "ticket";
    if (useT) {
      if ((mc.gachaTickets || 0) < 1)
        return m.reply(`_🎟️ ¡Tickets agotados! Tienes ${mc.gachaTickets || 0}_`);
      mc.gachaTickets -= 1;
    } else {
      if ((mc.money || 0) < GACHA_COST_COINS)
        return m.reply(
          `_💸 ¡Dinero insuficiente! Necesitas ${formatMoney(GACHA_COST_COINS)}_`,
        );
      mc.money -= GACHA_COST_COINS;
    }
    const result = doGachaPull(mc);
    const item = result.item;
    let txt = `*🎰 ¡RESULTADO GACHA!*\n\n`;
    switch (item.type) {
      case "pickaxe":
        if (pickaxes[item.value] && !mc.pickaxes[item.value]) {
          mc.pickaxes[item.value] = { ...pickaxes[item.value] };
          txt += `🪓 OBTUVISTE PIQUETA: *${item.label}*\n`;
        } else if (mc.pickaxes[item.value]) {
          const ref = Math.floor(
            (pickaxes[item.value] ? pickaxes[item.value].price : 0) * 0.3 ||
              120000,
          );
          mc.money = (mc.money || 0) + ref;
          txt += `♻️ Duplicado: *${item.label}* _💰 +${formatMoney(ref)}_\n`;
        }
        break;
      case "tickets":
        mc.gachaTickets = (mc.gachaTickets || 0) + item.value;
        txt += `🎟️ +${item.value} Tickets\n`;
        break;
      case "tokens":
        mc.prestigeTokens = (mc.prestigeTokens || 0) + item.value;
        txt += `🪙 +${item.value} Tokens\n`;
        break;
      case "coins":
        mc.money = (mc.money || 0) + item.value;
        txt += `💰 +${formatMoney(item.value)}\n`;
        break;
      case "enchant_scroll": {
        const avail = Object.entries(pickEnchants).filter(
          ([, v]) => v.rarity === item.value,
        );
        if (avail.length > 0) {
          const [ek2, ed] = avail[Math.floor(Math.random() * avail.length)];
          const pk2 = mc.usedPickaxe || "woodpick";
          if (mc.pickaxes[pk2]) {
            mc.pickaxes[pk2].enchant = ek2;
            txt += `✨ Mejora: *${ed.name}* _(${item.value})_ en piqueta!\n`;
          }
        }
        break;
      }
      case "xp_boost":
        mc.exp = (mc.exp || 0) + Math.floor(mc.expToNextLevel * 0.5);
        txt += `⭐ XP Boost x${item.value}!\n`;
        break;
      default:
        txt += `${item.label}\n`;
    }
    if (result.isSSR) txt += `\n*🌈 SSR PULL!*`;
    if (result.pity) txt += `\n*🔥 Pity Activated!*`;
    txt += `\n\n_🔥 Pity: ${mc.gachaPity}/${GACHA_PITY_LIMIT}_\n_🏦 Saldo: ${formatMoney(mc.money)} | 🎟️ Tickets: ${mc.gachaTickets}_`;
    db.markDirty("users");
    return send(
      sock,
      m,
      txt,
      "🎰 Gacha!",
      result.isSSR ? "🌈 SSR PULL!" : "🎁 Result",
    );
  }

  if (sub === "upgrade") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const type = sa[0] ? sa[0].toLowerCase() : "";
    if (!type || !UPGRADES[type]) {
      let txt = `*📈 TIENDA DE MEJORAS*\n\n`;
      for (const [k, u] of Object.entries(UPGRADES)) {
        const lv = mc[k + "Upgrade"] || 0;
        txt += `*${u.name}* _(Nv.${lv}/${u.maxLevel})_\n  _${u.desc}_\n  ${lv >= u.maxLevel ? "_✅ MAXIMizado_" : `_💰 Siguiente: ${formatMoney(u.getCost(lv))}_`}\n\n`;
      }
      return send(
        sock,
        m,
        txt + `\`.mct upgrade <luck/speed/fortune/combat>\``,
        "📈 Tienda de Mejoras",
        "⬆️ Mejora tus estadisticas",
      );
    }
    const upg = UPGRADES[type];
    const lv = mc[type + "Upgrade"] || 0;
    if (lv >= upg.maxLevel) return m.reply(`_✅ ¡Ya esta al maximo!_`);
    const cost = upg.getCost(lv);
    if ((mc.money || 0) < cost)
      return m.reply(`_💸 ¡Dinero insuficiente! Necesitas ${formatMoney(cost)}_`);
    mc.money -= cost;
    mc[type + "Upgrade"] = lv + 1;
    if (type === "combat")
      mc.atk = 4 + Math.floor(mc.level * 0.5) + (lv + 1) * 3;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*⬆️ ¡${upg.name} SUBISTE DE NIVEL!*\n\n_⬆️ Nivel ${lv + 1}_\n_💰 Costo: ${formatMoney(cost)}_\n_${upg.desc}_`,
      "📈 Upgrade!",
      `${upg.name} Lv.${lv + 1}`,
    );
  }

  if (sub === "prestige") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const cp = mc.prestige || 0;
    if (sa[0] && sa[0].toLowerCase() === "confirm") {
      const reqs = [
        { blocks: 500, money: 2e10 },
        { blocks: 1500, money: 2e12 },
        { blocks: 4000, money: 2e14 },
        { blocks: 10000, money: 2e19 },
        { blocks: 25000, money: 2e22 },
      ];
      const req = reqs[cp];
      if (!req)       return m.reply(`_👑 ¡Prestigio maximo alcanzado!_`);
      if ((mc.blocksMined || 0) < req.blocks)
        return m.reply(`_🧱 ¡Bloques insuficientes! Necesitas ${req.blocks}_`);
      if ((mc.money || 0) < req.money)
        return m.reply(`_💸 ¡Dinero insuficiente! Necesitas ${formatMoney(req.money)}_`);
      mc.prestige = cp + 1;
      mc.money = Math.floor(mc.money * 0.1);
      mc.blocksMined = 0;
      mc.streak = 0;
      mc.prestigeTokens =
        (mc.prestigeTokens || 0) + [60, 180, 600, 1200, 6000][cp];
      const titles = [
        "Minero Novato",
        "Veterano",
        "Maestro Minero",
        "Leyenda",
        "Trascendente",
        "Dios de la Mineria",
      ];
      if (cp === 0 && !mc.pickaxes.prestigepick)
        mc.pickaxes.prestigepick = { ...pickaxes.prestigepick };
      if (cp === 2 && !mc.pickaxes.cosmicpick)
        mc.pickaxes.cosmicpick = { ...pickaxes.cosmicpick };
      db.markDirty("users");
      return send(
        sock,
        m,
        `*👑 ¡PRESTIGIO SUBIDO!*\n\n*🏷️ Titulo:* ${titles[mc.prestige]}\n*🪙 Tokens:* ${mc.prestigeTokens}\n\n_💸 Dinero -90%, 🧱 conteo de bloques reiniciado_`,
        "👑 PRESTIGE!",
        titles[mc.prestige],
      );
    }
    let txt = `*👑 SISTEMA DE PRESTIGIO*\n\n*👑 Prestigio:* ${cp}\n*🪙 Tokens:* ${mc.prestigeTokens || 0}\n\n`;
    const allReqs = [
      { lv: 1, blocks: 500, money: 2e10, rw: "Prestige Pickaxe + 60 tokens" },
      { lv: 2, blocks: 1500, money: 2e12, rw: "Luck +20% + 180 tokens" },
      { lv: 3, blocks: 4000, money: 2e14, rw: "Cosmic Pickaxe + 600 tokens" },
      { lv: 4, blocks: 10000, money: 2e19, rw: "2x EXP + 1200 tokens" },
      { lv: 5, blocks: 25000, money: 2e22, rw: "Omega Pickaxe + 6000 tokens" },
    ];
    for (const r of allReqs)
      txt += `${cp >= r.lv ? "✅" : "🔒"} *P${r.lv}*: _🧱 ${r.blocks} blocks | 💰 ${formatMoney(r.money)}_\n  _${r.rw}_\n\n`;
    return send(
      sock,
      m,
      txt + `\`.mct prestige confirm\` _(con cuidado!)_`,
      "👑 Prestige",
      `P${cp}`,
    );
  }

  if (sub === "tokens") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    if (!sa[0]) {
      let txt = `*🪙 TIENDA DE TOKENS*\n\n*🪙 Tokens:* ${mc.prestigeTokens || 0}\n\n`;
      for (const item of TOKEN_SHOP)
        txt += `*${item.name}* _🪙 ${item.cost} tokens_\n`;
      return send(
        sock,
        m,
        txt + `\n\`.mct tokens <id>\``,
        "🪙 Tienda de Tokens",
        `🪙 ${mc.prestigeTokens || 0} tokens`,
      );
    }
    const iid = sa[0].toLowerCase();
    const item = TOKEN_SHOP.find((i) => i.id === iid);
    if (!item) return m.reply(`_🛒 ¡Item no existe!_ \`.mct tokens\``);
    if ((mc.prestigeTokens || 0) < item.cost)
      return m.reply(`_🪙 ¡Tokens insuficientes! Necesitas ${item.cost}_`);
    mc.prestigeTokens -= item.cost;
    switch (item.type) {
      case "pickaxe":
        if (pickaxes[item.value] && !mc.pickaxes[item.value]) {
          mc.pickaxes[item.value] = { ...pickaxes[item.value] };
        } else {
          mc.prestigeTokens += item.cost;
          return m.reply(`_✅ ¡Ya tienes esta piqueta!_`);
        }
        break;
      case "tickets":
        mc.gachaTickets = (mc.gachaTickets || 0) + item.value;
        break;
      case "coins":
        mc.money = (mc.money || 0) + item.value;
        break;
    }
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🛍️ ¡ITEM COMPRADO!*\n\n*${item.name}* _por 🪙 ${item.cost} tokens_`,
      "🪙 ¡Tienda de Tokens!",
      item.name,
    );
  }

  if (sub === "jackpot") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    if (!sa[0]) {
      let txt = `*🎰 SISTEMA JACKPOT*\n\n_💎 Sistema de jackpot con premios super grandes!_\n_🎁 Puedes ganar _Premium_, _Partner_, _Energia_, _Limite_, ¡incluso _ILIMITADO_!_\n\n`;
      for (const pool of JACKPOT_POOLS) {
        txt += `*${pool.name}*\n  _💰 Costo: ${formatMoney(pool.cost)}_\n  _🎯 Tasa: ${pool.weight}%_\n  _🎁 Premios:_\n`;
        for (const rw of pool.rewards) {
          const label =
            {
              coins: "Monedas",
              energi: "Energia",
              limit: "Limite",
              tickets: "Boletos Gacha",
              tokens: "Tokens Prestigio",
              exp_boost: "Boost EXP",
              premium_7d: "Premium 7 Dias",
              premium_30d: "Premium 30 Dias",
              partner_7d: "Partner 7 Dias",
              partner_30d: "Partner 30 Dias",
              unlimited_energi: "Energia ILIMITADA",
              unlimited_limit: "Limite ILIMITADO",
              owner_reward: "RECOMPENSA DE PROPIETARIO",
            }[rw.type] || rw.type;
          txt += `    _${label}: ${rw.min === rw.max ? rw.min : `${rw.min}-${rw.max}`} (${rw.weight}%)_\n`;
        }
        txt += `\n`;
      }
      return send(
        sock,
        m,
        txt + `\`.mct jackpot <iron/gold/diamond/netherite/dragon>\``,
        "🎰 Jackpot!",
        "💎 Premios Super Grandes",
      );
    }
    const poolId = sa[0].toLowerCase();
    const pool = JACKPOT_POOLS.find((p) => p.id === poolId);
    if (!pool) return m.reply(`_🎰 ¡Nivel no existe!_ \`.mct jackpot\``);
    if ((mc.money || 0) < pool.cost)
      return m.reply(`_💸 ¡Dinero insuficiente! Necesitas ${formatMoney(pool.cost)}_`);
    mc.money -= pool.cost;
    const result = doJackpotPull(mc, poolId);
    if (!result) return m.reply(`_❌ Error! Intentalo de nuevo._`);
    const applied = applyJackpotReward(db, mc, m.sender, result);
    db.markDirty("users");
    let txt = `*🎰 ${pool.name.toUpperCase()}!*\n\n`;
    const isBig = [
      "premium_7d",
      "premium_30d",
      "partner_7d",
      "partner_30d",
      "unlimited_energi",
      "unlimited_limit",
      "owner_reward",
    ].includes(result.reward.type);
    if (isBig) txt += `*💥 ¡JACKPOT GRANDE!*\n\n`;
    txt += `${applied.desc}\n\n_💰 Costo: ${formatMoney(pool.cost)}_\n_🏦 Saldo: ${formatMoney(mc.money)}_`;
    return send(
      sock,
      m,
      txt,
      isBig ? "💥 ¡JACKPOT GRANDE!" : `🎰 ${pool.name}`,
      applied.desc,
    );
  }

  if (sub === "top") {
    const users = db.db.data.users || {};
    const rankings = [];
    for (const [jid, ud] of Object.entries(users)) {
      if (ud.minecraft)
        rankings.push({
          jid,
          blocksMined: ud.minecraft.blocksMined || 0,
          money: ud.minecraft.money || 0,
          level: ud.minecraft.level || 1,
          prestige: ud.minecraft.prestige || 0,
        });
    }
    if (rankings.length === 0) return m.reply(`_👤 ¡Todavia no hay jugadores!_`);
    rankings.sort((a, b) => {
      if (b.prestige !== a.prestige) return b.prestige - a.prestige;
      if (b.blocksMined !== a.blocksMined) return b.blocksMined - a.blocksMined;
      return b.money - a.money;
    });
    let txt = `*🏆 TABLA DE CLASIFICACION MINECRAFT*\n\n`;
    const top = rankings.slice(0, 10);
    for (let i = 0; i < top.length; i++) {
      const p = top[i];
      const medal =
        i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
      txt += `${medal} @${p.jid}\n  _👑 P${p.prestige} | 🧱 ${p.blocksMined} bloques | 💰 ${formatMoney(p.money)}_\n`;
    }
    return send(sock, m, txt.trim(), "🏆 Tabla de Clasificacion", "👑 Mejores Jugadores");
  }
}

export { pluginConfig as config, handler };
