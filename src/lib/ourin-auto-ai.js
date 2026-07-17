import { exec } from "child_process";
import { promisify } from "util";
import { chat as geminiChat } from "../scraper/geminiVision.js";
import { getDatabase } from "./ourin-database.js";
import { pinterest } from "btch-downloader";
import config from "../../config.js";
import axios from "axios";
import path from "path";
import fs from "fs";
const userCooldowns = new Map();
const COOLDOWN_MS = 3000;

const ACTION_REGEX = /\[ACTION\s*:\s*(\w+)(?:\s+([^\]]*))?\]/gi;

const SYSTEM_PROMPT_ACTIONS = `
Tienes una capacidad especial para ejecutar ACCIONES y enviar MENSAJES ENRIQUECIDOS en WhatsApp.
Si el usuario pide algo que coincida con una accion a continuacion, INCLUYE la etiqueta de accion al final de tu mensaje.
Si el contexto de tu respuesta coincide con un mensaje enriquecido, USA el formato de mensaje enriquecido a continuacion.

FORMATO DE ACCION (pon al final del mensaje, puede ser mas de una):
[ACTION:KICK target=628xxx@s.whatsapp.net]
[ACTION:ADD target=628xxx]
[ACTION:PROMOTE target=628xxx@s.whatsapp.net]
[ACTION:DEMOTE target=628xxx@s.whatsapp.net]
[ACTION:LEAVE]
[ACTION:OPEN]
[ACTION:CLOSE]
[ACTION:TAGALL]
[ACTION:HIDETAG message=mensaje que quieres enviar]
[ACTION:SETNAME name=nombre del grupo nuevo]
[ACTION:SETDESC desc=descripcion del grupo nuevo]
[ACTION:DELETE]
[ACTION:WARN target=628xxx@s.whatsapp.net]
[ACTION:STICKER]
[ACTION:ANTILINK mode=on]
[ACTION:PINS query=palabras clave de busqueda]

LISTA DE ACCIONES:
- KICK: Expulsar miembro del grupo. Requiere objetivo.
- ADD: Agregar miembro al grupo. Requiere numero (628xxx).
- PROMOTE: Hacer miembro administrador. Requiere objetivo.
- DEMOTE: Bajar administrador a miembro normal. Requiere objetivo.
- LEAVE: Bot sale de este grupo. SOLO si el owner lo solicita.
- OPEN: Abrir grupo para que todos los miembros puedan chatear.
- CLOSE: Cerrar grupo para que solo los administradores puedan chatear.
- TAGALL: Etiquetar/mencionar a todos los miembros del grupo de forma visible.
- HIDETAG: Enviar mensaje que menciona a todos los miembros pero la etiqueta esta oculta. Requiere message.
- SETNAME: Cambiar nombre del grupo. Requiere name.
- SETDESC: Cambiar descripcion del grupo. Requiere desc.
- DELETE: Eliminar mensaje del bot que el usuario respondio.
- WARN: Dar advertencia a un miembro. Requiere objetivo.
- STICKER: Convertir imagen enviada/respondida por el usuario en sticker.
- ANTILINK: Activar/desactivar anti-link en el grupo (on/off). Requiere mode.
- PINS: Buscar imagen en Pinterest. Requiere query de busqueda.

═══════════════════════════════════════
FORMATO DE MENSAJES ENRIQUECIDOS
═══════════════════════════════════════

PUEDES enviar mensajes enriquecidos (como Meta AI) usando etiquetas especiales.
Usa SOLO cuando el contexto sea apropiado. Si no es necesario, responde normalmente.

1. TABLA (cuando el usuario pide comparaciones, listas de datos, especificaciones):
[RICH:TABLE]
title: Titulo de la Tabla
header: Columna1 | Columna2 | Columna3
rows: Dato1 | Dato2 | Dato3;; Dato4 | Dato5 | Dato6
text: Breve explicacion antes de la tabla (opcional)
footer: Texto despues de la tabla (opcional)
[/RICH:TABLE]

Ejemplo: El usuario pregunta "compara Python vs JavaScript"
[RICH:TABLE]
title: Python vs JavaScript
header: Caracteristica | Python | JavaScript
rows: Tipo | Dinamico | Dinamico;; Paradigma | OOP, Funcional | Multi-paradigma;; Uso | Ciencia de Datos, AI | Web, Full-stack;; Rendimiento | Mas lento | Mas rapido (V8)
text: Aqui esta la comparacion:
footer: Espero que sea de ayuda!
[/RICH:TABLE]

2. BLOQUE DE CODIGO (cuando el usuario pide codigo, scripts, ejemplos de programa):
[RICH:CODE]
language: javascript
title: Ejemplo de Codigo
code: const greeting = "Hello World"
function sayHello(name) {
    return greeting + " " + name
}
console.log(sayHello("User"))
text: Aqui esta el ejemplo de codigo: (opcional)
footer: Powered by Ourin AI (opcional)
[/RICH:CODE]

Idiomas soportados: javascript (js, ts, typescript), python (py), go (golang), lua, bash (sh, shell)

3. ENLACE/EMBED EN LINEA (cuando el usuario pide enlaces de referencia, fuentes):
[RICH:LINK]
text: Mira el resultado aqui: {{IE_0}}Haz clic aqui{{/IE_0}} y {{IE_1}}Segundo enlace{{/IE_1}}
urls: https://example.com/1, https://example.com/2
displayNames: Nombre Enlace 1, Nombre Enlace 2
footer: Listo! (opcional)
[/RICH:LINK]

IMPORTANTE: text DEBE contener el placeholder {{IE_0}}...{{/IE_0}} para cada URL. displayNames es opcional, separados por coma.

4. LISTA (cuando el usuario pide info breve en formato de lista clave-valor):
[RICH:LIST]
title: Info del Bot
rows: Nombre | Ourin AI;; Version | 2.4.5;; Desarrollador | Zann
footer: © Ourin AI (opcional)
[/RICH:LIST]

5. STICKER (cuando el usuario pide sticker, o para expresar emociones):
[RICH:STICKER]
url: https://iili.io/BPBdFuj.md.jpg
packname: Ourin AI (opcional)
author: AutoAI (opcional)
[/RICH:STICKER]

STICKER PARA EXPRESAR EMOCIONES:
- Si estas molesto/enojado/frustrado: usa url https://iili.io/BPBdFuj.md.jpg
- Si estas sorprendido/asustado/confundido: usa url https://iili.io/BPBFwVR.jpg
- Si el mensaje del usuario es raro/absurdo/broma: usa url https://iili.io/BPBqKwg.md.jpg

Ejemplo: El usuario esta insistiendo y estas molesto
[RICH:STICKER]
url: https://iili.io/BPBdFuj.md.jpg
[/RICH:STICKER]

PUEDES enviar stickers de emociones junto con texto normal. Los stickers se envian por separado del texto.

═══════════════════════════════════════
CUANDO USAR MENSAJES ENRIQUECIDOS:
═══════════════════════════════════════
- TABLA: El usuario pide comparaciones, especificaciones, datos en columnas, horarios, rankings
- CODE: El usuario pide ejemplos de codigo, scripts, soluciones de programacion, depuracion
- LINK: El usuario pide referencias/enlaces, resultados de carga, fuentes de lectura
- LIST: El usuario pide info breve, perfil, detalles tecnicos en formato clave-valor
- STICKER: El usuario pide sticker, o quieres expresar una emocion (molesto, sorprendido, confundido)
- NO uses mensajes enriquecidos para: chat normal, saludos, preguntas simples, historias

REGLAS IMPORTANTES:
1. SOLO ejecuta una accion si el usuario la pide CLARAMENTE Y DE FORMA EXPLICITA.
2. Nunca ejecutes una accion solo basandote en suposiciones.
3. Si el usuario envia una imagen, analiza y describe la imagen en detalle.
4. Para KICK/PROMOTE/DEMOTE/WARN: usa el numero que el usuario etiqueto. Si el usuario etiqueta a alguien con @, toma ese numero.
5. No incluyas etiquetas de accion si no se solicitan.
6. Responde de forma natural y acorde al personaje.
7. PINS: Si el usuario pide que busque/envie una imagen sobre algo, usa esta accion.
8. HIDETAG: Usa esto cuando el usuario pide un anuncio a todos los miembros.
9. STICKER: Usa esto cuando el usuario pide convertir una imagen en sticker.
10. Puedes combinar varias acciones a la vez si se solicita.
11. Los mensajes enriquecidos y las acciones se pueden combinar. Ejemplo: responde con tabla e incluye [ACTION:PINS query=...] al final.
12. Nunca incluyas etiqueta de mensaje enriquecido Y texto normal para el mismo contenido. Elige uno.
13. Si usas [RICH:TABLE], [RICH:CODE], [RICH:LINK], o [RICH:LIST], no reescribas el contenido como texto normal.
14. STICKER se puede enviar JUNTO con texto normal. Ejemplo: envia sticker de molesto y escribe tu texto de queja.
15. Si el usuario envia un mensaje que te molesta/enoja, envia sticker de molesto (https://iili.io/BPBdFuj.md.jpg).
16. Si el usuario envia un mensaje sorprendente/que te asusta, envia sticker de sorpresa (https://iili.io/BPBFwVR.jpg).
17. Si el usuario envia un mensaje raro/absurdo/broma/sin sentido, envia sticker de confundido (https://iili.io/BPBqKwg.md.jpg).
`;

const fallbackResponses = [
  "Hmm, estoy pensando...",
  "Perdona, mi mente está en blanco un momento~",
  "Eh espera un momento, estoy cargando...",
  "Ayuda, mi cerebro tiene lag, ¡intenta de nuevo!",
  "Hmm qué será, dame un momento para pensar~",
];

function getFallbackResponse() {
  return fallbackResponses[
    Math.floor(Math.random() * fallbackResponses.length)
  ];
}

function isOnCooldown(userId) {
  const lastTime = userCooldowns.get(userId);
  if (!lastTime) return false;
  return Date.now() - lastTime < COOLDOWN_MS;
}

function setCooldown(userId) {
  userCooldowns.set(userId, Date.now());
}

function saveToHistory(autoai, senderNumber, role, content) {
  if (!autoai.sessions) autoai.sessions = {};
  if (!autoai.sessions[senderNumber]) {
    autoai.sessions[senderNumber] = { history: [] };
  }
  const history = autoai.sessions[senderNumber].history;
  history.push({
    role,
    content: content.substring(0, 500),
    timestamp: Date.now(),
  });
  if (history.length > 20) {
    autoai.sessions[senderNumber].history = history.slice(-20);
  }
}

function normalizeStructuredResponse(text) {
  let normalized = String(text || "")
    .replace(/\r\n?/g, "\n")
    .trim();

  normalized = normalized
    .replace(/^```(?:\w+)?\s*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .trim();

  normalized = normalized
    .replace(/\[\s*ACTION\s*:\s*(\w+)([^\]]*)\]/gi, (_, type, rest = "") => {
      return `[ACTION:${String(type || "").toUpperCase()}${rest}]`;
    })
    .replace(
      /\[\s*RICH\s*:\s*(TABLE|CODE|LINK|LIST|STICKER)\s*\]/gi,
      (_, type) => {
        return `[RICH:${String(type || "").toUpperCase()}]`;
      },
    )
    .replace(
      /\[\s*\/\s*RICH\s*:\s*(TABLE|CODE|LINK|LIST|STICKER)\s*\]/gi,
      (_, type) => {
        return `[/RICH:${String(type || "").toUpperCase()}]`;
      },
    );

  return normalized;
}

function parseActions(text) {
  const actions = [];
  let match;
  const regex = new RegExp(ACTION_REGEX.source, ACTION_REGEX.flags);
  while ((match = regex.exec(text)) !== null) {
    const type = match[1].toUpperCase();
    const paramsStr = match[2] || "";
    const params = {};
    const paramRegex = /(\w+)=(.+?)(?=\s+\w+=|$)/g;
    let pm;
    while ((pm = paramRegex.exec(paramsStr)) !== null) {
      params[pm[1]] = pm[2].trim();
    }
    actions.push({ type, params });
  }
  return actions;
}

function cleanActionTags(text) {
  return text.replace(ACTION_REGEX, "").trim();
}

function parseRichMessage(text) {
  const richRegex =
    /\[RICH\s*:\s*(TABLE|CODE|LINK|LIST|STICKER)\s*\]\s*([\s\S]*?)\[\/RICH\s*:\s*\1\s*\]/gi;
  const results = [];
  let match;
  while ((match = richRegex.exec(text)) !== null) {
    const type = match[1].toUpperCase();
    const body = match[2].trim();
    const data = {};

    if (type === "CODE") {
      const codeMatch = body.match(/^language:\s*(.+)$/m);
      if (codeMatch) data.language = codeMatch[1].trim();
      const titleMatch = body.match(/^title:\s*(.+)$/m);
      if (titleMatch) data.title = titleMatch[1].trim();
      const textMatch = body.match(/^text:\s*(.+)$/m);
      if (textMatch) data.text = textMatch[1].trim();
      const footerMatch = body.match(/^footer:\s*(.+)$/m);
      if (footerMatch) data.footer = footerMatch[1].trim();

      const codeStartMatch = body.match(/^code:\s*([\s\S]*)/m);
      if (codeStartMatch) {
        let codeContent = codeStartMatch[1];
        const otherKeys = ["language:", "title:", "text:", "footer:"];
        for (const key of otherKeys) {
          const idx = codeContent.indexOf("\n" + key);
          if (idx !== -1) {
            codeContent = codeContent.slice(0, idx);
          }
        }
        data.code = codeContent.trim();
      }
    } else {
      for (const line of body.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const colonIdx = trimmed.indexOf(":");
        if (colonIdx === -1) continue;
        const key = trimmed.slice(0, colonIdx).trim().toLowerCase();
        const val = trimmed.slice(colonIdx + 1).trim();
        data[key] = val;
      }
    }

    results.push({ type, data });
  }
  return results;
}

function cleanRichTags(text) {
  return text
    .replace(
      /\[RICH\s*:\s*(TABLE|CODE|LINK|LIST|STICKER)\s*\]\s*[\s\S]*?\[\/RICH\s*:\s*\1\s*\]/gi,
      "",
    )
    .trim();
}

async function sendRichMessage(rich, sock, jid, quoted) {
  try {
    if (rich.type === "TABLE") {
      const { title, header, rows, text, footer } = rich.data;
      if (!header || !rows) return false;

      const tableData = [title || "Table", header];
      const rowItems = rows.split(";;").map((r) => r.trim());
      for (const row of rowItems) {
        tableData.push(row);
      }

      await sock.sendTableV2(jid, tableData, quoted, {
        headerText: title || undefined,
        text: text || undefined,
        footer: footer || undefined,
      });
      return true;
    }

    if (rich.type === "CODE") {
      const { language, title, code, text, footer } = rich.data;
      if (!code) return false;

      await sock.sendCodeBlockV2(jid, code, quoted, {
        language: language || "javascript",
        title: title || undefined,
        text: text || undefined,
        footer: footer || undefined,
      });
      return true;
    }

    if (rich.type === "LINK") {
      const { text, urls, displayNames, footer } = rich.data;
      if (!text || !urls) return false;

      const urlList = urls
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);
      const nameList = displayNames
        ? displayNames.split(",").map((n) => n.trim())
        : [];
      const links = urlList.map((u, i) => ({
        url: u,
        displayName: nameList[i] || `Link ${i + 1}`,
        sourceDisplayName: nameList[i] || `Source ${i + 1}`,
        sourceSubtitle: "",
      }));
      await sock.sendLinkV2(jid, text, links, quoted, {
        footer: footer || undefined,
      });
      return true;
    }

    if (rich.type === "LIST") {
      const { title, rows, footer } = rich.data;
      if (!rows) return false;

      const listData = rows.split(";;").map((r) => {
        const parts = r
          .trim()
          .split("|")
          .map((p) => p.trim());
        return parts;
      });

      await sock.sendList(jid, title || "List", listData, quoted, {
        footer: footer || undefined,
      });
      return true;
    }

    if (rich.type === "STICKER") {
      let { url, packname, author } = rich.data;
      if (!url) return false;

      url = url.replace(/[`*_\[\]()]/g, "").trim();
      console.log("[AutoAI Sticker] Parsed url:", JSON.stringify(url));

      let stickerInput = url;
      if (/^https?:\/\//.test(url)) {
        try {
          const res = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: 30000,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });
          stickerInput = Buffer.from(res.data);
          console.log(
            "[AutoAI Sticker] Downloaded, size:",
            stickerInput.length,
          );
        } catch (e) {
          console.error("[AutoAI Sticker] Download failed:", e.message);
          return false;
        }
      } else {
        console.error(
          "[AutoAI Sticker] Invalid URL format:",
          JSON.stringify(url),
        );
        return false;
      }
      await sock.sendImageAsSticker(jid, stickerInput, quoted, {
        packname: packname || config.bot?.name || "Ourin AI",
        author: author || "AutoAI",
      });
      return true;
    }
  } catch (e) {
    console.error("[AutoAI RichMsg] Error:", e.message);
  }
  return false;
}

function detectIntentFromMessage(msg, m) {
  const lower = msg.toLowerCase();
  const actions = [];

  const phoneMatch = msg.match(/(?:\+?62|0)[\s\-]?8[\d\s\-]{7,13}/g);
  const extractPhone = () => {
    if (!phoneMatch) return null;
    return phoneMatch[0].replace(/[\s\-\+]/g, "").replace(/^0/, "62");
  };

  if (
    /\b(add|tambah|invite|masuk(?:kan|in))\b.*\b(nomor|number|member|orang)\b/i.test(
      lower,
    ) ||
    /\b(nomor|number)\b.*\b(add|tambah|invite)\b/i.test(lower)
  ) {
    const phone = extractPhone();
    if (phone) actions.push({ type: "ADD", params: { target: phone } });
  }

  if (
    /\b(kick|keluarkan|tendang|usir|remove)\b/i.test(lower) &&
    !actions.some((a) => a.type === "KICK")
  ) {
    actions.push({ type: "KICK", params: {} });
  }

  if (
    /\b(promote|jadikan?\s*admin|naikkan?)\b/i.test(lower) &&
    !actions.some((a) => a.type === "PROMOTE")
  ) {
    actions.push({ type: "PROMOTE", params: {} });
  }

  if (
    /\b(demote|turunkan?|copot\s*admin)\b/i.test(lower) &&
    !actions.some((a) => a.type === "DEMOTE")
  ) {
    actions.push({ type: "DEMOTE", params: {} });
  }

  if (
    /\b(leave|keluar|pergi)\b.*\b(grup|group)\b/i.test(lower) ||
    /\b(grup|group)\b.*\b(leave|keluar|pergi)\b/i.test(lower)
  ) {
    actions.push({ type: "LEAVE", params: {} });
  }

  if (
    /\b(buka|open)\b.*\b(grup|group)\b/i.test(lower) ||
    /\b(grup|group)\b.*\b(buka|open)\b/i.test(lower)
  ) {
    actions.push({ type: "OPEN", params: {} });
  }

  if (
    /\b(tutup|close|kunci|lock)\b.*\b(grup|group)\b/i.test(lower) ||
    /\b(grup|group)\b.*\b(tutup|close|kunci|lock)\b/i.test(lower)
  ) {
    actions.push({ type: "CLOSE", params: {} });
  }

  if (
    /\b(tag\s*all|tag\s*semua|mention\s*all|mention\s*semua)\b/i.test(lower)
  ) {
    actions.push({ type: "TAGALL", params: {} });
  }

  if (/\b(hidetag|hide\s*tag|announce|pengumuman|umumkan)\b/i.test(lower)) {
    const htMsg = msg
      .replace(/.*?(hidetag|hide\s*tag|announce|pengumuman|umumkan)\s*/i, "")
      .trim();
    actions.push({ type: "HIDETAG", params: { message: htMsg || msg } });
  }

  if (
    /\b(ganti|ubah|rename|set)\b.*\b(nama|name)\b.*\b(grup|group)\b/i.test(
      lower,
    )
  ) {
    const nameMatch = msg.match(/(?:jadi|ke|menjadi|:)\s*(.+)/i);
    if (nameMatch)
      actions.push({ type: "SETNAME", params: { name: nameMatch[1].trim() } });
  }

  if (/\b(ganti|ubah|set)\b.*\b(desk|desc|deskripsi)\b/i.test(lower)) {
    const descMatch = msg.match(/(?:jadi|ke|menjadi|:)\s*(.+)/i);
    if (descMatch)
      actions.push({ type: "SETDESC", params: { desc: descMatch[1].trim() } });
  }

  if (/\b(hapus|delete|remove)\b.*\b(pesan|chat|message)\b/i.test(lower)) {
    actions.push({ type: "DELETE", params: {} });
  }

  if (/\b(warn|warning|peringatan|peringati)\b/i.test(lower)) {
    actions.push({ type: "WARN", params: {} });
  }

  if (/\b(sticker|stiker|jadikan?\s*sticker|jadiin\s*sticker)\b/i.test(lower)) {
    actions.push({ type: "STICKER", params: {} });
  }

  if (/\b(antilink)\b.*\b(on|aktif|nyala)\b/i.test(lower)) {
    actions.push({ type: "ANTILINK", params: { mode: "on" } });
  } else if (/\b(antilink)\b.*\b(off|mati|nonaktif)\b/i.test(lower)) {
    actions.push({ type: "ANTILINK", params: { mode: "off" } });
  }

  if (
    /\b(cari(?:kan|in)?|kirim(?:kan|in)?|kasih|tolong)\b.*\b(gambar|foto|image|pic|picture)\b/i.test(
      lower,
    ) ||
    /\b(gambar|foto)\b.*\b(tentang|dari|soal)\b/i.test(lower)
  ) {
    const queryMatch =
      msg.match(
        /(?:gambar|foto|image|pic|picture)\s+(?:tentang\s+|dari\s+|soal\s+|yang\s+)?(.+)/i,
      ) ||
      msg.match(
        /(?:cari(?:kan|in)?|kirim(?:kan|in)?)\s+(?:gambar|foto)\s+(.+)/i,
      );
    if (queryMatch) {
      const query = queryMatch[1]
        .replace(/\b(dong|ya|yuk|pls|please|nih)\b/gi, "")
        .trim();
      if (query) actions.push({ type: "PINS", params: { query } });
    }
  }

  return actions;
}

function mergeActions(aiActions, intentActions) {
  const merged = [...aiActions];
  const existingTypes = new Set(aiActions.map((a) => a.type));
  for (const action of intentActions) {
    if (!existingTypes.has(action.type)) {
      merged.push(action);
    }
  }
  return merged;
}

async function executeAction(action, m, sock) {
  const results = [];

  const resolveTarget = () => {
    const botNum = sock.user?.id?.split(":")[0];
    if (m.mentionedJid?.length > 0) {
      return m.mentionedJid.find((j) => !j.includes(botNum));
    }
    const t = action.params.target;
    if (t && /^628\d+/.test(t.replace("@s.whatsapp.net", ""))) {
      return t.includes("@") ? t : t + "@s.whatsapp.net";
    }
    return null;
  };

  switch (action.type) {
    case "KICK": {
      if (!m.isGroup) return [{ ok: false, msg: "No está en grupo" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "No eres admin" }];
      if (!m.isBotAdmin) return [{ ok: false, msg: "El bot no es admin" }];
      const target = resolveTarget();
      if (!target) return [{ ok: false, msg: "Etiqueta a la persona que quieres expulsar" }];
      await sock.groupParticipantsUpdate(m.chat, [target], "remove");
      results.push({ ok: true, msg: `Expulsado exitosamente @${target.split("@")[0]}` });
      break;
    }
    case "PROMOTE": {
      if (!m.isGroup) return [{ ok: false, msg: "No está en grupo" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "No eres admin" }];
      if (!m.isBotAdmin) return [{ ok: false, msg: "El bot no es admin" }];
      const target = resolveTarget();
      if (!target) return [{ ok: false, msg: "Etiqueta a la persona que quieres promover" }];
      await sock.groupParticipantsUpdate(m.chat, [target], "promote");
      results.push({
        ok: true,
        msg: `Promovido exitosamente @${target.split("@")[0]}`,
      });
      break;
    }
    case "DEMOTE": {
      if (!m.isGroup) return [{ ok: false, msg: "No está en grupo" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "No eres admin" }];
      if (!m.isBotAdmin) return [{ ok: false, msg: "El bot no es admin" }];
      const target = resolveTarget();
      if (!target) return [{ ok: false, msg: "Etiqueta a la persona que quieres degradar" }];
      await sock.groupParticipantsUpdate(m.chat, [target], "demote");
      results.push({
        ok: true,
        msg: `Degradado exitosamente @${target.split("@")[0]}`,
      });
      break;
    }
    case "LEAVE": {
      if (!m.isOwner)
        return [{ ok: false, msg: "Solo el owner puede usar este comando" }];
      if (!m.isGroup) return [{ ok: false, msg: "No está en grupo" }];
      await sock.groupLeave(m.chat);
      results.push({ ok: true, msg: "Bot salió del grupo" });
      break;
    }
    case "OPEN": {
      if (!m.isGroup) return [{ ok: false, msg: "No está en grupo" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "No eres admin" }];
      if (!m.isBotAdmin) return [{ ok: false, msg: "El bot no es admin" }];
      await sock.groupSettingUpdate(m.chat, "not_announcement");
      results.push({ ok: true, msg: "Grupo abierto" });
      break;
    }
    case "CLOSE": {
      if (!m.isGroup) return [{ ok: false, msg: "No está en grupo" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "No eres admin" }];
      if (!m.isBotAdmin) return [{ ok: false, msg: "El bot no es admin" }];
      await sock.groupSettingUpdate(m.chat, "announcement");
      results.push({ ok: true, msg: "Grupo cerrado" });
      break;
    }
    case "TAGALL": {
      if (!m.isGroup) return [{ ok: false, msg: "No está en grupo" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "No eres admin" }];
      const groupMeta = m.groupMetadata || (await sock.groupMetadata(m.chat));
      const members = groupMeta.participants.map((p) => p.id);
      const mentions = members.map((id) => `@${id.split("@")[0]}`).join(" ");
      await sock.sendMessage(
        m.chat,
        {
          text: `📢 *TAG ALL*\n\n${mentions}`,
          mentions: members,
        },
        { quoted: m },
      );
      results.push({ ok: true, msg: "Todos los miembros etiquetados" });
      break;
    }
    case "PINS": {
      const query = action.params.query;
      if (!query)
        return [{ ok: false, msg: "Búsqueda no encontrada" }];
      try {
        const data = await pinterest(query);
        const pinResults = data?.result?.result?.result?.slice(0, 5);
        if (!pinResults || pinResults.length === 0) {
          return [{ ok: false, msg: `No se encontraron imágenes para: ${query}` }];
        }
        let imagenya = [];
        for (const item of pinResults) {
          const imageUrl =
            item.image_url ||
            item.images?.orig?.url ||
            item.images?.["736x"]?.url;
          if (!imageUrl) continue;
          try {
            imagenya.push({
              image: { url: imageUrl },
            });
          } catch {}
        }
        await sock.sendMessage(
          m.chat,
          {
            albumMessage: imagenya,
          },
          { quoted: m },
        );
        results.push({ ok: true, msg: `Enviando imágenes de Pinterest: ${query}` });
      } catch (e) {
        results.push({ ok: false, msg: `Error al buscar en Pinterest: ${e.message}` });
      }
      break;
    }
    case "ADD": {
      if (!m.isGroup) return [{ ok: false, msg: "No está en grupo" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "No eres admin" }];
      if (!m.isBotAdmin) return [{ ok: false, msg: "El bot no es admin" }];
      let num = action.params.target;
      if (!num)
        return [{ ok: false, msg: "Ingresa el número que quieres agregar" }];
      num = num.replace(/[^0-9]/g, "");
      if (num.startsWith("0")) num = "62" + num.slice(1);
      if (num.length < 10) return [{ ok: false, msg: "Número no válido" }];
      const jid = num + "@s.whatsapp.net";
      const addResult = await sock.groupParticipantsUpdate(
        m.chat,
        [jid],
        "add",
      );
      const status = addResult?.[0]?.status;
      if (status === "200") {
        results.push({ ok: true, msg: `Agregado exitosamente @${num}` });
      } else if (status === "408") {
        results.push({ ok: true, msg: `Invitación enviada a @${num}` });
      } else {
        results.push({
          ok: false,
          msg: `Error al agregar @${num} (${status})`,
        });
      }
      break;
    }
    case "HIDETAG": {
      if (!m.isGroup) return [{ ok: false, msg: "No está en grupo" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "No eres admin" }];
      const htMeta = m.groupMetadata || (await sock.groupMetadata(m.chat));
      const htMembers = htMeta.participants.map((p) => p.id);
      const htMsg = action.params.message || "Anuncio";
      await sock.sendMessage(
        m.chat,
        {
          text: htMsg,
          mentions: htMembers,
        },
        { quoted: m },
      );
      results.push({ ok: true, msg: "Hidetag enviado" });
      break;
    }
    case "SETNAME": {
      if (!m.isGroup) return [{ ok: false, msg: "No está en grupo" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "No eres admin" }];
      if (!m.isBotAdmin) return [{ ok: false, msg: "El bot no es admin" }];
      const newName = action.params.name;
      if (!newName)
        return [{ ok: false, msg: "Nuevo nombre del grupo no encontrado" }];
      await sock.groupUpdateSubject(m.chat, newName);
      results.push({ ok: true, msg: `Nombre del grupo cambiado a: ${newName}` });
      break;
    }
    case "SETDESC": {
      if (!m.isGroup) return [{ ok: false, msg: "No está en grupo" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "No eres admin" }];
      if (!m.isBotAdmin) return [{ ok: false, msg: "El bot no es admin" }];
      const newDesc = action.params.desc;
      if (!newDesc)
        return [{ ok: false, msg: "Nueva descripción no encontrada" }];
      await sock.groupUpdateDescription(m.chat, newDesc);
      results.push({ ok: true, msg: "Descripción del grupo cambiada" });
      break;
    }
    case "DELETE": {
      if (!m.quoted)
        return [{ ok: false, msg: "Responde al mensaje del bot que quieres eliminar" }];
      if (!m.quoted.key?.fromMe)
        return [{ ok: false, msg: "Solo se pueden eliminar mensajes del bot" }];
      await sock.sendMessage(m.chat, { delete: m.quoted.key });
      results.push({ ok: true, msg: "Mensaje eliminado" });
      break;
    }
    case "WARN": {
      if (!m.isGroup) return [{ ok: false, msg: "No está en grupo" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "No eres admin" }];
      const warnTarget = resolveTarget();
      if (!warnTarget)
        return [{ ok: false, msg: "Etiqueta a la persona que quieres advertir" }];
      const db = getDatabase();
      const warns = db.getGroup(m.chat)?.warns || {};
      const targetNum = warnTarget.split("@")[0];
      warns[targetNum] = (warns[targetNum] || 0) + 1;
      db.setGroup(m.chat, { warns });
      db.save();
      results.push({
        ok: true,
        msg: `⚠️ Advertencia ${warns[targetNum]}/3 para @${targetNum}`,
      });
      if (warns[targetNum] >= 3) {
        try {
          await sock.groupParticipantsUpdate(m.chat, [warnTarget], "remove");
          warns[targetNum] = 0;
          db.setGroup(m.chat, { warns });
          db.save();
          results.push({
            ok: true,
            msg: `@${targetNum} expulsado por 3 advertencias`,
          });
        } catch {}
      }
      break;
    }
    case "STICKER": {
      let stickerBuffer = null;
      if (m.isImage && m.download) {
        stickerBuffer = await m.download();
      } else if (m.quoted?.isImage && m.quoted?.download) {
        stickerBuffer = await m.quoted.download();
      }
      if (!stickerBuffer)
        return [
          { ok: false, msg: "Envía o responde con una imagen para convertirla en sticker" },
        ];
      await sock.sendMessage(
        m.chat,
        {
          sticker: stickerBuffer,
          packname: config.bot?.name || "Ourin",
          author: "AutoAI",
        },
        { quoted: m },
      );
      results.push({ ok: true, msg: "Sticker enviado" });
      break;
    }
    case "ANTILINK": {
      if (!m.isGroup) return [{ ok: false, msg: "No está en grupo" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "No eres admin" }];
      const alMode = (action.params.mode || "").toLowerCase();
      if (!["on", "off"].includes(alMode))
        return [{ ok: false, msg: "El modo debe estar activado o desactivado" }];
      const alDb = getDatabase();
      alDb.setGroup(m.chat, { antilink: alMode === "on" });
      alDb.save();
      results.push({
        ok: true,
        msg: `Antilink ${alMode === "on" ? "activado" : "desactivado"}`,
      });
      break;
    }
  }

  return results;
}

async function handleAutoAI(m, sock) {
  if (!m.isGroup) return false;
  if (m.fromMe) return false;

  const db = getDatabase();
  if (!db?.db?.data) return false;
  if (!db.db.data.autoai) db.db.data.autoai = {};
  if (!db.db.data.autoai_global) db.db.data.autoai_global = { enabled: false };

  let autoai = db.db.data.autoai[m.chat];
  let isGlobalMode = false;
  if (autoai && autoai.enabled) {
    // per-group config is active, use it
  } else if (autoai && autoai.enabled === false) {
    // explicit opt-out from global
    return false;
  } else {
    // no per-group config, check global
    const globalCfg = db.db.data.autoai_global;
    if (!globalCfg.enabled) return false;
    isGlobalMode = true;
    if (!globalCfg.sessions) globalCfg.sessions = {};
    autoai = {
      enabled: true,
      character: globalCfg.character || "global",
      characterName: globalCfg.characterName || "Global",
      instruction: globalCfg.instruction,
      responseType: globalCfg.responseType || "text",
      sessions: globalCfg.sessions,
    };
  }

  const botJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
  const botLid = sock.user?.lid || null;
  const botNumber = sock.user?.id?.split(":")[0] || "";
  const botFullId = sock.user?.id || "";

  if (m.isCommand && m.command === "autoai") return false;

  if (m.isCommand && !m.isOwner) {
    if (autoai.enableCommands) return false;
    return true;
  }

  const isMentioned = m.mentionedJid?.some((jid) => {
    if (!jid) return false;
    if (jid === botJid) return true;
    if (jid === botLid) return true;
    if (jid === botFullId) return true;
    if (jid.includes(botNumber)) return true;
    const jidUser = jid.split("@")[0]?.split(":")[0];
    if (jidUser && jidUser === botNumber) return true;
    return false;
  });

  let isBotQuoted = false;
  if (m.quoted) {
    const quotedSender = m.quoted.sender || m.quoted.key?.participant || "";
    const quotedFromMe = m.quoted.key?.fromMe;
    if (quotedSender === botJid) {
      isBotQuoted = true;
    } else if (quotedFromMe) {
      isBotQuoted = true;
    } else if (quotedSender === botFullId) {
      isBotQuoted = true;
    } else if (quotedSender.includes(botNumber)) {
      isBotQuoted = true;
    } else if (botLid && quotedSender === botLid) {
      isBotQuoted = true;
    }
  }

  if (!isBotQuoted && !isMentioned) return false;

  const userMessage = m.body || "";
  const hasImage =
    m.isImage ||
    (m.quoted && (m.quoted.isImage || m.quoted.type === "imageMessage"));

  if (!userMessage && !hasImage) return false;

  const senderNumber = m.sender.split("@")[0];

  if (isOnCooldown(senderNumber)) return false;

  try {
    await sock.sendPresenceUpdate("composing", m.chat);
    setCooldown(senderNumber);

    let imageBuffer = null;
    if (hasImage) {
      try {
        if (m.isImage && m.download) {
          imageBuffer = await m.download();
        } else if (m.quoted?.download) {
          imageBuffer = await m.quoted.download();
        }
      } catch (e) {
        console.log("[AutoAI] Image download failed:", e.message);
      }
    }

    if (!autoai.sessions) autoai.sessions = {};
    const userSession = autoai.sessions[senderNumber] || { history: [] };
    const history = userSession.history || [];

    let contextParts = [];
    if (m.pushName && m.pushName !== "Unknown") {
      contextParts.push(`User: "${m.pushName}" (${senderNumber})`);
    }
    if (m.isOwner) contextParts.push("Este usuario es OWNER del bot.");
    if (m.isAdmin) contextParts.push("Este usuario es ADMIN del grupo.");

    if (m.mentionedJid?.length > 0) {
      const mentionList = m.mentionedJid
        .filter((j) => !j.includes(sock.user?.id?.split(":")[0]))
        .map((j) => j)
        .join(", ");
      if (mentionList) contextParts.push(`El usuario mencionó/etiquetó: ${mentionList}`);
    }

    if (imageBuffer) {
      contextParts.push(
        "El usuario envió una imagen. Analiza esa imagen.",
      );
    }

    contextParts.push(userMessage || "(imagen sin texto)");

    const fullMessage = contextParts.join("\n");
    const aiMode = autoai.mode || "assistant";
    
    let fullInstruction = autoai.instruction;
    if (aiMode === "assistant") {
      fullInstruction += "\n\n" + SYSTEM_PROMPT_ACTIONS;
    } else {
      fullInstruction += "\n\nSolo realiza una conversación casual. No des formato de acción alguno. Llama o menciona el nombre del usuario si es necesario.";
    }

    saveToHistory(autoai, senderNumber, "user", userMessage || "[imagen]");

    let aiResponse = "";
    try {
      const result = await geminiChat({
        message: fullMessage,
        instruction: fullInstruction,
        imageBuffer,
        history,
      });
      aiResponse = result.text || getFallbackResponse();
    } catch (apiError) {
      console.error("[AutoAI API Error]", apiError.message);
      aiResponse = getFallbackResponse();
    }

    const normalizedAiResponse = normalizeStructuredResponse(aiResponse);
    let actions = [];
    let richMessages = [];
    let cleanResponse = normalizedAiResponse;

    if (aiMode === "assistant") {
      const aiActions = parseActions(normalizedAiResponse);
      const intentActions = detectIntentFromMessage(userMessage, m);
      actions = mergeActions(aiActions, intentActions);
      richMessages = parseRichMessage(normalizedAiResponse);
      cleanResponse = cleanRichTags(cleanActionTags(normalizedAiResponse));
    }

    saveToHistory(autoai, senderNumber, "assistant", cleanResponse);
    db.save();

    await sock.sendPresenceUpdate("paused", m.chat);

    const typingDelay = Math.min(cleanResponse.length * 20, 2000);
    await new Promise((r) => setTimeout(r, typingDelay));

    if (autoai.responseType === "voice") {
      const mp3Path = path.join(process.cwd(), "temp", `autoai_${Date.now()}.mp3`);
      let oggPath = null;
      try {
        await sock.sendPresenceUpdate("recording", m.chat);
        const execAsync = promisify(exec);

        const tempDir = path.join(process.cwd(), "temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const apiUrl = `https://firefly.maiku.my.id/api/crikk?apikey=${config.APIkey.firefly}&text=${encodeURIComponent(cleanResponse.substring(0, 500))}&voice=id-ID-ArdiNeural`;
        const response = await axios.get(apiUrl);
        
        if (!response.data?.status || !response.data?.data?.audio) {
          throw new Error("Error al generar audio desde la API Firefly");
        }
        
        const audioRes = await axios.get(response.data.data.audio, {
          responseType: "arraybuffer",
          timeout: 30000
        });

        fs.writeFileSync(mp3Path, Buffer.from(audioRes.data));

        oggPath = mp3Path.replace(".mp3", ".ogg");
        try {
          await execAsync(
            `ffmpeg -y -i "${mp3Path}" -c:a libopus -b:a 64k -ac 1 -ar 48000 "${oggPath}"`,
            { timeout: 30000 },
          );
        } catch (e) {
          console.log("[AutoAI Voice] FFmpeg error:", e.message);
        }

        let audioBuffer;
        let mime = "audio/mpeg";
        if (fs.existsSync(oggPath)) {
          audioBuffer = fs.readFileSync(oggPath);
          mime = "audio/ogg; codecs=opus";
        } else {
          audioBuffer = fs.readFileSync(mp3Path);
        }

        await sock.sendMessage(
          m.chat,
          {
            audio: audioBuffer,
            mimetype: mime,
            ptt: true,
          },
          { quoted: m },
        );

        await sock.sendPresenceUpdate("paused", m.chat);
      } catch (e) {
        console.log("[AutoAI Voice] Error:", e.message);
        await m.reply(cleanResponse);
      } finally {
        try { fs.unlinkSync(mp3Path); } catch {}
        if (oggPath) try { fs.unlinkSync(oggPath); } catch {}
      }
    } else {
      let richSent = false;
      let stickerSent = false;
      if (richMessages.length > 0) {
        for (const rich of richMessages) {
          const sent = await sendRichMessage(rich, sock, m.chat, m);
          if (sent) {
            if (rich.type === "STICKER") {
              stickerSent = true;
            } else {
              richSent = true;
            }
          }
        }
      }
      if ((!richSent || stickerSent) && cleanResponse) {
        await m.reply(cleanResponse);
      }
    }

    for (const action of actions) {
      try {
        const results = await executeAction(action, m, sock);
        for (const r of results) {
          if (!r.ok) {
            await m.reply(`⚠️ ${r.msg}`);
          }
        }
      } catch (e) {
        console.error("[AutoAI Action Error]", action.type, e.message);
        await m.reply(`❌ Error al ejecutar ${action.type}: ${e.message}`);
      }
    }

    return true;
  } catch (error) {
    console.error("[AutoAI Error]", error.message);
    await sock.sendPresenceUpdate("paused", m.chat);
    try {
      await m.reply(getFallbackResponse());
    } catch {}
    return true;
  }
}

function isAutoAIEnabled(chatId) {
  const db = getDatabase();
  if (!db?.db?.data?.autoai) return false;
  return db.db.data.autoai[chatId]?.enabled || false;
}

function getAutoAICharacter(chatId) {
  const db = getDatabase();
  if (!db?.db?.data?.autoai) return null;
  return db.db.data.autoai[chatId]?.characterName || null;
}

function clearUserSession(chatId, senderNumber) {
  const db = getDatabase();
  if (!db?.db?.data?.autoai?.[chatId]?.sessions?.[senderNumber]) return false;
  delete db.db.data.autoai[chatId].sessions[senderNumber];
  db.save();
  return true;
}

export { handleAutoAI, isAutoAIEnabled, getAutoAICharacter, clearUserSession };
