import config from '../../config.js'
import path from 'path'
import fs from 'fs'
import te from '../../src/lib/luffy-error.js'
import { card, fail, usage } from '../../src/lib/luffy-dl-ui.js'
const pluginConfig = {
    name: 'githubdl',
    alias: ['gitdl', 'gitclone', 'repodownload'],
    category: 'download',
    description: 'Descarga repositorios de GitHub como ZIP',
    usage: '.githubdl <user> <repo> <branch>',
    example: '.githubdl niceplugin NiceBot main',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    let username, repo, branch
    
    if (args[0]?.includes('github.com')) {
        const urlMatch = args[0].match(/github\.com\/([^\/]+)\/([^\/]+)/i)
        if (urlMatch) {
            username = urlMatch[1]
            repo = urlMatch[2].replace(/\.git$/, '')
            branch = args[1] || 'main'
        }
    } else {
        username = args[0]
        repo = args[1]
        branch = args[2] || 'main'
    }
    
    if (!username) {
        return m.reply(
            `🐙 *𝗚𝗜𝗧𝗛𝗨𝗕 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔* 🐙\n──────────\n` +
            `> Descarga cualquier repositorio de *GitHub* como ZIP.\n\n` +
            usage(m.prefix, m.command, 'niceplugin NiceBot main') + '\n' +
            `╰┈➤ O usa la URL completa: *${m.prefix}githubdl https://github.com/user/repo*`
        )
    }
    
    if (!repo) {
        return m.reply(fail('GITHUB', 'Se requiere el nombre del repositorio.'))
    }
    
    await m.react('🕕')

    try {
        const repoInfo = await fetch(`https://api.github.com/repos/${username}/${repo}`)
        
        if (!repoInfo.ok) {
            await m.react('❌')
            return m.reply(fail('GITHUB', `\`${username}/${repo}\` no existe.`))
        }
        
        const repoData = await repoInfo.json()
        const defaultBranch = repoData.default_branch || 'main'
        branch = branch || defaultBranch
        
        const zipUrl = `https://github.com/${username}/${repo}/archive/refs/heads/${branch}.zip`
        
        const checkRes = await fetch(zipUrl, { method: 'HEAD' })
        if (!checkRes.ok) {
            await m.react('❌')
            return m.reply(fail('GITHUB', `La rama \`${branch}\` no se encontró. Default: \`${defaultBranch}\`.`))
        }

        const caption = card({
            emoji: '🐙',
            title: '𝗚𝗜𝗧𝗛𝗨𝗕',
            fields: [
                ['Repositorio', `${username}/${repo}`],
                ['Rama', `${branch}`],
                ['Descripción', repoData.description],
                ['Estrellas', repoData.stargazers_count],
                ['Lenguaje', repoData.language],
                ['Licencia', repoData.license?.spdx_id],
                ['Creado', repoData.created_at?.slice(0, 10)],
            ],
            footer: 'ZIP listo, ¡disfruta el código! 🚀',
        })
        
        await sock.sendMedia(m.chat, zipUrl, caption, m, {
            type: 'document',
            fileName: `${repo} - ${branch}.zip`,
            mimetype: 'application/zip',
            contextInfo: {
                forwardingScore: 99,
                isForwarded: true
            }
        })
        
        await m.react('✅')
        
    } catch (e) {
        await m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }