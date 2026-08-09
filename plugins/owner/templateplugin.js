import config from '../../config.js'
const pluginConfig = {
    name: 'templateplugin',
    alias: ['tplplugin', 'plugin-template'],
    category: 'owner',
    description: 'Generar plantilla de plugin (Solo Owner)',
    usage: '.templateplugin',
    example: '.templateplugin',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    carne: 0,
    isEnabled: true
}
function handler(m, { sock }) {
    const template = `
const pluginConfig = {
    name: 'example',
    alias: ['ex'],
    category: 'general',
    description: 'Plugin de ejemplo',
    usage: '.example',
    example: '.example',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 1,
    isEnabled: true
}
async function handler(m, { sock }) {
    try {
        await m.reply('Este es un plugin de ejemplo!')
    } catch (error) {
        console.error('Error en el plugin de ejemplo:', error)
        await m.reply('❌ *FALLIDO*\\n\\n> ' + error.message)
    }
}
export { pluginConfig as config, handler }
`
    m.reply(`\`\`\`${template}\`\`\``)
}
export { pluginConfig as config, handler }