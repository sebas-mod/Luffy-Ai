import config from '../../config.js'
function te(prefix, command, pushName) {
    const tpl = config.errorTemplate || `☢ *ᴇʀʀᴏʀ*\n\n> Ocurrió un error en el comando \`{prefix}{command}\`\n> Inténtalo de nuevo más tarde, {pushName}\n\n_Si el problema continúa, contacta al owner_`
    return tpl
        .replace(/\{prefix\}/g, prefix || '.')
        .replace(/\{command\}/g, command || '?')
        .replace(/\{pushName\}/g, pushName || 'User')
}

export default te