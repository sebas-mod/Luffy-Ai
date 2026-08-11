import axios from 'axios'
import te from '../../src/lib/luffy-error.js'

async function fetchLyrics(judul) {
  try {
    const res = await axios.get(`https://api.nexray.eu.cc/search/lyrics?q=${encodeURIComponent(judul)}`)
    if (res.data && res.data.status && res.data.result) {
      return res.data.result
    }
    return null
  } catch (error) {
    return null
  }
}

const pluginConfig = {
    name: 'letra',
    alias: ['lyric', 'lyrics', 'liriklagu'],
    category: 'search',
    description: 'Buscar letras de canciones',
    usage: '.lirik <query>',
    example: '.lirik sempurna',
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
            `¡Hola! ✨ ¿Olvidaste escribir el título de la canción? 😅\n\n` +
            `Intenta escribir el comando así: *${m.prefix}letra sempurna andra and the backbone* 🎶\n\n` +
            `¡Escribe el título para que podamos cantar juntos! 🎤🔥`
        )
    }
    
    m.react('🔍')
    
    try {
        const data = await fetchLyrics(query)
        
        if (!data || !data.lyrics || !data.lyrics.plain_lyrics) {
            m.react('❌')
            return m.reply(`Vaya, lo siento mucho 🥺 la letra de *${query}* no fue encontrada en la base de datos. ¡Intenta con una palabra clave o un título más específico! 💔`)
        }
        
        const title = data.title || query
        const artist = data.artist || data.lyrics.artist_name || 'Desconocido'
        const lyricsText = data.lyrics.plain_lyrics
        
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
        m.reply(`Ay, el servidor de letras está de malas 😭 ¡Inténtalo de nuevo más tarde! 🛠️✨`)
    }
}

export { pluginConfig as config, handler }