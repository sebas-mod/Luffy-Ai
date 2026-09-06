import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/luffy-error.js'

function getApiKey() {
  return (
    config.downloader?.spotifySearchKey ||
    config.downloader?.apiKey ||
    'sebasapi2024'
  )
}

async function fetchLyricsYosoyyo(judul) {
  const res = await axios.get(
    `https://api-yosoyyo-api-ofc.onrender.com/api/lyrics?q=${encodeURIComponent(judul)}&apiKey=${encodeURIComponent(getApiKey())}`,
    { timeout: 35000 },
  )
  const d = res.data
  if (d?.status && d?.result && d.result.lyrics) {
    return {
      title: d.result.title || judul,
      artist: d.result.artist || 'Desconocido',
      lyricsText: d.result.lyrics,
      thumbnail: d.result.thumbnail,
    }
  }
  return null
}

async function fetchLyricsNexray(judul) {
  const res = await axios.get(
    `https://api.nexray.eu.cc/search/lyrics?q=${encodeURIComponent(judul)}`,
    { timeout: 35000 },
  )
  const data = res.data
  if (data?.status && data?.result) {
    const r = data.result
    if (r.lyrics?.plain_lyrics) {
      return {
        title: r.title || judul,
        artist: r.artist || r.lyrics.artist_name || 'Desconocido',
        lyricsText: r.lyrics.plain_lyrics,
        thumbnail: r.thumbnail,
      }
    }
  }
  return null
}

async function fetchLyrics(judul) {
  try {
    const y = await fetchLyricsYosoyyo(judul)
    if (y) return y
  } catch (e) {
    console.error('[Lyrics] yosoyyo:', e.message)
  }
  try {
    const n = await fetchLyricsNexray(judul)
    if (n) return n
  } catch (e) {
    console.error('[Lyrics] nexray:', e.message)
  }
  return null
}

const pluginConfig = {
    name: 'letra',
    alias: ['lyric', 'lyrics', 'liriklagu', 'lyricsfinder'],
    category: 'search',
    description: 'Buscar letras de canciones',
    usage: '.letra <query>',
    example: '.letra bohemian rhapsody',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const query = m.text?.trim()
    
    if (!query) {
        return m.reply(
            `☽◯☾ ╭ ♰ 🎶 ♰ ━╮ ☽◯☾\n☽◯☾ ♰ ¡Hola! ✨ ¿Olvidaste escribir el título de la canción? 😅\n──────────\n☽◯☾ ♰ Intenta escribir el comando así: *${m.prefix}letra bohemian rhapsody* 🎶\n──────────\n☽◯☾ ♰ ¡Escribe el título para que podamos cantar juntos! 🎤🔥\n╰━━━━━╯`
        )
    }
    
    m.react('🔍')
    
    try {
        const data = await fetchLyrics(query)
        
        if (!data || !data.lyricsText) {
            m.react('❌')
            return m.reply(`☽◯☾ ♰ Vaya, lo siento mucho 🥺 la letra de *${query}* no fue encontrada en la base de datos. ¡Intenta con una palabra clave o un título más específico! 💔`)
        }
        
        const title = data.title || query
        const artist = data.artist || 'Desconocido'
        const lyricsText = data.lyricsText
        
        const texts = `¡Encontré la letra! 🎉\n\n` +
                      `🎵 *Título:* ${title}\n` +
                      `🎤 *Artista:* ${artist}\n\n` +
                      `Aquí tienes la letra completa:\n\n` +
                      `${lyricsText}\n\n` +
                      `¡A cantar a todo pulmón! 🎧💖`
                      
        if (data.thumbnail && data.thumbnail !== '-') {
            await sock.sendMessage(m.chat, {
                image: { url: data.thumbnail },
                caption: texts
            }, { quoted: m })
        } else {
            await m.reply(texts)
        }
        
        m.react('✅')
        
    } catch (error) {
        m.react('☢')
        m.reply(`☽◯☾ ♰ Ay, el servidor de letras está de malas 😭 ¡Inténtalo de nuevo más tarde! 🛠️✨`)
    }
}

export { pluginConfig as config, handler }