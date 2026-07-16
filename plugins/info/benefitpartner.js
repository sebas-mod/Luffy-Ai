import config from '../../config.js'
const pluginConfig = {
    name: 'benefitpartner',
    alias: ['partnerbenefits', 'keuntunganpartner'],
    category: 'info',
    description: 'Ver los beneficios de ser partner del bot',
    usage: '.benefitpartner',
    example: '.benefitpartner',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {

    const prefix = m.prefix || '.'

    let txt = `🤝 *BENEFICIOS DE PARTNER*\n\n`
    txt += `Beneficios de ser partner de ${config.bot?.name || 'Bot'}:\n\n`

    txt += `🔓 *Acceso a Funciones*\n`
    txt += `├ Todas las funciones premium desbloqueadas\n`
    txt += `├ Energía y monedas ilimitadas\n`
    txt += `├ Acceso a ciertos comandos de owner\n`
    txt += `└ Prioridad en soporte\n\n`

    txt += `📦 *Panel Pterodactyl*\n`
    txt += `├ Puedes crear tu propio servidor\n`
    txt += `├ Acceso al panel de administración\n`
    txt += `└ Puedes vender panels (revendedor)\n\n`

    txt += `💎 *Bonos*\n`
    txt += `├ +200.000 EXP al activar\n`
    txt += `├ +20.000 Monedas al activar\n`
    txt += `├ Badge de partner en el perfil\n`
    txt += `└ Acceso a funciones anticipadas\n\n`

    txt += `💰 *Cómo Ser Partner*\n`
    txt += `├ Contacta al owner: ${config.owner?.name || 'Owner'}\n`
    txt += `├ Duración: 30/60/90 días\n`
    txt += `└ Comando: \`${prefix}addpartner\` (solo owner)\n\n`

    txt += `📋 *Comandos de Partner*\n`
    txt += `├ \`${prefix}cekpartner\` — Verificar estado de partner\n`
    txt += `├ \`${prefix}cekprem\` — Verificar estado premium\n`
    txt += `├ \`${prefix}cekowner\` — Verificar rol del usuario\n`
    txt += `└ \`${prefix}listpartner\` — Lista de partners\n\n`

    txt += `> _Contacta al owner para más información_`

    await m.reply(txt)
}

export { pluginConfig as config, handler }