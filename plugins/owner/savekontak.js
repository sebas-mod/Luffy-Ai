const pluginConfig = {
    name: "savecontacto",
    alias: ["sv", "svcontacto"],
    category: "owner",
    description: "Guarda los contactos del grupo en un archivo VCF",
    usage: ".savecontacto <nombre>",
    example: ".savecontacto Fulan",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
};

async function handler(m, { sock, args }) {
    if (args[0] === "get") {
        const target = args[1];
        const baseName = args.slice(2).join(" ") || "User";

        const chats = await sock.groupFetchAllParticipating();
        let groups = [];
        if (target === "all") {
            groups = Object.values(chats);
        } else {
            if (chats[target]) {
                groups.push(chats[target]);
            } else {
                return m.reply("❌ Grup no encontrado.");
            }
        }

        if (groups.length === 0) {
            return m.reply("❌ El bot no está en ningún grupo.");
        }

        m.reply(`⏳ Está mengekstrak contacto de ${groups.length} grup...`);

        let vcards = "";
        let count = 0;
        let index = 1;
        const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const contactArray = [];

        for (const group of groups) {
            for (const participant of group.participants) {
                if (participant.id === botId) continue;

                const number = participant.id.split("@")[0];
                const name = `${baseName} ${index}`;
                const singleVcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`;

                vcards += singleVcard + "\n";
                contactArray.push({ vcard: singleVcard });
                count++;
                index++;
            }
        }

        if (count === 0) {
            return m.reply("❌ No hay contactos que puedan ser extraídos.");
        }

        await sock.sendMessage(m.chat, {
            document: Buffer.from(vcards, "utf8"),
            fileName: `${baseName}_${count}_Contacto.vcf`,
            mimetype: "text/vcard",
            caption: `✅ *Éxito mengekstrak ${count} contacto a en VCF.*`
        }, { quoted: m });

        await sock.sendMessage(m.chat, {
            contacts: {
                displayName: `${count} Contacto`,
                contacts: contactArray
            }
        }, { quoted: m });

        return;
    }

    const baseName = args.join(" ") || "User";
    const chats = await sock.groupFetchAllParticipating();
    const groupList = Object.values(chats);

    if (groupList.length === 0) {
        return m.reply("❌ Bot no berhay en el grupo mana pun.");
    }

    const sections = [
        {
            title: "Lista Grup",
            rows: groupList.map(g => ({
                header: "",
                title: g.subject,
                description: `Miembros: ${g.participants?.length || 0}`,
                id: `${m.prefix}savecontacto get ${g.id} ${baseName}`
            }))
        }
    ];

    await sock.sendMessage(m.chat, {
        text: `📇 *SISTEMA GUARDAR CONTACTOS (VCF)*\n\n` +
            `Sistema de extracción de contactoss automáticamente de los grupos que sigue el bot.\n` +
            `Nombre Base: *${baseName}*\n\n` +
            `*USO:*\n` +
            `• *${m.prefix || "."}savecontacto <nombre>* — Guarydo con nombre kustom\n` +
            `• *${m.prefix || "."}savecontacto* — Guarydo con nombre default "User"\n\n` +
            `*EXPLICACIÓN DEL FLUJO DE USO:*\n` +
            `1. Seleccionar grupo específico de tombol *Seleccionar Grupo* abajo, o klik *Todos Grup* para mengekstrak contacto de forma global.\n` +
            `2. El bot recopilará los números de participantes e ignorará su propio número.\n` +
            `3. El resultado se enviará como un archivo de documento (*.vcf*) junto con la lista de contactos de WhatsApp para que puedas guardarlos directamente.`,
        footer: "Powered by ReviewBot",
        interactiveButtons: [
            {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: "Seleccionar Grupo",
                    sections
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "Todos Grup",
                    id: `${m.prefix}savecontacto get all ${baseName}`
                })
            }
        ]
    }, { quoted: m });
}

export { pluginConfig as config, handler };
