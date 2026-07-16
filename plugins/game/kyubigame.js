import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
    name: "kyubigame",
    alias: ["kyubi", "naruto", "shinobi"],
    category: "game",
    description: "Explora el mundo shinobi y enfrenta a los enemigos Ninja mas fuertes",
    usage: ".kyubigame",
    example: ".kyubigame",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true,
};

const LOCATIONS = [
    {
        id: 1,
            name: "🍃 Aldea Konoha",
        levelReq: 1,
        monsters: [
            "Genin Novato",
            "Bandido Salvaje",
            "Perro del Bosque",
            "Ninja Explorador",
        ],
        minReward: 100,
        maxReward: 300,
        dropChance: 40,
    },
    {
        id: 2,
            name: "🌳 Bosque de la Muerte",
        levelReq: 5,
        monsters: [
            "Ninja Otogakure",
            "Tigre Gigante",
            "Ciempiés Venenoso",
            "Serpiente de Orochimaru",
        ],
        minReward: 250,
        maxReward: 500,
        dropChance: 45,
    },
    {
        id: 3,
            name: "☁️ Valle del Rayo",
        levelReq: 10,
        monsters: [
            "Ninja de Kumo",
            "Samurai de Hierro",
            "Buhó Electrico",
            "Lobo Relámpago",
        ],
        minReward: 400,
        maxReward: 800,
        dropChance: 50,
    },
    {
        id: 4,
            name: "🦇 Cueva de Akatsuki",
        levelReq: 15,
        monsters: [
            "Clon de Zetsu Blanco",
            "Murciélago Venenoso",
            "Muñeco de Sasori",
            "Ninja Desertor",
        ],
        minReward: 600,
        maxReward: 1200,
        dropChance: 55,
    },
    {
        id: 5,
        name: "🌊 Valle Final",
        levelReq: 25,
        monsters: [
            "Ninja Asesino",
            "Clon Mizukage",
            "Fantasma Uchiha",
            "Estatua Golem",
        ],
        minReward: 900,
        maxReward: 1700,
        dropChance: 60,
    },
    {
        id: 6,
        name: "💥 Campo de Batalla Shinobi",
        levelReq: 35,
        monsters: [
            "Zetsu Gigante",
            "Edo Tensei Kage",
            "Shinobi No-Muerto",
            "Ejército de Clones",
        ],
        minReward: 1300,
        maxReward: 2400,
        dropChance: 65,
    },
    {
        id: 7,
        name: "🦊 Kurama's Cage",
        levelReq: 50,
        monsters: [
            "Chakra de Cola Nueve",
            "Kyubi Salvaje",
            "Kurama de Oscuridad",
            "Espíritu Bijuu",
        ],
        minReward: 2500,
        maxReward: 4500,
        dropChance: 75,
    }
];

const LOOT_TABLE = [
    { item: "kunai", chance: 40, qty: [2, 5], icon: "🗡️" },
    { item: "shuriken", chance: 35, qty: [3, 6], icon: "⚔️" },
    { item: "chakra", chance: 30, qty: [1, 3], icon: "🌀" },
    { item: "scroll", chance: 15, qty: [1, 2], icon: "📜" },
    { item: "bowlramen", chance: 20, qty: [1, 2], icon: "🍜" },
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

        const session = user.rpg.kyubigame_session || null;
        const userLevel = user.level || 1;

        if (session) {
            const SESSION_TIMEOUT = 5 * 60 * 1000;
            if (Date.now() - session.time > SESSION_TIMEOUT) {
                delete user.rpg.kyubigame_session;
                db.save();
            } else {
                return m.reply(
                    `⚔️ *MISION SHINOBI ACTIVA*\n\n` +
                    `¡Todavia estas en el campo de batalla!\n` +
                    `> Responde al ultimo mensaje del bot con (\`atacar\` / \`huir\`) o cancela la mision (escribe \`cancelar\`).`,
                );
            }
        }

        const available = LOCATIONS.filter((d) => userLevel >= d.levelReq);
        if (available.length === 0) {
            return m.reply(
                `❌ *NIVEL DEMASIADO BAJO*\n\n> Tu nivel actual es *${userLevel}*. Necesitas al menos nivel *1* para empezar la aventura shinobi.`,
            );
        }

        user.rpg.kyubigame_session = {
            stage: "lobi",
            time: Date.now(),
        };
        db.save();

        let txt = `⛩️ *SALON SHINOBI*\n\n`;
        txt += `📊 *Estadisticas Shinobi:*\n`;
        txt += `> Nivel: *${userLevel}*\n`;
        txt += `> Stamina: *${user.rpg.stamina ?? 100}/100*\n\n`;
        txt += `Elige la ubicacion de la mision que quieras explorar:\n\n`;

        for (const d of LOCATIONS) {
            if (userLevel >= d.levelReq) {
                txt += `🔓 *${d.id}.* ${d.name} (Lv ${d.levelReq}+)\n`;
            } else {
                txt += `> 🔒 *${d.id}.* ${d.name} (Necesita Nv ${d.levelReq})\n`;
            }
        }
        txt += `\n> 💡 Responde a este mensaje con el *numero* de la ubicacion (ejemplo: \`1\`) o escribe \`cancelar\` para salir.`;

        return m.reply(txt);
    } catch (error) {
        console.error(error);
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

async function kyubigameAnswerHandler(m, sock) {
    if (!m.body || m.isCommand) return false;

    const db = getDatabase();
    const user = db.getUser(m.sender);

    if (!user || !user.rpg || !user.rpg.kyubigame_session) return false;

    const session = user.rpg.kyubigame_session;
    const SESSION_TIMEOUT = 5 * 60 * 1000;
    if (Date.now() - session.time > SESSION_TIMEOUT) {
        delete user.rpg.kyubigame_session;
        db.save();
        await m.reply(
            `⏰ *MISION EXPIRADA*\n\n> Tu sesion de mision shinobi expiro por inactividad de 5 minutos.`,
        );
        return true;
    }

    const text = m.body.trim().toLowerCase();
    const userLevel = user.level || 1;

    if (text === "batal" || text === "cancel" || text === "keluar" || text === "cancelar" || text === "salir") {
        delete user.rpg.kyubigame_session;
        db.save();
        await m.reply(`🚪 ¡Cancelaste la mision y volviste a la aldea con exito!`);
        return true;
    }

    if (session.stage === "lobi") {
        const choiceId = parseInt(text);
        if (isNaN(choiceId)) return false;

        const location = LOCATIONS.find((d) => d.id === choiceId);

        if (!location) {
            await m.reply(
                `❌ *MISION NO VALIDA*\n\n> La ubicacion numero ${choiceId} no existe en el mapa shinobi.`,
            );
            return true;
        }

        if (userLevel < location.levelReq) {
            await m.reply(
                `🔒 *MISION BLOQUEADA*\n\n> Tu nivel (*Nv ${userLevel}*) no es suficiente para entrar a *${location.name}*.\n> Necesitas al menos *Nv ${location.levelReq}*.`,
            );
            return true;
        }

        const staminaCost = 30;
        user.rpg.stamina = user.rpg.stamina ?? 100;

        if (user.rpg.stamina < staminaCost) {
            await m.reply(
                `⚡ *CHAKRA/STAMINA INSUFICIENTE*\n\n` +
                `Necesitas al menos *${staminaCost} de stamina* para entrar.\n` +
                `Tu stamina actual es solo *${user.rpg.stamina}*.\n\n` +
                `> 💡 *Consejo:* Usa el comando \`.rest\` o cancela primero (escribe \`cancelar\`).`,
            );
            return true;
        }

        user.rpg.stamina -= staminaCost;
        const monster =
            location.monsters[Math.floor(Math.random() * location.monsters.length)];
        const monsterPower = location.levelReq * 10 + Math.floor(Math.random() * 30);

        user.rpg.kyubigame_session = {
            stage: "encounter",
            locationId: location.id,
            locationName: location.name,
            levelReq: location.levelReq,
            monster: monster,
            monsterPower: monsterPower,
            maxReward: location.maxReward,
            minReward: location.minReward,
            dropChance: location.dropChance,
            time: Date.now(),
        };

        db.save();

        await m.react("⛩️");
        let txt = `⛩️ *ENTRANDO A LA ZONA DE MISION*\n\n`;
        txt += `Saltas suavemente por *${location.name}*...\n`;
        txt += `> ⚡ Stamina reducida *${staminaCost}*\n\n`;
        txt += `De repente, un *👹 ${monster}* aparece de la oscuridad y bloquea tu camino!\n\n`;
        txt += `*⚔️ QUE QUIERES HACER?*\n`;
        txt += `> Responde a este mensaje con \`atacar\` para luchar\n`;
        txt += `> Responde a este mensaje con \`huir\` para huir (arriesgado)`;

        await m.reply(txt);
        return true;
    }

    if (session.stage === "encounter") {
        if (text === "serang" || text === "attack" || text === "lawan" || text === "atacar") {
            const userPower =
                (user.rpg.attack || 10) +
                userLevel * 4 +
                Math.floor(Math.random() * 20);
            const isWin = userPower >= session.monsterPower || Math.random() > 0.4;

            let reportText = "";

            if (isWin) {
                const expReward =
                    150 * (session.levelReq / 2) + Math.floor(Math.random() * 200);
                const ryoReward =
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

                user.koin = (user.koin || 0) + ryoReward;
                await addExpWithLevelCheck(sock, m, db, user, expReward);

                reportText += `🎉 *¡MISION COMPLETADA!*\n\n`;
                reportText += `Con un jutsu mortal, ¡lograste derrotar a *${session.monster}*!\n\n`;
                reportText += `*🎁 RECOMPENSA POR COMPLETAR LA MISION:*\n`;
                reportText += `> ✨ EXP: *+${Math.floor(expReward)}*\n`;
                reportText += `> 💰 Ryo (Monedas): *+${ryoReward.toLocaleString()}*\n`;

                if (droppedItems.length > 0) {
                    reportText += `\n*📦 BOTIN SHINOBI CAPTURADO:*\n`;
                    reportText += `> ${droppedItems.join("\n> ")}\n`;
                }

                await m.react("🏆");
            } else {
                const ryoLoss = Math.floor((user.koin || 0) * 0.15);
                user.koin = Math.max(0, (user.koin || 0) - ryoLoss);
                user.rpg.health = Math.max(1, (user.rpg.health || 100) - 40);

                reportText += `💀 *¡MISION FALLIDA!*\n\n`;
                reportText += `Tu fuerza aun no es igual! *${session.monster}* te derroto sin piedad.\n`;
                reportText += `Usaste un jutsu de sustitucion y arrastraste tu cuerpo herido fuera de peligro.\n\n`;
                reportText += `*💔 PERDIDAS:*\n`;
                reportText += `> 💸 Dinero perdido: *-${ryoLoss.toLocaleString()} Ryo*\n`;
                reportText += `> ❤️ Vida reducida: *-40 HP*\n\n`;
                reportText += `> 💡 *Consejo:* Sube de nivel, come ramen o fortalece tus jutsus!`;

                await m.react("💀");
            }

            delete user.rpg.kyubigame_session;
            db.save();
            await m.reply(reportText);
            return true;
        } else if (text === "lari" || text === "kabur" || text === "run" || text === "huir") {
            const escapeChance = Math.random() > 0.5;
            let reportText = "";

            if (escapeChance) {
                reportText += `🏃‍♂️ *¡LOGRASTE HUIR!*\n\n`;
                reportText += `Lanzaste una bomba de humo y corriste con todas tus fuerzas. *${session.monster}* perdio tu rastro!\n`;
                reportText += `Saliste ileso, pero esta aventura fue en vano.`;
                await m.react("💨");
            } else {
                const hpLoss = 25;
                user.rpg.health = Math.max(1, (user.rpg.health || 100) - hpLoss);
                reportText += `💥 *¡FALLASTE AL HUIR!*\n\n`;
                reportText += `Tropezaste con una trampa ninja! *${session.monster}* te atrapo y te lanzo un ataque directo!\n\n`;
                reportText += `*💔 PERDIDAS:*\n`;
                reportText += `> ❤️ Vida reducida: *-${hpLoss} HP*`;
                await m.react("🩸");
            }

            delete user.rpg.kyubigame_session;
            db.save();
            await m.reply(reportText);
            return true;
        } else {
            await m.reply(
                `❓ *COMANDO NO RECONOCIDO*\n\n` +
                `> Responde con \`atacar\` para luchar contra el enemigo.\n` +
                `> Responde con \`huir\` para huir.\n` +
                `> Responde con \`cancelar\` si quieres cancelar la mision.`,
            );
            return true;
        }
    }

    return false;
}

export { pluginConfig as config, handler, kyubigameAnswerHandler };
