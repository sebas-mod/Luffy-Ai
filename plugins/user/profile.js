import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { getRole } from "./level.js";
import fs from "fs";
import { getDevice } from "ourin";

const pluginConfig = {
  name: "profile",
  alias: ["me", "profil", "myprofile", "my", "stats", "status"],
  category: "user",
  description: "Ver perfil de usuario con estadísticas RPG",
  usage: ".profile [@user]",
  example: ".profile",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const EXP_PER_LEVEL = 10000;

function formatNumber(num) {
  return num?.toLocaleString("es-ES") || "0";
}

function getLevelBar(current, target) {
  const totalBars = 10;
  const filledBars = Math.min(
    Math.floor((current / target) * totalBars),
    totalBars,
  );
  const emptyBars = totalBars - filledBars;
  return "▰".repeat(filledBars) + "▱".repeat(emptyBars);
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;

  const user = db.getUser(target) || db.setUser(target);

  const isLid = target.endsWith('@lid');
  const isGroup = target.endsWith('@g.us');

  const resolvedJid = isLid && sock.getJid ? sock.getJid(target) : target;
  const phone = resolvedJid.split('@')[0].split(':')[0];
  const deviceId = m.quoted?.key?.id?.split('/')[0] || m.key?.id?.split('/')[0] || (resolvedJid.match(/:(\d+)@/) || [])[1] || null;

  const safe = async (fn) => {
    try { return await fn(); } catch { return null; }
  };

  const [
    onWa,
    ppUrl,
    statusRes,
    bizProfile,
    catalogRes,
    collections,
    lidFromJid,
    contactQuery,
    deviceInfo,
  ] = await Promise.all([
    safe(() => sock.onWhatsApp(phone)),
    safe(() => sock.profilePictureUrl(resolvedJid, 'image')),
    safe(() => sock.fetchStatus(resolvedJid)),
    safe(() => sock.getBusinessProfile(resolvedJid)),
    safe(() => sock.getCatalog({ jid: resolvedJid, limit: 5 })),
    safe(() => sock.getCollections(resolvedJid, 5)),
    safe(() => sock.getLidFromJid(resolvedJid)),
    safe(() => sock.getContact(resolvedJid)),
    safe(() => getDevice(resolvedJid, sock)),
  ]);

  const exists = onWa?.[0]?.exists ?? false;
  const canonicalJid = onWa?.[0]?.jid || resolvedJid;
  const lid = m.key?.participant || lidFromJid || onWa?.[0]?.lid || null;
  const isBot = deviceInfo?.isBot || contactQuery?.isBot || false;
  const statusObj = Array.isArray(statusRes) ? statusRes[0] : statusRes;
  const status = statusObj?.status?.status || statusObj?.status || null;
  const statusTs = statusObj?.status?.setAt || statusObj?.setAt || null;

  const isBiz = !!bizProfile && Object.keys(bizProfile).length > 0;
  const products = catalogRes?.products?.length || 0;
  const collectionsCount = collections?.collections?.length || 0;

  const fmtDate = (ts) => {
    if (!ts) return null;
    const d = ts instanceof Date ? ts : new Date(Number(ts) * (String(ts).length <= 10 ? 1000 : 1));
    return isNaN(d) ? null : d.toLocaleString('es-ES');
  };

  if (!user.rpg) user.rpg = {};
  const userExp = user.exp || 0;
  const userLevel = Math.floor(userExp / EXP_PER_LEVEL) + 1;
  user.rpg.level = userLevel;
  user.rpg.health = user.rpg.health || 100;
  user.rpg.maxHealth = 100 + (userLevel - 1) * 10;
  user.rpg.mana = user.rpg.mana || 100;
  user.rpg.maxMana = 100 + (userLevel - 1) * 5;
  user.rpg.stamina = user.rpg.stamina || 100;
  user.rpg.maxStamina = 100 + (userLevel - 1) * 5;

  const currentLevelExp = (userLevel - 1) * EXP_PER_LEVEL;
  const levelUpExp = userLevel * EXP_PER_LEVEL;
  const expInLevel = userExp - currentLevelExp;
  const expNeeded = levelUpExp - currentLevelExp;
  const role = getRole(userLevel);
  const isOwnerUser = config.isOwner(target);
  const isPremiumUser = config.isPremium(target);

  let ppMedia = null;
  try {
    const ppUrl = await sock.profilePictureUrl(target, "image");
    if (ppUrl) {
      ppMedia = { url: ppUrl };
    } else {
      throw new Error("No PP");
    }
  } catch {
    const fallbackUrl = config.assets["pp-kosong"];
    if (fallbackUrl) {
      ppMedia = { url: fallbackUrl };
    } else {
      ppMedia = { url: "https://i.imgur.com/TuItj4L.png" };
    }
  }

  let caption = `¡Hola @${phone}! 👋\n`;
  caption += `Esta es la información completa de tu perfil, estado y todos los activos que posees en el sistema del bot:\n\n`;
  
  caption += `*〔 👤 INFORMACIÓN PERSONAL 〕*\n`;
  caption += `- *Nombre real:* ${user.name || m.pushName || "Usuario"}\n`;
  if (user.isRegistered) {
      caption += `- *Nombre de registro:* ${user.regName} (${user.regAge} años, ${user.regGender})\n`;
  }
  caption += `- *Etiqueta / Mención:* @${target.split("@")[0]}\n`;
  caption += `- *Estado de cuenta:* ${isOwnerUser ? "👑 Propietario" : isPremiumUser ? "💎 Premium" : "🆓 Usuario Gratis"}\n`;
  if (user.isBanned) caption += `- *Baneado:* 🚫 Sí (No puede acceder a las funciones del bot)\n`;
  if (user.registeredAt) {
  caption += `- *Fecha de registro:* ${new Date(user.registeredAt).toLocaleDateString("es-ES")}\n`;
  }
  if (user.clanId) caption += `- *Clan / Gremio:* ${user.clanId}\n`;
  if (user.rpg && user.rpg.spouse) {
      caption += `- *Pareja (Spouse):* @${user.rpg.spouse.split("@")[0]}\n`;
  }

  caption += `\n*〔 ⚔️ ESTADÍSTICAS RPG Y NIVEL 〕*\n`;
  caption += `- *Rol / Rango:* ${role}\n`;
  caption += `- *Nivel Actual:* ${user.rpg.level}\n`;
  caption += `- *Total Exp:* ${formatNumber(userExp)} XP\n`;
  caption += `- *Salud (Health):* ❤️ ${user.rpg.health} / ${user.rpg.maxHealth}\n`;
  caption += `- *Maná (Magic):* 💧 ${user.rpg.mana} / ${user.rpg.maxMana}\n`;
  caption += `- *Stamina:* ⚡ ${user.rpg.stamina} / ${user.rpg.maxStamina}\n`;
  caption += `- *Progreso al Nivel ${user.rpg.level + 1}:*\n  ${getLevelBar(expInLevel, expNeeded)}\n  _${formatNumber(expInLevel)} / ${formatNumber(expNeeded)} XP_\n`;

  caption += `\n*〔 💰 ACTIVOS & FINANZAS 〕*\n`;
  caption += `- *Belly:* 🪙 ${user.belly?.toLocaleString("es-ES") || 0} _(Usado para funciones RPG)_\n`;
  caption += `- *Dinero en el banco:* 🏦 Belly ${user.rpg?.bank?.toLocaleString("es-ES") || 0} _(A salvo de robos)_\n`;
  caption += `- *Energía restante:* ⚡ ${isOwnerUser || isPremiumUser ? "∞ Ilimitada" : user.energi} _(Necesaria cada vez que usas un comando)_\n`;

  caption += `\n*〔 📱 INFO DE WHATSAPP 〕*\n`;
  caption += `- *Número:* +${phone}\n`;
  caption += `- *Existe en WA:* ${exists ? 'Sí' : 'No'}\n`;
  caption += `- *JID:* ${canonicalJid}\n`;
  caption += `- *LID:* ${lid || '-'}\n`;
  caption += `- *Tipo:* ${isGroup ? 'Grupo' : (isLid ? 'LID' : 'S.WhatsApp.Net')}\n`;
  caption += `- *Bot WhatsApp:* ${isBot ? 'Sí' : 'No'}\n`;
  caption += `- *Device ID:* ${deviceId || '-'}\n`;

  caption += `\n*〔 ℹ️ BIO Y PERFIL 〕*\n`;
  caption += `- *Avatar:* ${ppUrl ? 'Sí' : 'No'}\n`;
  caption += `- *Bio:* ${status || '-'}\n`;
  caption += `- *Bio Set:* ${fmtDate(statusTs) || '-'}\n`;

  caption += `\n*〔 🏢 INFO DE NEGOCIOS 〕*\n`;
  caption += `- *Tipo de cuenta:* ${isBiz ? 'WhatsApp Business' : 'WhatsApp Normal'}\n`;
  if (isBiz) {
    caption += `- *Descripción:* ${bizProfile.description || '-'}\n`;
    caption += `- *Website:* ${(bizProfile.website || []).join(', ') || '-'}\n`;
    caption += `- *Email:* ${bizProfile.email || '-'}\n`;
    caption += `- *Dirección:* ${bizProfile.address || '-'}\n`;
    caption += `- *Categoría:* ${(bizProfile.categories || []).map(c => c.name || c).join(', ') || '-'}\n`;
    caption += `- *Verificado:* ${bizProfile.isProfileLinked ? 'Sí' : 'No'}\n`;
    
    if (products > 0 || collectionsCount > 0) {
      caption += `\n*〔 🛍️ CATÁLOGO 〕*\n`;
      caption += `- *Total Productos:* ${products}\n`;
      caption += `- *Colecciones:* ${collectionsCount}\n`;
    }
  }

  caption += `\n*〔 🤖 VISIÓN DEL BOT 〕*\n`;
  caption += `- *Bot JID:* ${sock.user?.id || '-'}\n`;
  caption += `- *Bot Platform:* ${sock.authState?.creds?.platform || process.platform || '-'}\n`;
  caption += `- *Runtime:* Node ${process.version}\n`;

  if (user.inventory && Object.keys(user.inventory).length > 0) {
      const invItems = Object.entries(user.inventory).filter(([_, qty]) => qty > 0);
      if (invItems.length > 0) {
          caption += `\n*〔 🎒 CONTENIDO DEL INVENTARIO 〕*\n`;
          caption += `Objetos que has logrado recolectar:\n`;
          invItems.forEach(([item, qty]) => {
              caption += `- *${item.charAt(0).toUpperCase() + item.slice(1)}:* cantidad ${qty} items\n`;
          });
      }
  }

  if (user.unlockedFeatures && user.unlockedFeatures.length > 0) {
      caption += `\n*〔 🔓 FUNCIONES PREMIUM DESBLOQUEADAS 〕*\n`;
      caption += `Funciones exclusivas que has comprado permanentemente:\n`;
      user.unlockedFeatures.forEach(fitur => {
          caption += `- *${fitur}*\n`;
      });
  }

  const mentions = [target];
  if (user.rpg.spouse) mentions.push(user.rpg.spouse);

  const msgOptions = { caption, mentions };
  if (ppMedia) {
    msgOptions.image = ppMedia;
  }

  await sock.sendMessage(m.chat, msgOptions, { quoted: m });
}

export { pluginConfig as config, handler };
