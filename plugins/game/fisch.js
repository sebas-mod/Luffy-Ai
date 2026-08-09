import { getDatabase } from "../../src/lib/luffy-database.js";
import {
  getOrCreateFischUser,
  getRandomFish,
  formatMoney,
  addRodExp,
  addPlayerExp,
  getUpgradedStats,
  doGachaPull,
  getStreakBonus,
  JACKPOT_POOLS,
  doJackpotPull,
  applyJackpotReward,
} from "../../src/lib/luffy-fisch.js";
import {
  islands,
  travelRequirements,
  fishingRod,
  rodEnchants,
  mutations,
  RARITY_EMOJI,
  UPGRADES,
  DAILY_REWARDS,
  TOKEN_SHOP,
  GACHA_COST_COINS,
  GACHA_PITY_LIMIT,
} from "../../src/lib/luffy-fisch-data.js";
import config from "../../config.js";
import path from "path";
import fs from "fs";

const FC = 15;
const rc = (r) => RARITY_EMOJI[r] || "W";
const encCost = (r) =>
  ({
    common: 50000,
    rare: 500000,
    epic: 5e6,
    legendary: 5e7,
    mythic: 5e8,
    godly: 5e9,
    secret: 5e10,
  })[r] || 50000;

let thumbFish = null;
try {
  const p = path.join(process.cwd(), "assets", "images", "luffy-fishit.jpg");
  if (fs.existsSync(p)) thumbFish = fs.readFileSync(p);
} catch (e) {}

function ctx(title, body) {
  const sId = config.saluran?.id || "120363400911374213@newsletter";
  const sName = config.saluran?.name || config.bot?.name || "Luffy-Ai";
  const c = {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: sId,
      newsletterName: sName,
      serverMessageId: 127,
    },
  };
  return c;
}

function send(sock, m, text, title, body) {
  const msgId = sock.sendPreview(
    m.chat,
    {
      caption: `${config.info.website} ${text}`,
      url: `${config.info.website}`,
      title: `𝗙𝗜𝗦𝗛 𝗜𝗧 𝗚𝗔𝗠𝗘𝗦`,
      description: `consigue premios y diversión con tu pesca`,
      jpegThumbnail: thumbFish,
      previewType: 0,
    },
    { quoted: m },
  );
  return { key: { id: msgId, remoteJid: m.chat, fromMe: true } };
}

const pluginConfig = {
  name: "fisht",
  alias: ["fishit"],
  category: "game",
  description: "Fishit - Juego de Cañas de Pescar",
  usage: ".fisht <comando>",
  example: ".fisht help",
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
  const cmd = m.command || m.body?.split(" ")[0]?.slice(1)?.toLowerCase() || "";
  const args = m.args || m.body?.split(" ").slice(1) || [];
  const sub = args[0]?.toLowerCase() || "";
  const sa = args.slice(1);

  if (cmd === "fishit") {
    if (!sub || sub === "on" || sub === "off") {
      if (!m.isGroup) return m.reply("_Toggle solo en grupos_");
      if (!m.isOwner && !m.isAdmin) return m.reply("_Solo admin/owner_");
      const gd = db.getGroup(m.chat) || {};
      if (sub === "on") {
        gd.fishitEnabled = true;
        db.setGroup(m.chat, gd);
        return send(
          sock,
          m,
          `*FISHIT HABILITADO*\n\nTodos los miembros deben jugar Fishit!\nEscribe \`.fisht help\` para empezar`,
          "Fishit ON",
          "Activar",
        );
      }
      if (sub === "off") {
        gd.fishitEnabled = false;
        db.setGroup(m.chat, gd);
        return send(sock, m, `*FISHIT DESHABILITADO*`, "Fishit OFF", "Desactivar");
      }
      return m.reply(
        `*Fishit:* ${gd.fishitEnabled ? "ON" : "OFF"}\n\`.fishit on/off\``,
      );
    }
  }

  if (cmd !== "fisht" && cmd !== "fishit") return;

  if (!sub || sub === "help" || sub === "menu") {
    return send(
      sock,
      m,
      `*FISHIT GAME*\n_El sistema de pesca más completo_\n\n` +
        `*PESCAR*\n\`.fisht mancing\` _Empezar a pescar_\n\`.fisht view\` _Recoger capturas_\n\`.fisht sell\` _Vender peces_\n\`.fisht fishbook\` _Colección de peces_\n\`.fisht mutbook\` _Colección de mutaciones_\n\`.fisht top\` _Leaderboard_\n\n` +
        `*PERFIL*\n\`.fisht me\` _Tu perfil_\n\`.fisht stats\` _Stats detallados_\n\`.fisht daily\` _Recompensa diaria_\n\n` +
        `*ISLAS Y CAÑA*\n\`.fisht travel\` _Lista de islas_\n\`.fisht travel <isla>\` _Cambiar de isla_\n\`.fisht shop\` _Tienda de cañas_\n\`.fisht buy <caña>\` _Comprar caña_\n\`.fisht equip <caña>\` _Equipar caña_\n\`.fisht rods\` _Colección de cañas_\n\`.fisht enchant <key>\` _Encantar caña_\n\`.fisht enchants\` _Lista de encantamientos_\n\`.fisht rodup\` _Mejorar caña_\n\n` +
        `*PRESTIGIO*\n\`.fisht prestige\` _Info de prestigio_\n\`.fisht tokens\` _Tienda de tokens_\n\`.fisht upgrade\` _Mejorar stats_\n\`.fisht gacha\` _Gacha_\n\`.fisht gacha ticket\` _Gacha con ticket_\n\n` +
        `*JACKPOT*\n\`.fisht jackpot\` _Lista de jackpots_\n\`.fisht jackpot <tier>\` _Jugar jackpot_\n_El jackpot puede dar _Premium_, _Partner_, _Energía_, _Límite_, ¡incluso _UNLIMITED_!_`,
      "Fishit Game",
      "Juego de Cañas de Pescar",
    );
  }
  if (sub === "mancing" || sub === "fish") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (f.fishingPending && f.fishingPending.length > 0)
      return m.reply(`_¡Aún hay capturas!_ \`.fisht view\` _primero._`);
    const now = Date.now();
    if (f.lastFishTime && now - f.lastFishTime < FC * 1000)
      return m.reply(
        `_Espera *${Math.ceil((FC * 1000 - (now - f.lastFishTime)) / 1000)}* segundos_`,
      );
    const rk = f.usedFishingRod || "basicrod";
    const rod = f.fishingRods[rk];
    if (!rod) return m.reply(`_¡No hay caña activa!_ \`.fisht rods\``);
    const ik = f.currentIsland || "mousewood";
    const st = getUpgradedStats(f, rod);
    const eRod = {
      ...rod,
      luck: st.luck,
      speed: st.speed,
      sellMultiplier: st.sellMultiplier,
    };
    const catches = [];
    let tv = 0;
    for (let i = 0; i < (rod.comboFish || 1); i++) {
      const fish = getRandomFish(eRod, ik);
      if (fish) {
        fish.price = Math.round(
          fish.price * getStreakBonus(f.streak || 0).mult,
        );
        catches.push(fish);
        tv += fish.price;
      }
    }
    f.fishingPending = catches;
    f.lastFishTime = now;
    f.streak = (f.streak || 0) + 1;
    await send(
      sock,
      m,
      `*_Pescando en ${islands[ik]?.name || ik}..._*\n_Caña: ${rod.name} | Luck: ${(st.luck * 100).toFixed(1)}%_`,
      "Pescando...",
      islands[ik]?.name || "",
    );
    await new Promise((r) =>
      setTimeout(
        r,
        Math.min(Math.max(2000, 5000 - (rod.speed || 0) * 3000), 4000),
      ),
    );
    let txt = `*¡RESULTADO DE LA PESCA!*\n\n`;
    for (const c of catches) {
      txt += `${rc(c.rarity)} *${c.name}*\n   _${formatMoney(c.price)} | ${c.kg}kg_\n`;
      if (c.isMutated)
        txt += `   _Mutación: ${c.mutations.filter((x) => x !== "Normal").join(", ")}_\n`;
    }
    txt += `\n*Total: ${formatMoney(tv)}*`;
    if (f.streak >= 3) txt += `\n_Racha: ${f.streak}x_`;
    txt += `\n\n\`.fisht view\` para recoger!`;
    db.markDirty("users");
    return send(sock, m, txt, "¡Resultado de la Pesca!", formatMoney(tv));
  }

  if (sub === "view") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (!f.fishingPending || f.fishingPending.length === 0)
      return m.reply(`_No hay capturas._ \`.fisht mancing\` _primero!_`);
    const catches = f.fishingPending;
    let tv = 0,
      te = 0,
      nf = [],
      nm = [];
    for (const fish of catches) {
      tv += fish.price;
      te += Math.max(10, Math.floor(fish.price / 50));
      const cn = fish.name.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
      if (!f.fishFound.includes(cn)) {
        f.fishFound.push(cn);
        nf.push(cn);
      }
      if (fish.isMutated)
        for (const mut of fish.mutations) {
          if (mut !== "Normal" && !f.mutationFound.includes(mut)) {
            f.mutationFound.push(mut);
            nm.push(mut);
          }
        }
    }
    f.money = (f.money || 0) + tv;
    f.fishCaught = (f.fishCaught || 0) + catches.length;
    f.totalEarned = (f.totalEarned || 0) + tv;
    f.inventory = [...(f.inventory || []), ...catches];
    const rlu = addRodExp(f, f.usedFishingRod || "basicrod", te);
    const plu = addPlayerExp(f, te);
    f.fishingPending = [];
    let txt = `*¡CAPTURAS RECOGIDAS!*\n\n+${formatMoney(tv)}\n+${te} EXP\n+${catches.length} peces\n`;
    if (nf.length > 0) txt += `\n*Peces Nuevos:* ${nf.join(", ")}`;
    if (nm.length > 0) txt += `\n*Mutaciones Nuevas:* ${nm.join(", ")}`;
    if (rlu) txt += `\n\n${rlu}`;
    if (plu) txt += `\n*¡LEVEL UP! Nivel ${f.level}*`;
    db.markDirty("users");
    return send(sock, m, txt, "¡Capturas Recogidas!", `+${formatMoney(tv)}`);
  }

  if (sub === "sell") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (!f.inventory || f.inventory.length === 0)
      return m.reply(`_¡Inventario vacío!_ \`.fisht mancing\` _primero._`);
    let tv = 0;
    for (const fish of f.inventory) tv += fish.price || 0;
    const sb = UPGRADES.sell.effect(f.sellUpgrade || 0);
    const rod = f.fishingRods[f.usedFishingRod || "basicrod"];
    const rsm = rod ? rod.sellMultiplier || 0 : 0;
    const fv = Math.round(tv * (1 + sb + rsm));
    const fc2 = f.inventory.length;
    f.money = (f.money || 0) + fv;
    f.totalEarned = (f.totalEarned || 0) + fv;
    f.inventory = [];
    db.markDirty("users");
    return send(
      sock,
      m,
      `*¡PECES VENDIDOS!*\n\nCantidad: ${fc2}\nTotal: ${formatMoney(fv)}\nSaldo: ${formatMoney(f.money)}`,
      "¡Peces Vendidos!",
      formatMoney(fv),
    );
  }

  if (sub === "me") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rod = f.fishingRods[f.usedFishingRod || "basicrod"];
    return send(
      sock,
      m,
      `*PERFIL DEL PESCADOR*\n\n*Nivel:* ${f.level} _(${f.exp}/${f.expToNextLevel} EXP)_\n*Dinero:* ${formatMoney(f.money)}\n*Peces:* ${f.fishCaught}\n*Caña:* ${rod ? rod.name : "Basic"} _(Lv.${rod ? rod.level : 1})_\n*Isla:* ${islands[f.currentIsland] ? islands[f.currentIsland].name : f.currentIsland}\n*Racha:* ${f.streak || 0}\n*Prestigio:* ${f.prestige || 0}\n*Tokens:* ${f.prestigeTokens || 0}\n*Tickets:* ${f.gachaTickets || 0}\n*FishBook:* ${f.fishFound ? f.fishFound.length : 0}\n*Mutaciones:* ${f.mutationFound ? f.mutationFound.length : 0}\n*Mejoras:*\n  _Luck: Lv.${f.luckUpgrade || 0}_\n  _Speed: Lv.${f.speedUpgrade || 0}_\n  _Sell: Lv.${f.sellUpgrade || 0}_`,
      "Perfil",
      `Nivel ${f.level}`,
    );
  }

  if (sub === "stats") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rod = f.fishingRods[f.usedFishingRod || "basicrod"];
    const st = getUpgradedStats(f, rod);
    let txt = `*STATS DETALLADOS*\n\n*Caña: ${rod ? rod.name : "None"}*\n  _Lv.${rod ? rod.level : 1}/${rod ? rod.maxLevel : 5} | EXP ${rod ? rod.exp : 0}/${rod ? rod.expToNextLevel : 100}_\n  _Luck: ${(st.luck * 100).toFixed(1)}% | Speed: ${(st.speed * 100).toFixed(1)}%_\n  _Sell: +${(st.sellMultiplier * 100).toFixed(1)}% | Combo: ${rod ? rod.comboFish : 1}_\n`;
    if (rod && rod.enchant) {
      const e = rodEnchants[rod.enchant];
      txt += `  _Encantamiento: ${e ? e.name : rod.enchant} (${e ? e.rarity : "?"})_\n`;
    }
    txt += `\n*Mejoras*\n  _Luck: Lv.${f.luckUpgrade || 0} (+${(UPGRADES.luck.effect(f.luckUpgrade || 0) * 100).toFixed(1)}%)_\n  _Speed: Lv.${f.speedUpgrade || 0} (+${(UPGRADES.speed.effect(f.speedUpgrade || 0) * 100).toFixed(1)}%)_\n  _Sell: Lv.${f.sellUpgrade || 0} (+${(UPGRADES.sell.effect(f.sellUpgrade || 0) * 100).toFixed(1)}%)_`;
    return send(sock, m, txt, "Stats Detallados", rod ? rod.name : "");
  }
  if (sub === "fishbook") {
    const user = getOrCreateFischUser(db, m.sender);
    const found = user.fisch.fishFound || [];
    if (found.length === 0)
      return m.reply(`_¡Fish Book vacío!_ \`.fisht mancing\` _primero_`);
    let txt = `*FISH BOOK* _(${found.length} especies)_\n\n`;
    for (const [k, isle] of Object.entries(islands)) {
      const fl = isle.listFish.filter((f) => found.includes(f.name));
      if (fl.length > 0) {
        txt += `*${isle.name}*\n`;
        for (const f of fl) txt += `  ${rc(f.rarity)} ${f.name}\n`;
        txt += `\n`;
      }
    }
    return send(sock, m, txt.trim(), "Fish Book", `${found.length} especies`);
  }

  if (sub === "mutbook") {
    const user = getOrCreateFischUser(db, m.sender);
    const found = user.fisch.mutationFound || [];
    if (found.length === 0) return m.reply(`_¡Mutation Book vacío!_`);
    let txt = `*MUTATION BOOK* _(${found.length})_\n\n`;
    for (const mut of found) {
      const d = mutations[mut];
      if (d) txt += `*${mut}* _x${d.multiplier}_\n`;
    }
    return send(sock, m, txt.trim(), "Mutation Book", `${found.length} mutaciones`);
  }

  if (sub === "travel") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (!sa[0]) {
      let txt = `*LISTA DE ISLAS*\n\n`;
      for (const [k, isle] of Object.entries(islands)) {
        const req = travelRequirements[k];
        const ok = (f.travelFound || []).includes(k);
        txt += `${ok ? "[OK]" : "[LOCK]"} *${isle.name}*${f.currentIsland === k ? " _< Ahora_" : ""}\n`;
        txt += req
          ? `   _${formatMoney(req.money)} | ${req.fish} peces_\n`
          : `   _Gratis_\n`;
      }
      return send(
        sock,
        m,
        txt + `\n\`.fisht travel <isla>\``,
        "Lista de Islas",
        islands[f.currentIsland || "mousewood"]?.name || "",
      );
    }
    const tk = sa[0].toLowerCase();
    if (!islands[tk]) return m.reply(`_¡La isla no existe!_ \`.fisht travel\``);
    if (f.currentIsland === tk)
      return m.reply(`_¡Ya estás en ${islands[tk].name}!_`);
    const req = travelRequirements[tk];
    if (req) {
      if ((f.money || 0) < req.money)
        return m.reply(`_¡Dinero insuficiente! Necesitas ${formatMoney(req.money)}_`);
      if ((f.fishCaught || 0) < req.fish)
        return m.reply(`_¡Peces insuficientes! Necesitas ${req.fish}_`);
      f.money -= req.money;
    }
    if (!(f.travelFound || []).includes(tk))
      f.travelFound = [...(f.travelFound || []), tk];
    f.currentIsland = tk;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*¡CAMBIO DE ISLA!*\n\nAhora estás en *${islands[tk].name}*\n${islands[tk].listFish.length} tipos de peces disponibles`,
      "¡Viaje!",
      islands[tk].name,
    );
  }

  if (sub === "shop") {
    let txt = `*TIENDA DE CAÑAS DE PESCAR*\n\n`;
    for (const [k, rod] of Object.entries(fishingRod)) {
      if (rod.price > 0)
        txt += `*${rod.name}*\n   _${formatMoney(rod.price)}_\n   _Luck +${(rod.luck * 100).toFixed(0)}% | Speed +${(rod.speed * 100).toFixed(0)}% | Combo: ${rod.comboFish}_\n   _${rod.description}_\n\n`;
    }
    return send(
      sock,
      m,
      txt + `\`.fisht buy <caña>\``,
      "Tienda de Cañas",
      "Elige la mejor caña",
    );
  }

  if (sub === "buy") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rk = sa[0] ? sa[0].toLowerCase() : "";
    if (!rk) return m.reply(`_¡Elige una caña!_ \`.fisht shop\``);
    if (!fishingRod[rk]) return m.reply(`_¡La caña no existe!_ \`.fisht shop\``);
    if (f.fishingRods[rk])
      return m.reply(`_¡Ya tienes ${fishingRod[rk].name}!_`);
    if (fishingRod[rk].price === 0)
      return m.reply(`_¡Esta caña es de Token/Prestigio!_`);
    if ((f.money || 0) < fishingRod[rk].price)
      return m.reply(
        `_¡Dinero insuficiente! Necesitas ${formatMoney(fishingRod[rk].price)}_`,
      );
    f.money -= fishingRod[rk].price;
    f.fishingRods[rk] = { ...fishingRod[rk] };
    db.markDirty("users");
    return send(
      sock,
      m,
      `*¡CAÑA COMPRADA!*\n\n*${fishingRod[rk].name}*\n_Escribe_ \`.fisht equip ${rk}\` _para equiparla_`,
      "¡Caña Nueva!",
      fishingRod[rk].name,
    );
  }

  if (sub === "equip") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rk = sa[0] ? sa[0].toLowerCase() : "";
    if (!rk) return m.reply(`_¡Elige una caña!_ \`.fisht rods\``);
    if (!f.fishingRods[rk])
      return m.reply(`_¡No tienes esta caña!_ \`.fisht rods\``);
    f.usedFishingRod = rk;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*¡CAÑA EQUIPADA!*\n\n*${f.fishingRods[rk].name}* _ahora está activa_`,
      "¡Equipar Caña!",
      f.fishingRods[rk].name,
    );
  }

  if (sub === "rods") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rods = f.fishingRods || {};
    if (Object.keys(rods).length === 0) return m.reply(`_¡No tienes cañas!_`);
    let txt = `*COLECCIÓN DE CAÑAS*\n\n`;
    for (const [k, rod] of Object.entries(rods)) {
      txt += `*${rod.name}*${f.usedFishingRod === k ? " _ACTIVA_" : ""}\n  _Lv.${rod.level || 1}/${rod.maxLevel} | Luck ${(rod.luck * 100).toFixed(0)}% | Speed ${(rod.speed * 100).toFixed(0)}%_\n`;
      if (rod.enchant)
        txt += `  _Encantamiento: ${rodEnchants[rod.enchant] ? rodEnchants[rod.enchant].name : rod.enchant}_\n`;
    }
    return send(
      sock,
      m,
      txt + `\n\`.fisht equip <caña>\``,
      "Colección de Cañas",
      `${Object.keys(rods).length} cañas`,
    );
  }
  if (sub === "enchant") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rk = f.usedFishingRod || "basicrod";
    const rod = f.fishingRods[rk];
    if (!rod) return m.reply(`_¡No hay caña activa!_`);
    const ek = sa[0] ? sa[0].toLowerCase() : "";
    if (!ek) {
      if (rod.enchant) {
        const e = rodEnchants[rod.enchant];
        return m.reply(
          `_Encantamiento actual: *${e ? e.name : rod.enchant}* (${e ? e.rarity : "?"})_\n\`.fisht enchant <key>\` para cambiar`,
        );
      }
      return m.reply(`_¡Elige un encantamiento!_ \`.fisht enchants\``);
    }
    if (!rodEnchants[ek])
      return m.reply(`_¡El encantamiento no existe!_ \`.fisht enchants\``);
    const ench = rodEnchants[ek];
    const cost = encCost(ench.rarity);
    if ((f.money || 0) < cost)
      return m.reply(`_¡Dinero insuficiente! Necesitas ${formatMoney(cost)}_`);
    f.money -= cost;
    rod.enchant = ek;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*¡ENCANTAMIENTO APLICADO!*\n\n*${ench.name}* _(${ench.rarity})_ a *${rod.name}*\n_${ench.desc}_\n_Costo: ${formatMoney(cost)}_`,
      "¡Encantamiento!",
      ench.name,
    );
  }

  if (sub === "enchants") {
    const byR = {};
    for (const [k, e] of Object.entries(rodEnchants)) {
      if (!byR[e.rarity]) byR[e.rarity] = [];
      byR[e.rarity].push({ key: k, name: e.name, desc: e.desc });
    }
    let txt = `*LISTA DE ENCANTAMIENTOS*\n\n`;
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
      txt.trim() + `\n\`.fisht enchant <key>\``,
      "Encantamientos",
      "Elige un encantamiento",
    );
  }

  if (sub === "rodup") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rk = f.usedFishingRod || "basicrod";
    const rod = f.fishingRods[rk];
    if (!rod) return m.reply(`_¡No hay caña activa!_`);
    if (rod.level >= rod.maxLevel) return m.reply(`_¡La caña ya está al nivel máximo!_`);
    const cost = Math.floor(rod.price * 0.1 * rod.level) || 10000 * rod.level;
    if ((f.money || 0) < cost)
      return m.reply(`_¡Dinero insuficiente! Necesitas ${formatMoney(cost)}_`);
    f.money -= cost;
    const res = addRodExp(f, rk, Math.floor(rod.expToNextLevel * 0.5));
    db.markDirty("users");
    return send(
      sock,
      m,
      res
        ? `*¡CAÑA MEJORADA!*\n\n${res}\n_Costo: ${formatMoney(cost)}_`
        : `*¡EXP DE CAÑA SUBIÓ!*\n\n+${Math.floor(rod.expToNextLevel * 0.5)} EXP\n_Costo: ${formatMoney(cost)}_`,
      "¡Mejora de Caña!",
      rod.name,
    );
  }

  if (sub === "daily") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const now = new Date();
    if (f.lastDaily) {
      const diff = now.getTime() - new Date(f.lastDaily).getTime();
      if (diff < 86400000)
        return m.reply(
          `_¡Daily ya reclamado! Espera *${Math.ceil((86400000 - diff) / 3600000)}* horas._`,
        );
    }
    const ld = f.lastDaily ? new Date(f.lastDaily) : null;
    f.dailyStreak =
      ld && now.getTime() - ld.getTime() < 172800000
        ? (f.dailyStreak || 0) + 1
        : 1;
    let rw = DAILY_REWARDS[0];
    for (const r of DAILY_REWARDS) {
      if (f.dailyStreak >= r.streak) rw = r;
    }
    f.money = (f.money || 0) + rw.money;
    f.gachaTickets = (f.gachaTickets || 0) + rw.tickets;
    f.lastDaily = now.toISOString();
    db.markDirty("users");
    return send(
      sock,
      m,
      `*¡RECOMPENSA DIARIA!*\n\n*Racha:* ${f.dailyStreak} días\n+${formatMoney(rw.money)}\n+${rw.tickets} Tickets de Gacha\n*Saldo:* ${formatMoney(f.money)}`,
      "¡Recompensa Diaria!",
      `Racha ${f.dailyStreak}`,
    );
  }

  if (sub === "gacha") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const useT = sa[0] && sa[0].toLowerCase() === "ticket";
    if (useT) {
      if ((f.gachaTickets || 0) < 1)
        return m.reply(`_¡Tickets agotados! Tienes ${f.gachaTickets || 0}_`);
      f.gachaTickets -= 1;
    } else {
      if ((f.money || 0) < GACHA_COST_COINS)
        return m.reply(`_¡Dinero insuficiente! Necesitas ${formatMoney(GACHA_COST_COINS)}_`);
      f.money -= GACHA_COST_COINS;
    }
    const result = doGachaPull(f);
    const item = result.item;
    let txt = `*GACHA RESULT!*\n\n`;
    switch (item.type) {
      case "rod":
        if (fishingRod[item.value] && !f.fishingRods[item.value]) {
          f.fishingRods[item.value] = { ...fishingRod[item.value] };
          txt += `¡CONSEGUISTE UNA CAÑA: *${item.label}*\n`;
        } else if (f.fishingRods[item.value]) {
          const ref = Math.floor(
            (fishingRod[item.value] ? fishingRod[item.value].price : 0) * 0.3 ||
              100000,
          );
          f.money = (f.money || 0) + ref;
          txt += `Duplicado: *${item.label}* _+${formatMoney(ref)}_\n`;
        }
        break;
      case "tickets":
        f.gachaTickets = (f.gachaTickets || 0) + item.value;
        txt += `+${item.value} Tickets\n`;
        break;
      case "tokens":
        f.prestigeTokens = (f.prestigeTokens || 0) + item.value;
        txt += `+${item.value} Tokens\n`;
        break;
      case "coins":
        f.money = (f.money || 0) + item.value;
        txt += `+${formatMoney(item.value)}\n`;
        break;
      case "enchant_scroll":
        {
          const avail = Object.entries(rodEnchants).filter(
            ([, v]) => v.rarity === item.value,
          );
          if (avail.length > 0) {
            const [ek2, ed] = avail[Math.floor(Math.random() * avail.length)];
            const rk2 = f.usedFishingRod || "basicrod";
            if (f.fishingRods[rk2]) {
              f.fishingRods[rk2].enchant = ek2;
              txt += `Encantamiento: *${ed.name}* _(${item.value})_ en la caña!\n`;
            }
          }
        }
        break;
      case "xp_boost":
        f.exp = (f.exp || 0) + Math.floor(f.expToNextLevel * 0.5);
        txt += `¡Boost de XP x${item.value}!\n`;
        break;
      default:
        txt += `${item.label}\n`;
    }
    if (result.isSSR) txt += `\n*¡PULL SSR!*`;
    if (result.pity) txt += `\n*¡Piedad Activada!*`;
    txt += `\n\n_Piedad: ${f.gachaPity}/${GACHA_PITY_LIMIT}_\n_Saldo: ${formatMoney(f.money)} | Tickets: ${f.gachaTickets}_`;
    db.markDirty("users");
    return send(sock, m, txt, "¡Gacha!", result.isSSR ? "¡PULL SSR!" : "Resultado");
  }
  if (sub === "upgrade") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const type = sa[0] ? sa[0].toLowerCase() : "";
    if (!type || !UPGRADES[type]) {
      let txt = `*TIENDA DE MEJORAS*\n\n`;
      for (const [k, u] of Object.entries(UPGRADES)) {
        const lv = f[k + "Upgrade"] || 0;
        txt += `*${u.name}* _(Lv.${lv}/${u.maxLevel})_\n  _${u.desc}_\n  ${lv >= u.maxLevel ? "_MÁXIMO_" : `_Siguiente: ${formatMoney(u.getCost(lv))}_`}\n\n`;
      }
      return send(
        sock,
        m,
        txt + `\`.fisht upgrade <luck/speed/sell>\``,
        "Tienda de Mejoras",
        "Mejora tus stats",
      );
    }
    const upg = UPGRADES[type];
    const lv = f[type + "Upgrade"] || 0;
    if (lv >= upg.maxLevel) return m.reply(`_¡Ya está al máximo!_`);
    const cost = upg.getCost(lv);
    if ((f.money || 0) < cost)
      return m.reply(`_¡Dinero insuficiente! Necesitas ${formatMoney(cost)}_`);
    f.money -= cost;
    f[type + "Upgrade"] = lv + 1;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*¡${upg.name} LEVEL UP!*\n\n_Nivel ${lv + 1}_\n_Costo: ${formatMoney(cost)}_\n_${upg.desc}_`,
      "¡Mejora!",
      `${upg.name} Lv.${lv + 1}`,
    );
  }

  if (sub === "prestige") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const cp = f.prestige || 0;
    if (sa[0] && sa[0].toLowerCase() === "confirm") {
      const reqs = [
        { fish: 500, money: 1e10 },
        { fish: 1500, money: 1e12 },
        { fish: 4000, money: 1e14 },
        { fish: 10000, money: 1e19 },
        { fish: 25000, money: 1e22 },
      ];
      const req = reqs[cp];
      if (!req) return m.reply(`_¡Ya estás al máximo de prestigio!_`);
      if ((f.fishCaught || 0) < req.fish)
        return m.reply(`_¡Peces insuficientes! Necesitas ${req.fish}_`);
      if ((f.money || 0) < req.money)
        return m.reply(`_¡Dinero insuficiente! Necesitas ${formatMoney(req.money)}_`);
      f.prestige = cp + 1;
      f.money = Math.floor(f.money * 0.1);
      f.fishCaught = 0;
      f.streak = 0;
      f.prestigeTokens =
        (f.prestigeTokens || 0) + [50, 150, 500, 1000, 5000][cp];
      const titles = [
        "Pescador Novato",
        "Veterano",
        "Master Angler",
        "Leyenda",
        "Trascendente",
        "Dios de la Pesca",
      ];
      if (cp === 0 && !f.fishingRods.prestigerod)
        f.fishingRods.prestigerod = { ...fishingRod.prestigerod };
      if (cp === 2 && !f.fishingRods.cosmicrod)
        f.fishingRods.cosmicrod = { ...fishingRod.cosmicrod };
      db.markDirty("users");
      return send(
        sock,
        m,
        `*¡SUBISTE DE PRESTIGIO!*\n\n*Título:* ${titles[f.prestige]}\n*Tokens:* ${f.prestigeTokens}\n\n_Dinero -90%, contador de peces reiniciado_`,
        "¡PRESTIGIO!",
        titles[f.prestige],
      );
    }
    let txt = `*SISTEMA DE PRESTIGIO*\n\n*Prestigio:* ${cp}\n*Tokens:* ${f.prestigeTokens || 0}\n\n`;
    const allReqs = [
      { lv: 1, fish: 500, money: 1e10, rw: "Prestige Rod + 50 tokens" },
      { lv: 2, fish: 1500, money: 1e12, rw: "Luck +20% + 150 tokens" },
      { lv: 3, fish: 4000, money: 1e14, rw: "Cosmic Rod + 500 tokens" },
      { lv: 4, fish: 10000, money: 1e19, rw: "2x EXP + 1000 tokens" },
      { lv: 5, fish: 25000, money: 1e22, rw: "Eternity Rod + 5000 tokens" },
    ];
    for (const r of allReqs)
      txt += `${cp >= r.lv ? "[OK]" : "[LOCK]"} *P${r.lv}*: _${r.fish} peces | ${formatMoney(r.money)}_\n  _${r.rw}_\n\n`;
    return send(
      sock,
      m,
      txt + `\`.fisht prestige confirm\` _(¡ten cuidado!)_`,
      "Prestigio",
      `P${cp}`,
    );
  }

  if (sub === "tokens") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (!sa[0]) {
      let txt = `*TIENDA DE TOKENS*\n\n*Tokens:* ${f.prestigeTokens || 0}\n\n`;
      for (const item of TOKEN_SHOP)
        txt += `*${item.name}* _${item.cost} tokens_\n`;
      return send(
        sock,
        m,
        txt + `\n\`.fisht tokens <id>\``,
        "Tienda de Tokens",
        `${f.prestigeTokens || 0} tokens`,
      );
    }
    const iid = sa[0].toLowerCase();
    const item = TOKEN_SHOP.find((i) => i.id === iid);
    if (!item) return m.reply(`_¡El artículo no existe!_ \`.fisht tokens\``);
    if ((f.prestigeTokens || 0) < item.cost)
      return m.reply(`_¡Tokens insuficientes! Necesitas ${item.cost}_`);
    f.prestigeTokens -= item.cost;
    switch (item.type) {
      case "rod":
        if (fishingRod[item.value] && !f.fishingRods[item.value]) {
          f.fishingRods[item.value] = { ...fishingRod[item.value] };
        } else {
          f.prestigeTokens += item.cost;
          return m.reply(`_¡Ya tienes esta caña!_`);
        }
        break;
      case "tickets":
        f.gachaTickets = (f.gachaTickets || 0) + item.value;
        break;
      case "coins":
        f.money = (f.money || 0) + item.value;
        break;
    }
    db.markDirty("users");
    return send(
      sock,
      m,
      `*¡ARTÍCULO COMPRADO!*\n\n*${item.name}* _por ${item.cost} tokens_`,
      "¡Tienda de Tokens!",
      item.name,
    );
  }

  if (sub === "jackpot") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (!sa[0]) {
      let txt = `*SISTEMA DE JACKPOT*\n\n_Sistema jackpot con grandes premios!_\n_Puedes ganar _Premium_, _Partner_, _Energía_, _Limit_, incluso _UNLIMITED_!_\n\n`;
      for (const pool of JACKPOT_POOLS) {
        txt += `*${pool.name}*\n  _Costo: ${formatMoney(pool.cost)}_\n  _Probabilidad: ${pool.weight}%_\n  _Premios:_\n`;
        for (const rw of pool.rewards) {
          const label =
            {
              coins: "Berry",
              carne: "Energía",
              limit: "Limit",
              tickets: "Tickets de Gacha",
              tokens: "Tokens de Prestigio",
              exp_boost: "EXP Boost",
              premium_7d: "Premium 7 Días",
              premium_30d: "Premium 30 Días",
              partner_7d: "Partner 7 Días",
              partner_30d: "Partner 30 Días",
              unlimited_carne: "Energía UNLIMITED",
              unlimited_limit: "Limit UNLIMITED",
            }[rw.type] || rw.type;
          txt += `    _${label}: ${rw.min === rw.max ? rw.min : `${rw.min}-${rw.max}`} (${rw.weight}%)_\n`;
        }
        txt += `\n`;
      }
      return send(
        sock,
        m,
        txt + `\`.fisht jackpot <mini/mega/ultra/legend>\``,
        "¡Jackpot!",
        "Gran Premio",
      );
    }
    const poolId = sa[0].toLowerCase();
    const pool = JACKPOT_POOLS.find((p) => p.id === poolId);
    if (!pool) return m.reply(`_¡El tier no existe!_ \`.fisht jackpot\``);
    if ((f.money || 0) < pool.cost)
      return m.reply(`_¡Dinero insuficiente! Necesitas ${formatMoney(pool.cost)}_`);
    f.money -= pool.cost;
    const result = doJackpotPull(f, poolId);
    if (!result) return m.reply(`_¡Falló! Inténtalo de nuevo._`);
    const applied = applyJackpotReward(db, f, m.sender, result);
    db.markDirty("users");
    let txt = `*${pool.name.toUpperCase()}!*\n\n`;
    const isBig = [
      "premium_7d",
      "premium_30d",
      "partner_7d",
      "partner_30d",
      "unlimited_carne",
      "unlimited_limit",
    ].includes(result.reward.type);
    if (isBig) txt += `*¡GRAN JACKPOT!*\n\n`;
    txt += `${applied.desc}\n\n_Costo: ${formatMoney(pool.cost)}_\n_Saldo: ${formatMoney(f.money)}_`;
    return send(
      sock,
      m,
      txt,
      isBig ? "¡GRAN JACKPOT!" : pool.name,
      applied.desc,
    );
  }

  if (sub === "top") {
    const users = db.db.data.users || {};
    const rankings = [];
    for (const [jid, ud] of Object.entries(users)) {
      if (ud.fisch)
        rankings.push({
          jid,
          fishCaught: ud.fisch.fishCaught || 0,
          money: ud.fisch.money || 0,
          level: ud.fisch.level || 1,
          prestige: ud.fisch.prestige || 0,
        });
    }
    if (rankings.length === 0) return m.reply(`_¡Aún no hay jugadores!_`);
    rankings.sort((a, b) => {
      if (b.prestige !== a.prestige) return b.prestige - a.prestige;
      if (b.fishCaught !== a.fishCaught) return b.fishCaught - a.fishCaught;
      return b.money - a.money;
    });
    let txt = `*TABLA DE CLASIFICACIÓN FISCHIT*\n\n`;
    const top = rankings.slice(0, 10);
    for (let i = 0; i < top.length; i++) {
      const p = top[i];
      const medal =
        i === 0 ? "1." : i === 1 ? "2." : i === 2 ? "3." : `${i + 1}.`;
      txt += `${medal} @${p.jid}\n  _P${p.prestige} | ${p.fishCaught} peces | ${formatMoney(p.money)}_\n`;
    }
    return send(sock, m, txt.trim(), "Leaderboard", "Top Jugadores");
  }
}

export { pluginConfig as config, handler };
