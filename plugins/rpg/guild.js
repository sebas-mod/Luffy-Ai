import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "guild",
  alias: ["clan", "team", "kelompok"],
  category: "rpg",
  description: "Sistema de gremio/clan",
  usage: ".guild <create/join/leave/info>",
  example: ".guild create DragonSlayers",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
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
    txt += `¡Crea o únete a una guild para obtener beneficios con tus amigos!\n\n`;
    txt += `*Lista de Comandos:*\n`;
    txt += `🗡️ \`${m.prefix}guild create <nombre>\` (Crear Guild)\n`;
    txt += `🛡️ \`${m.prefix}guild join <nombre>\` (Unirse al Guild)\n`;
    txt += `🏃 \`${m.prefix}guild leave\` (Salir del Guild)\n`;
    txt += `📜 \`${m.prefix}guild info\` (Ver Stats del Guild)\n`;
    txt += `👥 \`${m.prefix}guild members\` (Ver Miembros)\n`;
    txt += `💰 \`${m.prefix}guild deposit <cantidad>\` (Donar al Fondo)\n`;
    txt += `🏆 \`${m.prefix}guild list\` (Top de Guilds)\n\n`;

    if (user.rpg.guildId) {
      const myGuild = guilds[user.rpg.guildId];
      txt += `📌 Estado: Unido a *${myGuild?.name || "Desconocido"}*`;
    } else {
      txt += `📌 Estado: *Sin Guild (Sin Amigos)*`;
    }
    return m.reply(txt);
  }

  if (action === "list") {
    const guildList = Object.values(guilds);
    if (guildList.length === 0) {
      return m.reply(`¡No hay gremios en este servidor! Crea uno con \`${m.prefix}guild create <nombre>\``);
    }

    let txt = `🏆 *LISTA TOP GUILD* 🏆\n\n`;
    for (const g of guildList.slice(0, 10)) {
      txt += `🏰 *${g.name}* (Lv. ${g.level || 1})\n`;
    txt += `👥 Miembros: ${g.members?.length || 0}/50\n`;
    txt += `💰 Fondos: Rp ${(g.treasury || 0).toLocaleString()}\n`;
      txt += `──────────────\n`;
    }
    return m.reply(txt);
  }

  if (action === "create") {
    if (user.rpg.guildId) {
      return m.reply(`¡Qué codicioso! Ya tienes un guild. ¡Sal primero si quieres crear uno nuevo!`);
    }

    if (!guildName || guildName.length < 3) {
      return m.reply(`¡El nombre del guild debe tener al menos *3 letras*, jefe!`);
    }

    if (guildName.length > 20) {
      return m.reply(`¡El nombre es muy largo, máximo *20 letras*!`);
    }

    const existingGuild = Object.values(guilds).find((g) => g.name.toLowerCase() === guildName.toLowerCase());
    if (existingGuild) {
      return m.reply(`El nombre *${guildName}* ya está tomado por otro gremio. ¡Busca un nombre más original!`);
    }

    const createCost = 10000;
    if ((user.koin || 0) < createCost) {
      return m.reply(`¡Eres muy tacaño para ser líder? Necesitas *Rp 10.000* para el registro del Guild!`);
    }

    user.koin -= createCost;

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

    txt = `🎉 ¡¡GUILD FORMALMENTE FUNDADO! 🎉\n\n`;
    txt += `El letrero de *${guildName}* ha sido instalado en la nueva sede!\n\n`;
    txt += `👑 Ketua: @${m.sender.split("@")[0]}\n`;
    txt += `💸 Costo de Construcción: *-Rp ${createCost.toLocaleString()}*\n\n`;
    txt += `> _¡Invita a tus amigos a unirse con \`.guild join ${guildName}\`!_`;

    return m.reply(txt, { mentions: [m.sender] });
  }

  if (action === "join") {
    if (user.rpg.guildId) {
      return m.reply(`¡Ya tienes un clan, bro! No puedes ser *doble agente* aquí.`);
    }

    if (!guildName) {
      return m.reply(`¡Escribe el nombre del guild al que quieres unirte!\nEjemplo: \`${m.prefix}guild join DragonSlayers\``);
    }

    const targetGuild = Object.values(guilds).find((g) => g.name.toLowerCase() === guildName.toLowerCase());
    if (!targetGuild) {
      return m.reply(`No encontré el guild *${guildName}*. ¿Lo escribiste mal?`);
    }

    if (targetGuild.members?.length >= 50) {
      return m.reply(`Lo siento, la capacidad de *${targetGuild.name}* está llena (50/50)!`);
    }

    targetGuild.members = targetGuild.members || [];
    targetGuild.members.push(m.sender);
    user.rpg.guildId = targetGuild.id;
    db.save();

    return m.reply(`✅ ¡Bienvenido al cuartel! Ahora eres oficialmente miembro del guild *${targetGuild.name}*! ⚔️`);
  }

  if (action === "leave") {
    if (!user.rpg.guildId) {
      return m.reply(`¡Todavía no estás en ningún guild! ¿De dónde vas a salir? 😂`);
    }

    const myGuild = guilds[user.rpg.guildId];
    if (!myGuild) {
      user.rpg.guildId = null;
      db.save();
      return m.reply(`Tu guild parece que fue disuelto o eliminado. Los datos han sido reiniciados.`);
    }

    if (myGuild.leader === m.sender && myGuild.members?.length > 1) {
      return m.reply(`¡Oye líder! ¿Vas a abandonar a tus miembros así? ¡Transfiere el liderazgo primero o expulsa a todos! 😡`);
    }

    myGuild.members = (myGuild.members || []).filter((member) => member !== m.sender);

    if (myGuild.members.length === 0) {
      delete guilds[user.rpg.guildId];
    }

    const guildName = myGuild.name;
    user.rpg.guildId = null;
    db.save();

    return m.reply(`🏃 ¡Saliste del guild *${guildName}* y volviste a ser un ronin sin señor!`);
  }

  if (action === "info") {
    if (!user.rpg.guildId) {
      return m.reply(`¡No tienes guild, jefe! ¡Busca amigos!`);
    }

    const myGuild = guilds[user.rpg.guildId];
    if (!myGuild) {
      return m.reply(`¡Guild no encontrado!`);
    }

    let txt = `🏰 *PAPAN INFO GUILD* 🏰\n\n`;
    txt += `👑 Nama: *${myGuild.name}*\n`;
    txt += `👤 Leader: @${myGuild.leader?.split("@")[0]}\n`;
    txt += `📊 Level: *${myGuild.level || 1}*\n`;
    txt += `👥 Miembros: *${myGuild.members?.length || 0}/50*\n`;
    txt += `💰 Fondos: *Rp ${(myGuild.treasury || 0).toLocaleString()}*\n`;

    return m.reply(txt, { mentions: [myGuild.leader] });
  }

  if (action === "members") {
    if (!user.rpg.guildId) {
      return m.reply(`¡No tienes guild...`);
    }

    const myGuild = guilds[user.rpg.guildId];
    if (!myGuild) {
      return m.reply(`¡Guild no encontrado!`);
    }

    const memberList = (myGuild.members || [])
      .map((member, i) => {
        const isLeader = member === myGuild.leader ? " 👑" : " 🗡️";
        return `${i + 1}. @${member.split("@")[0]}${isLeader}`;
      })
      .join("\n");

    return m.reply(`👥 *LISTA DE MIEMBROS DE ${myGuild.name}*\n\n${memberList}`, { mentions: myGuild.members });
  }

  if (action === "deposit") {
    if (!user.rpg.guildId) {
      return m.reply(`¿A qué orfanato vas a donar? ¡Tú no tienes guild!`);
    }

    const myGuild = guilds[user.rpg.guildId];
    if (!myGuild) {
      return m.reply(`¡Guild no encontrado!`);
    }

    const amount = parseInt(args[1]) || 0;
    if (amount < 100) {
      return m.reply(`¡Qué tacaño! La donación mínima es *Rp 100*!`);
    }

    if ((user.koin || 0) < amount) {
      return m.reply(`¡No tienes suficiente dinero para donar eso!`);
    }

    user.koin -= amount;
    myGuild.treasury = (myGuild.treasury || 0) + amount;
    db.save();

    return m.reply(`✅ ¡¡DONACIÓN EXITOSA!!\n\nAcabas de meter *Rp ${amount.toLocaleString()}* en la caja fuerte del Guild!\nTotal del Fondo: *Rp ${myGuild.treasury.toLocaleString()}* 🏰💰`);
  }
}

export { pluginConfig as config, handler };
