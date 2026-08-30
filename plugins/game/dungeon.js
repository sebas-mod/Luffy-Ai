import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
    name: "dungeon",
    alias: ["dg", "explore", "labirin"],
    category: "game",
    description: "Explora la mazmorra y lucha contra monstruos de forma interactiva",
    usage: ".dungeon",
    example: ".dungeon",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    carne: 0,
    isEnabled: true,
};

const DUNGEONS = [
    {
        id: 1,
        name: "🌲 Bosque Oscuro",
        levelReq: 1,
        monsters: [
            "Goblin Salvaje",
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
            "Sapo Mutante",
            "Árbol Caminante",
            "Araña Venenosa",
            "Víbora del Pantano",
        ],
        minReward: 250,
        maxReward: 500,
        dropChance: 45,
    },
    {
        id: 3,
        name: "🏰 Castillo Antiguo",
        levelReq: 10,
        monsters: [
            "Soldado Esqueleto",
            "Zombi Hambriento",
            "Fantasma Curioso",
            "Gárgola de Piedra",
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
            "Escorpión Gigante",
            "Momia Resucitada",
            "Gusano del Desierto",
            "Genio Malvado",
        ],
        minReward: 600,
        maxReward: 1200,
        dropChance: 55,
    },
    {
        id: 5,
        name: "🌋 Montaña de Fuego",
        levelReq: 20,
        monsters: ["Elemental de Fuego", "Gólem de Magma", "Pequeño Dragón", "Perro Infernal"],
        minReward: 900,
        maxReward: 1700,
        dropChance: 60,
    },
    {
        id: 6,
        name: "🧊 Cueva de Hielo Eterno",
        levelReq: 25,
        monsters: ["Gólem de Hielo", "Gigante de Escarcha", "Yeti Feroz", "Lobo de Nieve"],
        minReward: 1300,
        maxReward: 2400,
        dropChance: 65,
    },
    {
        id: 7,
        name: "☁️ Ruinas del Cielo",
        levelReq: 30,
        monsters: ["Arpía del Rayo", "Grifo Salvaje", "Valquiria Caída", "Gólem de Viento"],
        minReward: 1800,
        maxReward: 3300,
        dropChance: 70,
    },
    {
        id: 8,
        name: "🌊 Océano de las Sombras",
        levelReq: 35,
        monsters: ["Bebé Kraken", "Sirena Seductora", "Tiburón Fantasma", "Leviatán Rojo"],
        minReward: 2500,
        maxReward: 4500,
        dropChance: 75,
    },
    {
        id: 9,
        name: "🕳️ Abismo del Vacío",
        levelReq: 40,
        monsters: ["Ángel de la Muerte", "Caminante del Vacío", "Fiend de las Sombras", "Behemoth"],
        minReward: 3500,
        maxReward: 6000,
        dropChance: 80,
    },
    {
        id: 10,
        name: "👹 Infierno Más Profundo",
        levelReq: 50,
        monsters: ["Demonio Rojo", "Súcubo Mortal", "Cerbero", "Rey Demonio"],
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
                    `⚔️ *LA SESIÓN DE MAZMORRA SIGUE ACTIVA*\n\n` +
                    `¡Estás en medio de una exploración!\n` +
                    `> Responde al último chat del bot para cancelar (escribe \`cancelar\`) o continuar la acción (escribe \`atacar\` / \`huir\`).`,
                );
            }
        }

        const available = DUNGEONS.filter((d) => userLevel >= d.levelReq);
        if (available.length === 0) {
            return m.reply(
                `❌ *NIVEL DEMASIADO BAJO*\n\n> Tu nivel actual es *${userLevel}*. Necesitas mínimo nivel *1* para entrar a la mazmorra más fácil.`,
            );
        }

        user.rpg.dungeon_session = {
            stage: "lobby",
            time: Date.now(),
        };
        db.save();

        let txt = `☽◯☾ ╭━ ♰ 🏰 ♰ ━╮ ☽◯☾\n  *LOBBY DE LA MAZMORRA* 🏰\n╰━ ⊱༺༒༻⊰ ━╯\n\n`;
        txt += `📊 *Tus Estadísticas:*\n`;
        txt += `> Nivel: *${userLevel}*\n`;
        txt += `> Stamina: *${user.rpg.stamina ?? 100}/100*\n\n`;
        txt += `Elige la ubicación que quieres explorar:\n\n`;

        for (const d of DUNGEONS) {
            if (userLevel >= d.levelReq) {
                txt += `🔓 *${d.id}.* ${d.name} (Lv ${d.levelReq}+)\n`;
            } else {
                txt += `> 🔒 *${d.id}.* ${d.name} (Necesita Lv ${d.levelReq})\n`;
            }
        }
        txt += `\n> 💡 Responde a este mensaje con el *número* de la ubicación 🔓 (ejemplo: \`1\`) o escribe \`cancelar\` para salir.`;

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
            `⏰ *SESIÓN DE MAZMORRA EXPIRADA*\n\n> Tu sesión de mazmorra caducó por inactividad de 5 minutos.`,
        );
        return true;
    }

    const text = m.body.trim().toLowerCase();
    const userLevel = user.level || 1;

    if (text === "cancelar" || text === "cancel" || text === "salir" || text === "abortar") {
        delete user.rpg.dungeon_session;
        db.save();
        await m.reply(`🚪 Saliste del Lobby de la Mazmorra sano y salvo.`);
        return true;
    }

    if (session.stage === "lobby") {
        const choiceId = parseInt(text);
        if (isNaN(choiceId)) return false;

        const dungeon = DUNGEONS.find((d) => d.id === choiceId);

        if (!dungeon) {
            await m.reply(
                `❌ *OPCIÓN NO VÁLIDA*\n\n> La mazmorra número ${choiceId} no existe.`,
            );
            return true;
        }

        if (userLevel < dungeon.levelReq) {
            await m.reply(
                `🔒 *MAZMORRA BLOQUEADA*\n\n> Tu nivel (*Lv ${userLevel}*) no es suficiente para entrar a *${dungeon.name}*.\n> Necesitas mínimo *Lv ${dungeon.levelReq}*.`,
            );
            return true;
        }

        const staminaCost = 30;
        user.rpg.stamina = user.rpg.stamina ?? 100;

        if (user.rpg.stamina < staminaCost) {
            await m.reply(
                `⚡ *STAMINA INSUFICIENTE*\n\n` +
                `Necesitas al menos *${staminaCost} de stamina* para entrar.\n` +
                `Tu stamina restante es solo *${user.rpg.stamina}*.\n\n` +
                `> 💡 *Tip:* Usa el comando \`.rest\` o cancela primero (escribe \`cancelar\`).`,
            );
            return true;
        }

        user.rpg.stamina -= staminaCost;
        const monster =
            dungeon.monsters[Math.floor(Math.random() * dungeon.monsters.length)];
        const monsterPower = dungeon.levelReq * 10 + Math.floor(Math.random() * 30);

        user.rpg.dungeon_session = {
            stage: "encuentro",
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
        let txt = `┈┈┈┈┈┈┈┈┈┈\n🚪 *ENTRANDO A LA MAZMORRA* 🚪\n┈┈┈┈┈┈┈┈┈┈\n\n`;
        txt += `Te adentras lentamente en *${dungeon.name}*...\n`;
        txt += `> ⚡ Stamina reducida *${staminaCost}*\n\n`;
        txt += `De repente, un *👹 ${monster}* surge de la oscuridad y bloquea tu camino!\n\n`;
        txt += `*⚔️ ¿QUÉ QUIERES HACER?*\n`;
        txt += `> Responde a este mensaje con \`atacar\` para pelear\n`;
        txt += `> Responde a este mensaje con \`huir\` para huir (arriesgado)`;

        await m.reply(txt);
        return true;
    }

    if (session.stage === "encuentro") {
        if (text === "serang" || text === "attack" || text === "lawan" || text === "atacar" || text === "ataco" || text === "pelear") {
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

                user.berry = (user.berry || 0) + goldReward;
                await addExpWithLevelCheck(sock, m, db, user, expReward);

                reportText += `🎉 *¡VICTORIA GLORIOSA!*\n\n`;
                reportText += `Con un ataque mortal, ¡lograste acabar con *${session.monster}*!\n\n`;
                reportText += `*🎁 RECOMPENSAS OBTENIDAS:*\n⚡•───•⚡\n`;
                reportText += `> ✨ EXP: *+${Math.floor(expReward)}*\n`;
                reportText += `> 💰 Berry: *+${goldReward.toLocaleString()}*\n`;

                if (droppedItems.length > 0) {
                    reportText += `\n*📦 BOTÍN (LOOT):*\n`;
                    reportText += `> ${droppedItems.join("\n> ")}\n`;
                }

                await m.react("🏆");
            } else {
                const goldLoss = Math.floor((user.berry || 0) * 0.15);
                user.berry = Math.max(0, (user.berry || 0) - goldLoss);
                user.rpg.health = Math.max(1, (user.rpg.health || 100) - 40);

                reportText += `☠︎━━━━━━☠︎\n💀 *¡DERROTA TRÁGICA!*\n\n`;
                reportText += `¡Tu fuerza no es suficiente! *${session.monster}* te hizo retroceder de manera contundente.\n`;
                reportText += `Lograste arrastrarte para salir con el cuerpo lleno de heridas.\n\n`;
                reportText += `*💔 PÉRDIDAS:*\n`;
                reportText += `> 💸 Dinero perdido: *-${goldLoss.toLocaleString()} Berry*\n`;
                reportText += `> ❤️ Vida reducida: *-40 HP*\n\n`;
                reportText += `> 💡 *Tip:* Sube de nivel, toma una poción o fortalece tus armas!`;

                await m.react("💀");
            }

            delete user.rpg.dungeon_session;
            db.save();
            await m.reply(reportText);
            return true;
        } else if (text === "lari" || text === "kabur" || text === "run" || text === "huir" || text === "correr" || text === "fugarse") {
            const escapeChance = Math.random() > 0.5;
            let reportText = "";

            if (escapeChance) {
                reportText += `🏃‍♂️ *¡LOGRÓ HUIR!*\n\n`;
                reportText += `Te das la vuelta y corres con todas tus fuerzas. *${session.monster}* pierde tu rastro!\n`;
                reportText += `Sobreviviste sin heridas, pero esta aventura fue en vano.`;
                await m.react("💨");
            } else {
                const hpLoss = 25;
                user.rpg.health = Math.max(1, (user.rpg.health || 100) - hpLoss);
                reportText += `💥 *¡NO PUDO HUIR!*\n\n`;
                reportText += `¡Tropezaste con las rocas! *${session.monster}* te persigue y clava sus garras en tu cuerpo!\n\n`;
                reportText += `*💔 PÉRDIDAS:*\n`;
                reportText += `> ❤️ Vida reducida: *-${hpLoss} HP*`;
                await m.react("🩸");
            }

            delete user.rpg.dungeon_session;
            db.save();
            await m.reply(reportText);
            return true;
        } else {
            await m.reply(
                `❓ *OPCIÓN NO RECONOCIDA*\n\n` +
                `> Responde con \`atacar\` para luchar contra el monstruo.\n` +
                `> Responde con \`huir\` para huir.\n` +
                `> Responde con \`cancelar\` si realmente te rindes.`,
            );
            return true;
        }
    }

    return false;
}

export { pluginConfig as config, handler, dungeonAnswerHandler };
