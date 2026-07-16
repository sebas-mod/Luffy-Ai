import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
    name: "dungeon",
    alias: ["dg", "explore", "labirin"],
    category: "game",
    description: "Explora un calabozo y lucha contra monstruos de forma interactiva",
    usage: ".dungeon",
    example: ".dungeon",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true,
};

const DUNGEONS = [
    {
        id: 1,
        name: "🌲 Bosque Oscuro",
        levelReq: 1,
        monsters: [
            "Goblin Liar",
            "Slime Gigante",
            "Lobo Nocturno",
            "Bandido del Bosque",
        ],
        minReward: 100,
        maxReward: 300,
        dropChance: 40,
    },
    {
        id: 2,
        name: "🍄 Pantano Venenoso",
        levelReq: 5,
        monsters: [
            "Rana Mutante",
            "Arbol Caminante",
            "Araña Venenosa",
            "Vibora del Pantano",
        ],
        minReward: 250,
        maxReward: 500,
        dropChance: 45,
    },
    {
        id: 3,
        name: "🏰 Castillo Viejo",
        levelReq: 10,
        monsters: [
            "Guerrero Esqueleto",
            "Zombie Hambriento",
            "Fantasma Curioso",
            "Gargoyle de Piedra",
        ],
        minReward: 400,
        maxReward: 800,
        dropChance: 50,
    },
    {
        id: 4,
        name: "🏜️ Desierto de la Muerte",
        levelReq: 15,
        monsters: [
            "Escorpion Gigante",
            "Momia Resucitada",
            "Gusano del Desierto",
            "Djinn Malvado",
        ],
        minReward: 600,
        maxReward: 1200,
        dropChance: 55,
    },
    {
        id: 5,
        name: "🌋 Montana de Fuego",
        levelReq: 20,
        monsters: ["Elemental Api", "Golem Magma", "Naga Kecil", "Hellhound"],
        minReward: 900,
        maxReward: 1700,
        dropChance: 60,
    },
    {
        id: 6,
        name: "🧊 Cueva de Hielo Eterno",
        levelReq: 25,
        monsters: ["Golem Es", "Raksasa Frost", "Yeti Ganas", "Serigala Salju"],
        minReward: 1300,
        maxReward: 2400,
        dropChance: 65,
    },
    {
        id: 7,
        name: "☁️ Ruinas del Cielo",
        levelReq: 30,
        monsters: ["Harpy Petir", "Griffin Liar", "Valkyrie Jatuh", "Golem Angin"],
        minReward: 1800,
        maxReward: 3300,
        dropChance: 70,
    },
    {
        id: 8,
        name: "🌊 Oceano de Sombras",
        levelReq: 35,
        monsters: ["Kraken Bayi", "Siren Pemikat", "Hiu Hantu", "Leviathan Merah"],
        minReward: 2500,
        maxReward: 4500,
        dropChance: 75,
    },
    {
        id: 9,
        name: "🕳️ Abismo de la Nada",
        levelReq: 40,
        monsters: ["Malaikat Kematian", "Void Walker", "Shadow Fiend", "Behemoth"],
        minReward: 3500,
        maxReward: 6000,
        dropChance: 80,
    },
    {
        id: 10,
        name: "👹 Infierno Profundo",
        levelReq: 50,
        monsters: ["Iblis Merah", "Succubus Mematikan", "Cerberus", "Raja Iblis"],
        minReward: 5000,
        maxReward: 10000,
        dropChance: 90,
    },
];

const LOOT_TABLE = [
    { item: "iron", chance: 40, qty: [1, 5], icon: "⛏️" },
    { item: "gold", chance: 20, qty: [1, 3], icon: "🪙" },
    { item: "diamond", chance: 5, qty: [1, 2], icon: "💎" },
    { item: "potion", chance: 30, qty: [1, 3], icon: "🧪" },
    { item: "herb", chance: 25, qty: [2, 6], icon: "🌿" },
    { item: "leather", chance: 35, qty: [2, 5], icon: "👞" },
    { item: "mysterybox", chance: 3, qty: [1, 1], icon: "📦" },
];

async function handler(m, { sock }) {
    try {
        const db = getDatabase();
        const user = db.getUser(m.sender);

        if (!user.rpg) user.rpg = {};
        if (!user.rpg.attack) user.rpg.attack = 10;
        if (!user.rpg.health) user.rpg.health = 100;
        if (!user.rpg.maxHealth) user.rpg.maxHealth = 100;
        if (!user.rpg.stamina) user.rpg.stamina = 100;
        if (!user.rpg.maxStamina) user.rpg.maxStamina = 100;
        if (!user.inventory) user.inventory = {};

        const session = user.rpg.dungeon_session || null;
        const userLevel = user.level || 1;

        if (session) {
            const SESSION_TIMEOUT = 5 * 60 * 1000;
            if (Date.now() - session.time > SESSION_TIMEOUT) {
                delete user.rpg.dungeon_session;
                db.save();
            } else {
                return m.reply(
                    `⚔️ *SESION DE CALABOZO ACTIVA*\n\n` +
                    `¡Estas en medio de una exploracion!\n` +
                    `> Responde al ultimo mensaje del bot para cancelar (escribe \`cancelar\`) o continuar la accion (escribe \`atacar\` / \`huir\`).`,
                );
            }
        }

        const available = DUNGEONS.filter((d) => userLevel >= d.levelReq);
        if (available.length === 0) {
            return m.reply(
                `❌ *NIVEL DEMASIADO BAJO*\n\n> Tu nivel actual es *${userLevel}*. Necesitas al menos nivel *1* para entrar al calabozo mas facil.`,
            );
        }

        user.rpg.dungeon_session = {
            stage: "lobi",
            time: Date.now(),
        };
        db.save();

        let txt = `🏰 *SALA DEL CALABOZO*\n\n`;
        txt += `📊 *Tus Estadisticas:*\n`;
        txt += `> Nivel: *${userLevel}*\n`;
        txt += `> Stamina: *${user.rpg.stamina ?? 100}/100*\n\n`;
        txt += `Elige la ubicacion que quieras explorar:\n\n`;

        for (const d of DUNGEONS) {
            if (userLevel >= d.levelReq) {
                txt += `🔓 *${d.id}.* ${d.name} (Lv ${d.levelReq}+)\n`;
            } else {
                txt += `> 🔒 *${d.id}.* ${d.name} (Necesita Nv ${d.levelReq})\n`;
            }
        }
        txt += `\n> 💡 Responde a este mensaje con el *numero* de ubicacion 🔓 (ejemplo: \`1\`) o escribe \`cancelar\` para salir.`;

        return m.reply(txt);
    } catch (error) {
        console.error(error);
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

async function dungeonAnswerHandler(m, sock) {
    if (!m.body || m.isCommand) return false;

    const db = getDatabase();
    const user = db.getUser(m.sender);

    if (!user || !user.rpg || !user.rpg.dungeon_session) return false;

    const session = user.rpg.dungeon_session;
    const SESSION_TIMEOUT = 5 * 60 * 1000;
    if (Date.now() - session.time > SESSION_TIMEOUT) {
        delete user.rpg.dungeon_session;
        db.save();
        await m.reply(
            `⏰ *SESION DE CALABOZO EXPIRADA*\n\n> Tu sesion de calabozo expiro por inactividad de 5 minutos.`,
        );
        return true;
    }

    const text = m.body.trim().toLowerCase();
    const userLevel = user.level || 1;

    if (text === "batal" || text === "cancel" || text === "keluar") {
        delete user.rpg.dungeon_session;
        db.save();
        await m.reply(`🚪 Has salido de la Sala del Calabozo con exito.`);
        return true;
    }

    if (session.stage === "lobi") {
        const choiceId = parseInt(text);
        if (isNaN(choiceId)) return false;

        const dungeon = DUNGEONS.find((d) => d.id === choiceId);

        if (!dungeon) {
            await m.reply(
                `❌ *OPCION NO VALIDA*\n\n> Calabozo numero ${choiceId} no encontrado.`,
            );
            return true;
        }

        if (userLevel < dungeon.levelReq) {
            await m.reply(
                `🔒 *CALABOZO BLOQUEADO*\n\n> Tu nivel (*Nv ${userLevel}*) no es suficiente para entrar a *${dungeon.name}*.\n> Necesitas al menos *Nv ${dungeon.levelReq}*.`,
            );
            return true;
        }

        const staminaCost = 30;
        user.rpg.stamina = user.rpg.stamina ?? 100;

        if (user.rpg.stamina < staminaCost) {
            await m.reply(
                `⚡ *STAMINA INSUFICIENTE*\n\n` +
                `Necesitas al menos *${staminaCost} stamina* para entrar.\n` +
                `Tu stamina actual es solo *${user.rpg.stamina}*.\n\n` +
                `> 💡 *Consejo:* Usa el comando \`.rest\` o cancela primero (escribe \`cancelar\`).`,
            );
            return true;
        }

        user.rpg.stamina -= staminaCost;
        const monster =
            dungeon.monsters[Math.floor(Math.random() * dungeon.monsters.length)];
        const monsterPower = dungeon.levelReq * 10 + Math.floor(Math.random() * 30);

        user.rpg.dungeon_session = {
            stage: "encounter",
            dungeonId: dungeon.id,
            dungeonName: dungeon.name,
            levelReq: dungeon.levelReq,
            monster: monster,
            monsterPower: monsterPower,
            maxReward: dungeon.maxReward,
            minReward: dungeon.minReward,
            dropChance: dungeon.dropChance,
            time: Date.now(),
        };

        db.save();

        await m.react("🚪");
        let txt = `🚪 *ENTRANDO AL CALABOZO*\n\n`;
        txt += `Avanzas lentamente hacia *${dungeon.name}*...\n`;
        txt += `> ⚡ Stamina reducida en *${staminaCost}*\n\n`;
        txt += `De repente, un *👹 ${monster}* emerge de la oscuridad y bloquea tu camino!\n\n`;
        txt += `*⚔️ ¿QUE QUIERES HACER?*\n`;
        txt += `> Responde a este mensaje con \`atacar\` para luchar\n`;
        txt += `> Responde a este mensaje con \`huir\` para escapar (arriesgado)`;

        await m.reply(txt);
        return true;
    }

    if (session.stage === "encounter") {
        if (text === "atacar" || text === "attack" || text === "lawan") {
            const userPower =
                (user.rpg.attack || 10) +
                userLevel * 4 +
                Math.floor(Math.random() * 20);
            const isWin = userPower >= session.monsterPower || Math.random() > 0.4;

            let reportText = "";

            if (isWin) {
                const expReward =
                    150 * (session.levelReq / 2) + Math.floor(Math.random() * 200);
                const goldReward =
                    Math.floor(Math.random() * (session.maxReward - session.minReward)) +
                    session.minReward;

                const droppedItems = [];
                for (const loot of LOOT_TABLE) {
                    if (Math.random() * 100 < loot.chance * (session.dropChance / 50)) {
                        const qty =
                            Math.floor(Math.random() * (loot.qty[1] - loot.qty[0] + 1)) +
                            loot.qty[0];
                        user.inventory[loot.item] = (user.inventory[loot.item] || 0) + qty;
                        droppedItems.push(`${loot.icon} ${loot.item} (x${qty})`);
                    }
                }

                user.koin = (user.koin || 0) + goldReward;
                await addExpWithLevelCheck(sock, m, db, user, expReward);

                reportText += `🎉 *¡VICTORIA BRILLANTE!*\n\n`;
                reportText += `Con un ataque letal, lograste derrotar a *${session.monster}*!\n\n`;
                reportText += `*🎁 RECOMPENSAS OBTENIDAS:*\n`;
                reportText += `> ✨ EXP: *+${Math.floor(expReward)}*\n`;
                reportText += `> 💰 Monedas: *+${goldReward.toLocaleString()}*\n`;

                if (droppedItems.length > 0) {
                    reportText += `\n*📦 BOTIN (LOOT):*\n`;
                    reportText += `> ${droppedItems.join("\n> ")}\n`;
                }

                await m.react("🏆");
            } else {
                const goldLoss = Math.floor((user.koin || 0) * 0.15);
                user.koin = Math.max(0, (user.koin || 0) - goldLoss);
                user.rpg.health = Math.max(1, (user.rpg.health || 100) - 40);

                reportText += `💀 *¡DERROTA TRAGICA!*\n\n`;
                reportText += `Tu fuerza no es suficiente! *${session.monster}* te golpeo con fuerza.\n`;
                reportText += `Lograste arrastrarte fuera con el cuerpo lleno de heridas.\n\n`;
                reportText += `*💔 PERDIDAS:*\n`;
                reportText += `> 💸 Dinero perdido: *-${goldLoss.toLocaleString()} Monedas*\n`;
                reportText += `> ❤️ Vida reducida: *-40 HP*\n\n`;
                reportText += `> 💡 *Consejo:* Sube de nivel, come pociones o fortalece tu arma!`;

                await m.react("💀");
            }

            delete user.rpg.dungeon_session;
            db.save();
            await m.reply(reportText);
            return true;
        } else if (text === "huir" || text === "kabur" || text === "run") {
            const escapeChance = Math.random() > 0.5;
            let reportText = "";

            if (escapeChance) {
                reportText += `🏃‍♂️ *¡LOGRASTE ESCAPAR!*\n\n`;
                reportText += `Das y corres con todas tus fuerzas. *${session.monster}* te perdio de vista!\n`;
                reportText += `Salvaste sin heridas, pero esta aventura fue en vano.`;
                await m.react("💨");
            } else {
                const hpLoss = 25;
                user.rpg.health = Math.max(1, (user.rpg.health || 100) - hpLoss);
                reportText += `💥 *¡FALLASTE AL ESCAPAR!*\n\n`;
                reportText += `Tropezaste con las rocas! *${session.monster}* te alcanzo y te clavo sus garras!\n\n`;
                reportText += `*💔 PERDIDAS:*\n`;
                reportText += `> ❤️ Vida reducida: *-${hpLoss} HP*`;
                await m.react("🩸");
            }

            delete user.rpg.dungeon_session;
            db.save();
            await m.reply(reportText);
            return true;
        } else {
            await m.reply(
                `❓ *OPCION DESCONOCIDA*\n\n` +
                `> Responde con \`atacar\` para luchar contra el monstruo.\n` +
                `> Responde con \`huir\` para escapar.\n` +
                `> Responde con \`cancelar\` si realmente quieres rendirte.`,
            );
            return true;
        }
    }

    return false;
}

export { pluginConfig as config, handler, dungeonAnswerHandler };
