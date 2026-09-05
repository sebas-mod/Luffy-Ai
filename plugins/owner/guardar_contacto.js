import { findParticipantByNumber } from "../../src/lib/luffy-lid.js";

const pluginConfig = {
    name: "guardar_contacto",
    alias: ["svkontak"],
    category: "owner",
    description: "Guardar contactos de grupos en un archivo VCF",
    usage: ".guardar_contacto <nombre>",
    example: ".guardar_contacto Fulano",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: true,
    cooldown: 5,
    carne: 0,
    isEnabled: true,
};

async function handler(m, { sock, args }) {
    if (args[0] === "get") {
        const target = args[1];
        const baseName = args.slice(2).join(" ") || "Usuario";

        const chats = await sock.groupFetchAllParticipating();
        let groups = [];
        if (target === "all") {
            groups = Object.values(chats);
        } else {
            if (chats[target]) {
                groups.push(chats[target]);
            } else {
                return m.reply("☽◯☾ ♰ ❌ Grupo no encontrado.");
            }
        }

        if (groups.length === 0) {
            return m.reply("☽◯☾ ♰ ❌ El bot no está en ningún grupo.");
        }

        m.reply(`☽◯☾ ♰ ⏳ Extrayendo contactos de ${groups.length} grupos...`);

        let vcards = "";
        let count = 0;
        let index = 1;
        const botNum = sock.user?.id?.split(":")[0] || "";
        const botLid = sock.user?.lid ? String(sock.user.lid).replace(/@.+/g, "") : null;
        const botJid = botNum ? botNum + "@s.whatsapp.net" : "";
        const contactArray = [];

        for (const group of groups) {
            for (const participant of group.participants) {
                const isBot =
                    (botJid
                        ? findParticipantByNumber([participant], botJid) !== null
                        : false) ||
                    (botLid && String(participant.lid || participant.id || "").includes(botLid));
                if (isBot) continue;

                const number = (participant.jid || participant.phoneNumber || participant.id)
                    .split("@")[0];
                const name = `${baseName} ${index}`;
                const singleVcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`;

                vcards += singleVcard + "\n";
                contactArray.push({ vcard: singleVcard });
                count++;
                index++;
            }
        }

        if (count === 0) {
            return m.reply("☽◯☾ ♰ ❌ No hay contactos para extraer.");
        }

        await sock.sendMessage(m.chat, {
            document: Buffer.from(vcards, "utf8"),
            fileName: `${baseName}_${count}_Contactos.vcf`,
            mimetype: "text/vcard",
            caption: `✅ *${count} contactos extraídos en VCF.*`
        }, { quoted: m });

        await sock.sendMessage(m.chat, {
            contacts: {
                displayName: `${count} Contactos`,
                contacts: contactArray
            }
        }, { quoted: m });

        return;
    }

    const baseName = args.join(" ") || "Usuario";
    const chats = await sock.groupFetchAllParticipating();
    const groupList = Object.values(chats);

    if (groupList.length === 0) {
        return m.reply("☽◯☾ ♰ ❌ El bot no está en ningún grupo.");
    }

    const sections = [
        {
            title: "Lista de Grupos",
            rows: groupList.map(g => ({
                header: "",
                title: g.subject,
                description: `Miembros: ${g.participants?.length || 0}`,
                id: `${m.prefix}guardar_contacto get ${g.id} ${baseName}`
            }))
        }
    ];

    await sock.sendMessage(m.chat, {
        text: `📇 *SISTEMA GUARDAR CONTACTOS (VCF)*\n\n` +
            `Sistema de extracción automática de contactos de los grupos donde está el bot.\n` +
            `Nombre Base: *${baseName}*\n\n` +
            `*USO:*\n` +
            `• *${m.prefix || "."}savekontak <nombre>* — Guardar con nombre personalizado\n` +
            `• *${m.prefix || "."}savekontak* — Guardar con el nombre predeterminado "Usuario"\n\n` +
            `*EXPLICACIÓN DEL FLUJO DE USO:*\n` +
            `1. Elige un grupo específico con el botón *Elegir Grupo* de abajo, o pulsa *Todos los Grupos* para extraer contactos de forma global.\n` +
            `2. El bot recopilará los números de los participantes e ignorará el número del propio bot.\n` +
            `3. El resultado se enviará como archivo de documento (*.vcf*) junto con la lista de contactos de WhatsApp para poder guardarlos directamente.`,
        footer: "Powered by ReviewBot",
        interactiveButtons: [
            {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: "Elegir Grupo",
                    sections
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "Todos los Grupos",
                    id: `${m.prefix}guardar_contacto get all ${baseName}`
                })
            }
        ]
    }, { quoted: m });
}

export { pluginConfig as config, handler };
