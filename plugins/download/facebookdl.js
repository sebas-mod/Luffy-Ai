import { fbdown } from '../../src/scraper/fbdown.js'
import config from '../../config.js'
import te from '../../src/lib/luffy-error.js'
import { card, fail, usage, progressChain } from '../../src/lib/luffy-dl-ui.js'
import { trackStats, getDlConfig, trySources, sendWithLinkButton } from '../../src/lib/luffy-dl-core.js'

const pluginConfig = {
    name: 'facebookdl',
    alias: ['fbdown', 'fb', 'facebook', 'fbdl'],
    category: 'download',
    description: 'Descarga videos de Facebook',
    usage: '.facebookdl <url>',
    example: '.facebookdl https://www.facebook.com/watch?v=xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 1,
    isEnabled: true
}

function normalizeYosoyyo(result) {
    const links = result?.links || {}
    const items = []
    for (const [quality, url] of Object.entries(links)) {
        if (url && (String(url).startsWith('http'))) {
            items.push({ quality, url })
        }
    }
    if (result?.url && String(result.url).startsWith('http')) {
        items.push({ quality: 'SD', url: result.url })
    }
    return {
        status: items.length > 0,
        items,
        title: result?.title || 'Video de Facebook',
        thumbnail: result?.thumbnail || null,
        author: result?.author?.name || '',
        duration: result?.duration || null,
    }
}

async function getFacebookMedia(url) {
    const sources = getDlConfig()?.facebook?.sources || [
        'https://api-yosoyyo-api-ofc.onrender.com/api/facebook?url={url}&apiKey={key}',
    ]

    try {
        const { picked } = await trySources(
            sources,
            {
                url,
                key: config.downloader?.spotifySearchKey || 'sebasapi2024',
            },
            (d) => {
                if (!d?.status || !d?.result) return false
                const norm = normalizeYosoyyo(d.result)
                if (!norm.status) return false
                return norm
            },
            { timeout: 45000 },
        )
        if (picked?.status) {
            return { source: 'yosoyyo', ...picked }
        }
    } catch {
        // fallback al scraper anterior
    }

    try {
        const data = await fbdown(url)
        if (data?.status && data.result?.medias?.length) {
            let video = data.result.medias.find(m => m.quality === 'hd') ||
                        data.result.medias.find(m => m.quality === 'sd') ||
                        data.result.medias[0]
            if (video?.url) {
                return {
                    source: 'azbry',
                    status: true,
                    items: [{ quality: video.quality || 'Normal', url: video.url }],
                    title: data.result.title || 'Video de Facebook',
                    duration: video.formattedSize ? { formattedSize: video.formattedSize } : null,
                }
            }
        }
    } catch {
        // ignore
    }

    return null
}

async function handler(m, { sock }) {
    const url = m.text?.trim()

    if (!url) {
        return m.reply(
            `🎥 *𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞*\n──────────\n` +
            `> Descarga videos de Facebook en alta calidad\n\n` +
            usage(m.prefix, 'facebookdl', 'https://www.facebook.com/watch?v=xxx')
        )
    }

    if (!url.match(/facebook\.com|fb\.watch|fb\.com/i)) {
        m.react('❌')
        return m.reply(fail('FACEBOOK', 'URL no válida. Usa un enlace de Facebook.'))
    }

    await progressChain(sock, m, ['🕕', '🎥'])

    try {
        const data = await getFacebookMedia(url)

        if (!data?.status || !data.items?.length) {
            await m.react('❌')
            return m.reply(fail('FACEBOOK', 'Error al obtener el video. Prueba con otro enlace o asegúrate de que la publicación sea pública.') + `\n☽◯☾ ♰ _Nota: El sistema aún no soporta descargar fotos de Facebook, solo videos._`)
        }

        // HD first, else SD, else first
        const video = data.items.find(i => /hd|1080|720/i.test(i.quality)) ||
                      data.items.find(i => /sd/i.test(i.quality)) ||
                      data.items[0]

        if (!video?.url) {
            await m.react('❌')
            return m.reply(fail('FACEBOOK', 'No se encontró ningún video en ese enlace.') + `\n☽◯☾ ♰ _Nota: El sistema aún no soporta descargar fotos de Facebook, solo videos._`)
        }

        let caption = card({
            emoji: '🎥',
            title: '𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞',
            fields: [
                ['Título', data.title || 'Video de Facebook'],
                ['Calidad', video.quality ? video.quality.toUpperCase() : 'Normal'],
                ['Autor', data.author || '—'],
            ],
            footer: config.downloader?.footer || '⚓ Luffy-Ai Downloader',
        })

        try {
            await sock.sendMedia(m.chat, video.url, caption, m, {
                type: 'video',
                contextInfo: {
                    forwardingScore: 99,
                    isForwarded: true
                }
            })
        } catch (sendErr) {
            await sendWithLinkButton(sock, m.chat, m, {
                caption,
                url: video.url,
                buttonText: '🎬 Ver / Descargar Video',
            })
        }

        trackStats('facebook')
        await m.react('✅')
    } catch (err) {
        await m.react('❌')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }