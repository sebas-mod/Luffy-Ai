import fs from "fs"
import path from "path"
import axios from "axios"
import { getDatabase } from "../../src/lib/ourin-database.js"
import te from "../../src/lib/ourin-error.js"
import { prepareWAMessageMedia, generateWAMessageFromContent } from "ourin"

const NSFW_DATA_DIR = path.join(process.cwd(), "src", "data", "nsfw")

const jsonCache = new Map()

function loadJsonUrls(filename) {
  if (jsonCache.has(filename)) return jsonCache.get(filename)
  try {
    const filePath = path.join(NSFW_DATA_DIR, filename)
    if (!fs.existsSync(filePath)) return []
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))
    if (Array.isArray(data) && data.length > 0) {
      jsonCache.set(filename, data)
      return data
    }
    return []
  } catch {
    return []
  }
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const JSON_CATEGORIES = {
  ass: { file: "ass.json", emoji: "🍑", label: "Ass Anime" },
  bdsm: { file: "bdsm.json", emoji: "⛓️", label: "BDSM Anime" },
  cum: { file: "cum.json", emoji: "💦", label: "Cum Anime" },
  gangbang: { file: "gangbang.json", emoji: "👥", label: "Gangbang Anime" },
  hentai: { file: "hentai.json", emoji: "🔞", label: "Hentai" },
  kasedaiki: { file: "kasedaiki.json", emoji: "🎎", label: "Kasedaiki" },
  manstrubation: { file: "manstrubation.json", emoji: "✋", label: "Manstrubation Anime" },
  opaianime: { file: "opaianime.json", emoji: "🍈", label: "Oppai Anime" },
}

const API_CATEGORIES = {
  blowjob: { endpoint: "blowjob", emoji: "👄", label: "Blowjob Anime" },
  neko: { endpoint: "neko", emoji: "🐱", label: "Neko NSFW" },
  trap: { endpoint: "trap", emoji: "🎭", label: "Trap Anime" },
  waifunsfw: { endpoint: "waifu", emoji: "💕", label: "Waifu NSFW" },
}

const ALL_COMMANDS = [
  ...Object.keys(JSON_CATEGORIES),
  ...Object.keys(API_CATEGORIES),
  "nsfw",
  "nsfwon",
  "nsfwoff",
  "nsfwmenu",
]

const pluginConfig = {
  name: ALL_COMMANDS,
  alias: ["oppai", "oppaianimee"],
  category: "nsfw",
  description: "Colección de imágenes NSFW anime de varias categorías (Solo para 18+)",
  usage: ".nsfw atau .<kategori>",
  example: ".nsfw hentai",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 8,
  energi: 2,
  isEnabled: true,
}

async function fetchFromApi(endpoint) {
  const res = await axios.get(`https://api.waifu.pics/nsfw/${endpoint}`, { timeout: 15000 })
  if (!res.data?.url) throw new Error("No se pudo obtener la imagen de la API")
  const imgRes = await axios.get(res.data.url, { responseType: "arraybuffer", timeout: 30000 })
  return Buffer.from(imgRes.data)
}

async function fetchFromJson(filename) {
  const urls = loadJsonUrls(filename)
  if (urls.length === 0) throw new Error("Datos de imágenes vacíos o archivo no encontrado")
  const url = getRandomItem(urls)
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 })
  return Buffer.from(res.data)
}

function buildCategoryList(prefix) {
  let text = `🔞 *MENÚ NSFW*\n\n`
  text += `Colección de imágenes anime NSFW de varias categorías.\n`
  text += `Esta función es solo para usuarios mayores de *18 años*.\n\n`
  text += `*📂 CATEGORÍAS DISPONIBLES:*\n\n`

  text += `*— De la Base de Datos Local —*\n`
  for (const [cmd, info] of Object.entries(JSON_CATEGORIES)) {
    const count = loadJsonUrls(info.file).length
    text += `- ${info.emoji} *${prefix}${cmd}* — ${info.label} (${count} imágenes)\n`
  }

  text += `\n*— De la API en Línea —*\n`
  for (const [cmd, info] of Object.entries(API_CATEGORIES)) {
    text += `- ${info.emoji} *${prefix}${cmd}* — ${info.label}\n`
  }

  text += `\n*⚙️ CONFIGURACIÓN DEL GRUPO:*\n`
  text += `- *${prefix}nsfwon* — Activar función NSFW en este grupo\n`
  text += `- *${prefix}nsfwoff* — Desactivar función NSFW en este grupo\n`

  text += `\n*📌 NOTA IMPORTANTE:*\n`
  text += `- Esta función se puede usar directamente en el *chat privado* del bot\n`
  text += `- Para grupos, el admin debe activarla primero con *${prefix}nsfwon*\n`
  text += `- Úsala con responsabilidad y prudencia\n`
  text += `- Este contenido es solo para usuarios *18+*`

  return text
}

function isNsfwAllowed(m, db) {
  if (!m.isGroup) return true
  const groupData = db.getGroup(m.chat) || {}
  return groupData.nsfw === true
}

async function handler(m, { sock }) {
  const db = getDatabase()
  const cmd = m.command.toLowerCase()

  if (cmd === "nsfwon") {
    if (!m.isGroup) return m.reply(`❌ *Este comando es solo para grupos*\n\nLa función NSFW se puede usar directamente en el chat privado sin necesidad de activarla.`)
    if (!m.isAdmin && !m.isOwner) return m.reply(`❌ *Acceso Denegado*\n\nSolo los admins del grupo pueden activar o desactivar la función NSFW en este grupo.`)

    const groupData = db.getGroup(m.chat) || {}
    groupData.nsfw = true
    db.setGroup(m.chat, groupData)
    return m.reply(
      `✅ *NSFW ACTIVADO*\n\n` +
      `La función NSFW se ha activado correctamente para este grupo.\n\n` +
      `*Atención:*\n` +
      `- Asegúrate de que todos los miembros del grupo sean mayores de *18+*\n` +
      `- El admin es responsable del contenido que aparezca en el grupo\n` +
      `- Usa *${m.prefix}nsfwoff* para desactivarlo de nuevo\n\n` +
      `Escribe *${m.prefix}nsfw* para ver la lista de categorías disponibles.`
    )
  }

  if (cmd === "nsfwoff") {
    if (!m.isGroup) return m.reply(`❌ *Este comando es solo para grupos*\n\nEn el chat privado, la función NSFW siempre está disponible.`)
    if (!m.isAdmin && !m.isOwner) return m.reply(`❌ *Acceso Denegado*\n\nSolo los admins del grupo pueden activar o desactivar la función NSFW en este grupo.`)

    const groupData = db.getGroup(m.chat) || {}
    groupData.nsfw = false
    db.setGroup(m.chat, groupData)
    return m.reply(
      `✅ *NSFW DESACTIVADO*\n\n` +
      `La función NSFW se ha desactivado correctamente para este grupo.\n` +
      `Todos los comandos NSFW no se podrán usar aquí hasta que se reactive.`
    )
  }

  if (!isNsfwAllowed(m, db)) {
    return m.reply(
      `🔒 *FUNCIÓN NSFW NO ACTIVADA*\n\n` +
      `La función NSFW aún no está activada para este grupo.\n` +
      `Pide al admin del grupo que la active primero con el comando *${m.prefix}nsfwon*\n\n` +
      `O puedes usar esta función en el *chat privado* del bot directamente.`
    )
  }

  if (cmd === "nsfw" || cmd === "nsfwmenu") {
    const args = m.args
    if (args[0]) {
      const sub = args[0].toLowerCase()
      if (JSON_CATEGORIES[sub] || API_CATEGORIES[sub]) {
        return await sendNsfwImage(m, sock, sub)
      }
    }
    return m.reply(buildCategoryList(m.prefix))
  }

  if (JSON_CATEGORIES[cmd] || API_CATEGORIES[cmd]) {
    return await sendNsfwImage(m, sock, cmd)
  }

  return m.reply(buildCategoryList(m.prefix))
}

async function sendNsfwImage(m, sock, category) {
  await m.react("🕕")

  try {
    let buffer
    let info

    if (JSON_CATEGORIES[category]) {
      info = JSON_CATEGORIES[category]
      buffer = await fetchFromJson(info.file)
    } else if (API_CATEGORIES[category]) {
      info = API_CATEGORIES[category]
      buffer = await fetchFromApi(info.endpoint)
    } else {
      return m.reply(`❌ Categoría *${category}* no encontrada.`)
    }

    const media = await prepareWAMessageMedia(
      { image: buffer },
      { upload: sock.waUploadToServer }
    )

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          interactiveMessage: {
            body: { text: `${info.emoji} *${info.label.toUpperCase()}*` },
            footer: { text: "🔞 Este contenido es solo para 18+ — Úsalo con responsabilidad" },
            header: {
              hasMediaAttachment: true,
              imageMessage: media.imageMessage,
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: `${info.emoji} ¿Más?`,
                    id: `${m.prefix}${category}`,
                  }),
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "📂 Ver Todas las Categorías",
                    id: `${m.prefix}nsfw`,
                  }),
                },
              ],
            },
          },
        },
      },
    }, { quoted: m })

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await m.react("✅")
  } catch (err) {
    await m.react("☢")
    m.reply(te(m.prefix, m.command, m.pushName))
  }
}

export { pluginConfig as config, handler }
