import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "guild",
  alias: ["clan", "team", "kelompok"],
  category: "rpg",
  description: "Sistema de guild/clan",
  usage: ".guild <create/join/leave/info>",
  example: ".guild create DragonSlayers",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const guildName = args.slice(1).join(" ");

  const guilds = db.db?.data?.guilds || {};

  if (!action || !["create", "join", "leave", "info", "list", "members", "deposit"].includes(action)) {
    let txt = `🏰 *SERIKAT GUILD RPG* 🏰\n\n`;
    txt += `¡Crea o únete a una alianza para obtener *beneficios* con tus amigos!\n\n`;
    txt += `*Lista de Comandos:*\n`;
    txt += `🗡️ \`${m.prefix}guild create <nombre>\` (Crear Guild)\n`;
    txt += `🛡️ \`${m.prefix}guild join <nombre>\` (Unirse al Guild)\n`;
    txt += `🏃 \`${m.prefix}guild leave\` (Salir del Guild)\n`;
    txt += `📜 \`${m.prefix}guild info\` (Ver Stats del Guild)\n`;
    txt += `👥 \`${m.prefix}guild members\` (Ver Miembros)\n`;
    txt += `💰 \`${m.prefix}guild deposit <cantidad>\` (Donar al Fondo)\n`;
    txt += `🏆 \`${m.prefix}guild list\` (Top Guilds)\n\n`;

    if (user.rpg.guildId) {
      const myGuild = guilds[user.rpg.guildId];
      txt += `📌 Estado: Unido a *${myGuild?.name || "Desconocido"}*`;
    } else {
      txt += `📌 Estado: *Solterón de Guild (Sin Amigos)*`;
    }
    return m.reply(txt);
  }

  if (action === "list") {
    const guildList = Object.values(guilds);
    if (guildList.length === 0) {
      return m.reply(`¡No hay guilds en este servidor! ¡Crea uno con \`${m.prefix}guild create <nombre>\``);
    }

    let txt = `🏆 *LISTA DE TOP GUILDS* 🏆\n\n`;
    for (const g of guildList.slice(0, 10)) {
      txt += `🏰 *${g.name}* (Nv. ${g.level || 1})\n`;
      txt += `👥 Miembros: ${g.members?.length || 0}/50\n`;
      txt += `💰 Fondo de Caja: Rp ${(g.treasury || 0).toLocaleString()}\n`;
      txt += `──────────────\n`;
    }
    return m.reply(txt);
  }

  if (action === "create") {
    if (user.rpg.guildId) {
      return m.reply(`¡Qué ambicioso! Ya tienes guild. ¡Salte primero si quieres crear uno nuevo!`);
    }

    if (!guildName || guildName.length < 3) {
      return m.reply(`¡El nombre del guild debe tener al menos *3 letras* jefe!`);
    }

    if (guildName.length > 20) {
      return m.reply(`El nombre del guild es muy largo, ¡máximo *20 letras*!`);
    }

    const existingGuild = Object.values(guilds).find((g) => g.name.toLowerCase() === guildName.toLowerCase());
    if (existingGuild) {
      return m.reply(`Vaya, el nombre *${guildName}* ya lo usa otro grupo! ¡Busca un nombre más genial!`);
    }

    const createCost = 10000;
    if ((user.berry || 0) < createCost) {
      return m.reply(`¿Tan pobre quieres ser líder? ¡Necesitas *Rp 10.000* para la cuota administrativa de registro del Guild!`);
    }

    user.berry -= createCost;

    const guildId = `guild_${Date.now()}`;
    if (!db.db.data.guilds) db.db.data.guilds = {};

    db.db.data.guilds[guildId] = {
      id: guildId,
      name: guildName,
      leader: m.sender,
      members: [m.sender],
      treasury: 0,
      level: 1,
      exp: 0,
      createdAt: Date.now(),
    };

    user.rpg.guildId = guildId;
    db.save();

    let txt = `🎉 *¡GUILD FUNDADO OFICIALMENTE!* 🎉\n\n`;
    txt += `El letrero de *${guildName}* fue colgado en la nueva sede!\n\n`;
    txt += `👑 Líder: @${m.sender.split("@")[0]}\n`;
    txt += `💸 Costo de Construcción: *-Rp ${createCost.toLocaleString()}*\n\n`;
    txt += `> _¡Invita a tus amigos a unirse con \`.guild join ${guildName}\`!_`;

    return m.reply(txt, { mentions: [m.sender] });
  }

  if (action === "join") {
    if (user.rpg.guildId) {
      return m.reply(`Ya tienes grupo bro! No se puede ser *agente doble* aquí.`);
    }

    if (!guildName) {
      return m.reply(`¡Escribe el nombre del guild al que quieres entrar!\nEjemplo: \`${m.prefix}guild join DragonSlayers\``);
    }

    const targetGuild = Object.values(guilds).find((g) => g.name.toLowerCase() === guildName.toLowerCase());
    if (!targetGuild) {
      return m.reply(`¡El guild *${guildName}* no existe! ¿Tienes un error de tipeo?`);
    }

    if (targetGuild.members?.length >= 50) {
      return m.reply(`Perdón compa, la capacidad de la sede del guild *${targetGuild.name}* está llena (50/50)!`);
    }

    targetGuild.members = targetGuild.members || [];
    targetGuild.members.push(m.sender);
    user.rpg.guildId = targetGuild.id;
    db.save();

    return m.reply(`✅ ¡Bienvenido al cuartel! Ahora eres oficialmente miembro del guild *${targetGuild.name}*! ⚔️`);
  }

  if (action === "leave") {
    if (!user.rpg.guildId) {
      return m.reply(`Ni siquiera estás en un guild, ¿de dónde quieres salir? 😂`);
    }

    const myGuild = guilds[user.rpg.guildId];
    if (!myGuild) {
      user.rpg.guildId = null;
      db.save();
      return m.reply(`Tu guild parece que se disolvió o fue *borrado*. Tus datos fueron *reiniciados*.`);
    }

    if (myGuild.leader === m.sender && myGuild.members?.length > 1) {
      return m.reply(`¡Oye líder! ¿En serio vas a abandonar a tus miembros así? ¡Transfiere el liderazgo a otro miembro o expulsa a todos! 😡`);
    }

    myGuild.members = (myGuild.members || []).filter((m) => m !== m.sender);

    if (myGuild.members.length === 0) {
      delete guilds[user.rpg.guildId];
    }

    const guildName = myGuild.name;
    user.rpg.guildId = null;
    db.save();

    return m.reply(`🏃 Saliste de la sede *${guildName}* y volviste a ser un ronin sin amo!`);
  }

  if (action === "info") {
    if (!user.rpg.guildId) {
      return m.reply(`No tienes guild jefe! ¡Busca amigos!`);
    }

    const myGuild = guilds[user.rpg.guildId];
    if (!myGuild) {
      return m.reply(`¡Guild no encontrado!`);
    }

    let txt = `🏰 *TABLÓN DE INFORMACIÓN DEL GUILD* 🏰\n\n`;
    txt += `👑 Nombre: *${myGuild.name}*\n`;
    txt += `👤 Líder: @${myGuild.leader?.split("@")[0]}\n`;
    txt += `📊 Nivel: *${myGuild.level || 1}*\n`;
    txt += `👥 Miembros: *${myGuild.members?.length || 0}/50*\n`;
    txt += `💰 Fondos: *Rp ${(myGuild.treasury || 0).toLocaleString()}*\n`;

    return m.reply(txt, { mentions: [myGuild.leader] });
  }

  if (action === "members") {
    if (!user.rpg.guildId) {
      return m.reply(`Awww no tienes guild...`);
    }

    const myGuild = guilds[user.rpg.guildId];
    if (!myGuild) {
      return m.reply(`¡Guild no encontrado!`);
    }

    const memberList = (myGuild.members || [])
      .map((m, i) => {
        const isLeader = m === myGuild.leader ? " 👑" : " 🗡️";
        return `${i + 1}. @${m.split("@")[0]}${isLeader}`;
      })
      .join("\n");

    return m.reply(`👥 *LISTA DE MIEMBROS DE ${myGuild.name}*\n\n${memberList}`, { mentions: myGuild.members });
  }

  if (action === "deposit") {
    if (!user.rpg.guildId) {
      return m.reply(`¿Quieres donar a qué orfanato? ¡Ni siquiera tienes guild!`);
    }

    const myGuild = guilds[user.rpg.guildId];
    if (!myGuild) {
      return m.reply(`¡Guild no encontrado!`);
    }

    const amount = parseInt(args[1]) || 0;
    if (amount < 100) {
      return m.reply(`¡Qué tacaño! ¡La donación mínima al fondo es *Rp 100*!`);
    }

    if ((user.berry || 0) < amount) {
      return m.reply(`Te falta dinero bro para donar eso!`);
    }

    user.berry -= amount;
    myGuild.treasury = (myGuild.treasury || 0) + amount;
    db.save();

    return m.reply(`✅ *¡DONACIÓN AL FONDO EXITOSA!*\n\nAcabas de ingresar *Rp ${amount.toLocaleString()}* a la caja fuerte del Guild!\nFondos Totales Actuales: *Rp ${myGuild.treasury.toLocaleString()}* 🏰💰`);
  }
}

export { pluginConfig as config, handler };
