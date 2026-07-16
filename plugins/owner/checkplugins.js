import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

const pluginConfig = {
    name: 'checkplugins',
    alias: ['checkplugin', 'cekplugin', 'cekplugins'],
    category: 'owner',
    description: 'Verifica todos los plugins en busca de errores de carga',
    usage: '.checkplugins',
    example: '.checkplugins',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    m.react('🕐')

    const pluginsDir = path.join(process.cwd(), 'plugins')
    const results = { ok: [], fail: [] }

    function getFiles(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        let files = []
        for (const entry of entries) {
            const full = path.join(dir, entry.name)
            if (entry.isDirectory()) {
                files = files.concat(getFiles(full))
            } else if (entry.name.endsWith('.js') && entry.name !== '_index.js') {
                files.push(full)
            }
        }
        return files
    }

    const allFiles = getFiles(pluginsDir)

    for (const filePath of allFiles) {
        const relative = path.relative(pluginsDir, filePath)
        try {
            const fileUrl = pathToFileURL(path.resolve(filePath)).href + '?t=' + Date.now()
            const mod = await import(fileUrl)

            let plugin = mod
            if (!plugin.config || !plugin.handler) {
                if (mod.default) plugin = mod.default
            }

            const issues = []

            if (!plugin.config) {
                issues.push('Sin pluginConfig')
            } else {
                if (!plugin.config.name) issues.push('Sin name')
                if (!plugin.config.category) issues.push('Sin category')
                if (!plugin.config.alias || (Array.isArray(plugin.config.alias) && plugin.config.alias.length === 0)) {
                    issues.push('Sin alias')
                }
            }

            if (!plugin.handler || typeof plugin.handler !== 'function') {
                issues.push('Sin handler válido')
            }

            if (issues.length > 0) {
                results.fail.push({ file: relative, issues })
            } else {
                results.ok.push(relative)
            }
        } catch (err) {
            results.fail.push({ file: relative, issues: [err.message] })
        }
    }

    let txt = `🔍 REVISIÓN DE PLUGINS\n`
    txt += `Total: ${allFiles.length} | OK: ${results.ok.length} | Errores: ${results.fail.length}\n`

    if (results.fail.length > 0) {
        txt += `\n❌ ERRORES:\n`
        for (const f of results.fail) {
            txt += `\n${f.file}\n`
            for (const issue of f.issues) {
                txt += `  → ${issue}\n`
            }
        }
    } else {
        txt += `\n✅ Todos los plugins OK`
    }

    if (txt.length > 4000) {
        const chunks = txt.match(/.{1,4000}/gs)
        for (const chunk of chunks) {
            await m.reply(chunk)
        }
    } else {
        await m.reply(txt)
    }

    m.react('✅')
}

export { pluginConfig as config, handler }
