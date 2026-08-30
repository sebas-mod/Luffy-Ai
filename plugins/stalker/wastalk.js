import moment from 'moment-timezone'
import PhoneNum from 'awesome-phonenumber'
import config from '../../config.js'
const pluginConfig = {
    name: 'wastalk',
    alias: ['whatsappstalk', 'stalkwa'],
    category: 'stalker',
    description: 'Buscar perfil de WhatsApp',
    usage: '.wastalk <numero/tag>',
    example: '.wastalk 6281234567890',
    isGroup: false,
    isBotAdmin: false,
    isAdmin: false,
    cooldown: 5,
    carne: 2,
    isEnabled: true
};

let regionNames = new Intl.DisplayNames(['en'], {
    type: 'region'
});

async function handler(m, { sock }) {
    const text = m.text;
    let num = m.quoted?.sender || m.mentionedJid?.[0] || text;
    console.log(num)
    if (!num) {
        return m.reply(`☽◯☾ ♰ Ejemplo: ${m.prefix}${m.command} @tag / 628xxx`);
    }

    num = num.replace(/\D/g, '') + '@s.whatsapp.net';

    try {
        const onWa = await sock.onWhatsApp(num);
        if (!onWa || !onWa[0]?.exists) {
            return m.reply('❌ El usuario no existe en WhatsApp');
        }

        let img = 'https://telegra.ph/file/70e8de9b1879568954f09.jpg';
        try {
            img = await sock.profilePictureUrl(num, 'image');
        } catch (e) {}

        let bio = {};
        try {
            bio = await sock.fetchStatus(num);
        } catch (e) {}

        let name = 'Unknown';
        try {
            name = await sock.getName(num) || num.split('@')[0];
        } catch (e) {}

        let business = null;
        try {
            business = await sock.getBusinessProfile(num);
        } catch (e) {}

        let format, country;
        try {
            format = PhoneNum(`+${num.split('@')[0]}`);
            if (!format.isValid()) {
                console.log('PhoneNum invalid for:', num);
            }
            country = regionNames.of(format.getRegionCode('mobile'));
        } catch (e) {
            format = null;
            country = 'Unknown';
        }

        const formattedNumber = format ? format.getNumber('international') : num.split('@')[0];

        let res = `\t\t\t\t*▾ WHATSAPP ▾*\n\n` +
                  `*° País :* ${country ? country.toUpperCase() : '-'}\n` +
                  `*° Nombre :* ${name}\n` +
                  `*° Número formateado :* ${formattedNumber}\n` +
                  `*° URL :* wa.me/${num.split('@')[0]}\n` +
                  `*° Menciones :* @${num.split('@')[0]}\n` +
                  `*° Estado :* ${bio?.status || '-'}\n` +
                  `*° Fecha del estado :* ${bio?.setAt ? moment(bio.setAt).tz('Asia/Jakarta').format('LLLL') : '-'}\n\n`;

        if (business) {
            res += `\t\t\t\t*▾ INFO DE LA EMPRESA ▾*\n\n` +
                   `*° ID de negocio :* ${business.wid}\n` +
                   `*° Website :* ${business.website ? business.website : '-'}\n` +
                   `*° Email :* ${business.email ? business.email : '-'}\n` +
                   `*° Categoría :* ${business.category}\n` +
                   `*° Dirección :* ${business.address ? business.address : '-'}\n` +
                   `*° Zona horaria :* ${business.business_hours?.timezone ? business.business_hours.timezone : '-'}\n` +
                   `*° Descripción :* ${business.description ? business.description : '-'}`;
        } else {
            res += '*Cuenta estándar de WhatsApp*';
        }

        await sock.sendMessage(m.chat, {
            image: { url: img },
            caption: res,
            mentions: [num]
        }, { quoted: m });

    } catch (e) {
        console.error('WaStalk Error:', e);
        m.reply('❌ Error al buscar al usuario.');
    }
}

export { pluginConfig as config, handler }