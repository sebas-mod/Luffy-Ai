function card({ emoji = "📥", title, fields = [], footer }) {
  let txt = `✦ • ─── • ✦\n${emoji} *${title}*\n──────────\n`;
  for (const [label, value] of fields) {
    if (value === undefined || value === null || value === "") continue;
    txt += `▸ *${label}*: ${value}\n`;
  }
  txt += "──────────\n";
  if (footer) txt += `> ${footer}\n`;
  return txt.trim();
}

function fail(title, msg) {
  return `✦ • ─── • ✦\n❌ *${title}*\n──────────\n> ${msg}`;
}

function usage(prefix, cmd, example = "") {
  return `╰┈➤ Uso: *${prefix}${cmd}*${example ? `\n╰┈➤ Ejemplo: *${prefix}${cmd} ${example}*` : ""}`;
}

const PROGRESS_UNICODE = ["⏳", "🔄", "⏱️", "📥"];

/**
 * Secuencia de reacciones de progreso para descargas lentas.
 * @param {import("ourin").LuffySocket} sock
 * @param {*} m
 * @param {string[]} steps
 */
async function progressChain(sock, m, steps = PROGRESS_UNICODE) {
  for (const r of steps) {
    try { await m.react(r); } catch {}
  }
}

async function progressReply(sock, m, msg, { edit = false } = {}) {
  try {
    if (edit) {
      const text = typeof msg === "function" ? msg(sock) : msg;
      await sock.sendMessage(m.chat, { text, edit: m.key });
    } else {
      await sock.sendMessage(m.chat, { text: msg }, { quoted: m });
    }
  } catch {}
}

export { card, fail, usage, progressChain, progressReply };