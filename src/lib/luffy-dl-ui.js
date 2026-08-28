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

export { card, fail, usage };