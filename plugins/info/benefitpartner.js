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
    carne: 0,
    isEnabled: true
}

async function handler(m) {

    const prefix = m.prefix || '.'

    let txt = `🤝 *BENEFICIOS DEL PARTNER*\n\n`
    txt += `Beneficios de ser partner ${config.bot?.name || 'Bot'}:\n\n`

    txt += `🔓 *Acceso a Funciones*\n`
    txt += `├ Todas las funciones premium abiertas\n`
    txt += `├ Carne y berry ilimitados\n`
    txt += `├ Acceso a ciertos comandos del capitán\n`
    txt += `└ Soporte prioritario\n\n`

    txt += `📦 *Panel Pterodactyl*\n`
    txt += `├ Puedes crear tu propio servidor\n`
    txt += `├ Acceso al panel de gestión\n`
    txt += `└ Puedes vender paneles (reseller)\n\n`

    txt += `💎 *Bonos*\n`
    txt += `├ +200.000 EXP al activar\n`
    txt += `├ +20.000 Berry al activar\n`
    txt += `├ Insignia de partner en el perfil\n`
    txt += `└ Acceso anticipado a funciones\n\n`

    txt += `💰 *Cómo Ser Partner*\n`
    txt += `├ Contacta al capitán: ${config.owner?.name || 'Capitán'}\n`
    txt += `├ Duración: 30/60/90 días\n`
    txt += `└ Comando: \`${prefix}agregar_socio\` (solo capitán)\n\n`

    txt += `📋 *Comandos del Partner*\n`
    txt += `├ \`${prefix}ver_socio\` — Revisa el estado de partner\n`
    txt += `├ \`${prefix}ver_premium\` — Revisa el estado premium\n`
    txt += `├ \`${prefix}ver_dueno\` — Revisa el rol del usuario\n`
    txt += `└ \`${prefix}lista_socios\` — Lista de partners\n\n`

    txt += `> _Contacta al capitán para más información_`

    await m.reply(txt)
}

export { pluginConfig as config, handler }
