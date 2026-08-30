// Librería de marcos UI con estilo semi-gótico (centrados) para los plugins del bot

const G = {
  MOON: "☽◯☾",
  CROSS: "♰",
  TWIN: "⊱༺༒༻⊰",
  NIGHT: "𖥔 ݁ ˖⋆˚꩜｡✮✮✮⋆˚꩜｡.𖥔 ݁ ˖",
  LINE: "﹍﹍﹍﹍﹍﹍﹍﹍﹍",
  SWORD: "𓆩⚔︎𓆪",
  STAR: "✮",
  BAN: "⛧",
  FLOWER: "♱",
  HEART: "♡",
  OBRA: "⏝꒷︶ ͡𑁬♱໒ ͡ ︶꒷⏝",
};

function centerText(text, width) {
  const len = Array.from(text).length;
  if (len >= width) return text;
  const totalPad = width - len;
  const left = Math.floor(totalPad / 2);
  const right = totalPad - left;
  return " ".repeat(left) + text + " ".repeat(right);
}

function gothicTitle(title) {
  const content = `${G.MOON} ♰ ${title} ♰ ${G.MOON}`;
  return content;
}

function gothicBox(title, body) {
  const head = `╭━﹝ ${gothicTitle(title)} ﹞━╮`;
  const lines = String(body).split("\n");
  const wrapped = lines.map((l) => `┃ ${l}`).join("\n");
  return `${head}\n${wrapped}\n╰━ ${G.TWIN} ━╯`;
}

function gothicFail(title, msg) {
  return `╭━﹝ ${G.MOON} ♰ ❌ ${title} ♰ ${G.MOON} ﹞━╮\n┃ ${msg}\n╰━ ${G.TWIN} ━╯`;
}

function gothicUsage(prefix, cmd, example = "") {
  let out = `╰┈➤ ${G.FLOWER} Uso: ${prefix}${cmd}`;
  if (example) out += `\n╰┈➤ ${G.FLOWER} Ejemplo: ${prefix}${cmd} ${example}`;
  return out + `\n${G.OBRA}`;
}

export { gothicBox, gothicFail, gothicTitle, gothicUsage, G };
