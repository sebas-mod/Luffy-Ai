import { loadSent, saveSent, loadState, saveState, getOngoingAnimeList, startAutoCheck, stopAutoCheck, runCheck, isRunning } from '../../src/lib/luffy-auto-anime.js'
import config from '../../config.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'autoanimewinbu',
    alias: ['aaw', 'autoanime'],
    category: 'anime',
    description: 'Auto subida de anime & donghua en curso de winbu.net (720p Pixeldrain)',
    usage: '.autoanimewinbu <start|stop|status|verificar|list|reset|addgrup|delgrup>',
    example: '.autoanimewinbu start',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock, args }) {
    const sub = m.text
    const state = loadState()


    switch (sub) {
        case 'start': {
            if (isRunning()) {
                return m.reply(`⚠️ ¡AutoAnime ya está en marcha!`)
            }

            const groups = state.groups || []
            if (groups.length === 0) {
                return m.reply(
                    `❌ ¡Aún no hay grupo objetivo!\n\n` +
                    `> Agrega un grupo primero:\n` +
                    `> \`${m.prefix}autoanimewinbu addgrup\` (di grup target)\n` +
                    `> \`${m.prefix}autoanimewinbu addgrup 120363xxx@g.us\``
                )
            }

            const interval = state.interval || 5
            startAutoCheck(sock, interval)
            saveState({ ...state, enabled: true })

            return sock.sendMessage(m.chat, {
                text: `✅ *ᴀᴜᴛᴏ ᴀɴɪᴍᴇ sᴛᴀʀᴛᴇᴅ*\n\n` +
                    `> 📲 Grupo objetivo: *${groups.length}*\n` +
                    `> ⏱️ Intervalo: *${interval} min*\n` +
                    `> 🎞️ Filter: *Pixeldrain 720p+*\n` +
                    `> ⏰ Edad máxima: *24 h*\n\n` +
                    `La primera verificación está comenzando...`,
                interactiveButtons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📊 Status',
                            id: `${m.prefix}autoanimewinbu status`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🛑 Stop',
                            id: `${m.prefix}autoanimewinbu stop`
                        })
                    }
                ]
            }, { quoted: m })
        }

        case 'stop': {
            stopAutoCheck()
            saveState({ ...state, enabled: false })
            return m.reply(`🛑 *AutoAnime detenido*`)
        }

        case 'status': {
            const sent = loadSent()
            const running = isRunning()
            const groups = state.groups || []

            let txt = `📊 *ᴀᴜᴛᴏ ᴀɴɪᴍᴇ sᴛᴀᴛᴜs*\n\n`
            txt += `> 🔄 Status: *${running ? '🟢 ON' : '🔴 OFF'}*\n`
            txt += `> 💾 Auto-inicio: *${state.enabled ? 'Sí' : 'No'}*\n`
            txt += `> 📋 Ya enviados: *${sent.size}* episodios\n`
            txt += `> ⏱️ Intervalo: *${state.interval || 5} min*\n`
            txt += `> 📲 Grupo objetivo: *${groups.length}*\n`

            if (groups.length > 0) {
                txt += `\n*Grupos:*\n`
                groups.forEach((g, i) => {
                    txt += `> ${i + 1}. \`${g}\`\n`
                })
            }

            return sock.sendMessage(m.chat, { text: txt }, { quoted: m })
        }

        case 'verificar':
        case 'check': {
            if (!isRunning()) {
                startAutoCheck(sock, state.interval || 5)
            }
            await m.reply('🔍 Buscando anime recientes...')
            try {
                await runCheck()
                return m.reply('✅ Verificación completada')
            } catch (e) {
                m.reply(te(m.prefix, m.command, m.pushName))
            }
        }

        case 'list': {
            await m.reply('📺 Obteniendo la lista de anime...')
            try {
                const list = await getOngoingAnimeList()
                if (list.length === 0) return m.reply('❌ No se encontraron animes')

                let txt = `📺 *ʟɪꜱᴛᴀ ᴅᴇ ᴀɴɪᴍᴇ ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴀ*\n\n`
                txt += `> Total: *${list.length}* anime\n\n`
                list.slice(0, 15).forEach((a, i) => {
                    txt += `*${i + 1}.* ${a.title}\n`
                })
                if (list.length > 15) txt += `\n> ...y ${list.length - 15} más`

                return sock.sendMessage(m.chat, { text: txt }, { quoted: m })
            } catch (e) {
                m.reply(te(m.prefix, m.command, m.pushName))
            }
        }

        case 'reset': {
            const sent = loadSent()
            const count = sent.size
            saveSent(new Set())
            return m.reply(`✅ ¡Reinicio! *${count}* episodios eliminados del historial.\n> Todos los episodios pueden volver a enviarse.`)
        }

        case 'addgrup':
        case 'addgroup': {
            const rest = (typeof args === 'string' ? args : '').replace(/^(addgrup|addgroup)\s*/i, '').trim()
            let grupId = rest

            if (!grupId && m.isGroup) {
                grupId = m.chat
            }

            if (!grupId || !grupId.includes('@g.us')) {
                return m.reply(
                    `❌ ID de grupo no válido\n\n` +
                    `> Úsalo dentro de un grupo, o:\n` +
                    `> \`${m.prefix}autoanimewinbu addgrup 120363xxx@g.us\``
                )
            }

            const groups = state.groups || []
            if (groups.includes(grupId)) {
                return m.reply(`⚠️ El grupo ya está en la lista de objetivos`)
            }

            groups.push(grupId)
            saveState({ ...state, groups })
            return m.reply(`✅ Grupo \`${grupId}\` agregado al objetivo\n> Total: *${groups.length}* grupos`)
        }

        case 'delgrup':
        case 'delgroup': {
            const rest = (typeof args === 'string' ? args : '').replace(/^(delgrup|delgroup)\s*/i, '').trim()
            let grupId = rest

            if (!grupId && m.isGroup) {
                grupId = m.chat
            }

            const groups = state.groups || []
            const idx = groups.indexOf(grupId)
            if (idx === -1) {
                return m.reply(`❌ Grupo no encontrado en la lista de objetivos`)
            }

            groups.splice(idx, 1)
            saveState({ ...state, groups })
            return m.reply(`✅ Grupo \`${grupId}\` eliminado del objetivo\n> Restantes: *${groups.length}* grupos`)
        }

        case 'interval': {
            const rest = (typeof args === 'string' ? args : '').replace(/^interval\s*/i, '').trim()
            const mins = parseInt(rest)
            if (!mins || mins < 1 || mins > 60) {
                return m.reply(`❌ El intervalo debe ser de 1-60 minutos\n\n> Ejemplo: \`${m.prefix}autoanimewinbu interval 10\``)
            }

            saveState({ ...state, interval: mins })

            if (isRunning()) {
                stopAutoCheck()
                startAutoCheck(sock, mins)
            }

            return m.reply(`✅ Intervalo cambiado a *${mins} min*`)
        }

        default: {
            const running = isRunning()
            return sock.sendMessage(m.chat, {
                text: `🎬 *ᴀᴜᴛᴏ ᴀɴɪᴍᴇ ᴡɪɴʙᴜ*\n\n` +
                    `> Status: *${running ? '🟢 ON' : '🔴 OFF'}*\n\n` +
                    `*ᴄᴏᴍᴍᴀɴᴅs:*\n` +
                    `> \`${m.prefix}aaw start\` — Iniciar auto-check\n` +
                    `> \`${m.prefix}aaw stop\` — Detener\n` +
                    `> \`${m.prefix}aaw status\` — Ver estado\n` +
                        `> \`${m.prefix}aaw verificar\` — Verificación manual ahora\n` +
                    `> \`${m.prefix}aaw list\` — Lista de anime recientes\n` +
                    `> \`${m.prefix}aaw addgrup\` — Agregar grupo objetivo\n` +
                    `> \`${m.prefix}aaw delgrup\` — Eliminar grupo objetivo\n` +
                    `> \`${m.prefix}aaw interval 10\` — Cambiar intervalo\n` +
                    `> \`${m.prefix}aaw reset\` — Reiniciar historial de envíos`,
                interactiveButtons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: running ? '🛑 Stop' : '▶️ Start',
                            id: `${m.prefix}autoanimewinbu ${running ? 'stop' : 'start'}`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📊 Status',
                            id: `${m.prefix}autoanimewinbu status`
                        })
                    }
                ]
            }, { quoted: m })
        }
    }
}

export { pluginConfig as config, handler }