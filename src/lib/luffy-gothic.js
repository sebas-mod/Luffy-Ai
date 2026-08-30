// Librería de estilo semi-gótico para los menús del bot
const GOTHIC = {
  OBRA: "⏝꒷♱𖥔♱꒷⏝",
  DIV: "⋆♱⋆ ─────── ⋆♱⋆",
  DIV2: "☽◯☾ ─────── ☽◯☾",
  DIV3: "♰ ─── ✦ ─── ♰",
  DIV4: "⌢⌢⌢⌢⌢⌢",
  DIV5: "───•⊰༻♥༺⊱•───",
  DIV6: "·:*¨♱✮♱¨*:·",
  SWORD: "𓆩⚔︎𓆪 ♰",
  CROSS: "⸸ ♰ ☾",
  NIGHT: "𖥔 ✮✮✮ 𖥔",
  STAR: "★彡 ♱ 彡★",
  ABOUT: "╰─ ♡ 𝖆𝖇𝖔𝖚𝖙 𝖒𝖊:",
  MYFAV: "╰─ ♡ 𝖒𝖞 𝖋𝖆𝖛𝖔𝖗𝖎𝖙𝖊...",
  LINE: "﹍﹍﹍﹍﹍",
  HEARTS: "༺♰⋆🦇⋆♰༻",
  SPIDER: "(っཀ•)っ♱",
  TWIN: "⊱༺༒༻⊰",
  DOT: "𖥔 ✧",
  WINGS: "·:*¨♱✮♱¨*:·",
  MOON: "⋆ ✧ ☽◯☾ ✧ ⋆",
  FLOWER: "₊˚♰ °¸",
  BAN: "⛧ ₊˚.",
};

function toFancy(text) {
  const lower = {
    a: "⍺", b: "𝖻", c: "𝖼", d: "ᑯ", e: "ᧉ", f: "𝖿", g: "𝗀", h: "һ",
    i: "ı", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉",
    q: "𝗊", r: "𝗋", s: "𝗌", t: "ƚ", u: "𝗎", v: "᥎", w: "𝗐", x: "𝗑",
    y: "𝗒", z: "𝗓",
  };
  const upper = {
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛",
    I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣",
    Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫",
    Y: "𝗬", Z: "𝗭",
  };
  return String(text)
    .split("")
    .map((c) => upper[c] || lower[c] || c)
    .join("");
}

function divider(line = GOTHIC.DIV) {
  return `${line}\n`;
}

function numChars(str) {
  return Array.from(String(str)).length;
}

function gothicCenter(title, width) {
  const t = String(title);
  const pad = width - numChars(t);
  const left = Math.max(0, Math.floor(pad / 2));
  return " ".repeat(left) + t;
}

function headerBlock(title) {
  const o = GOTHIC.OBRA;
  const t = GOTHIC.TWIN;
  const obraLine = `     ${o} ${t} ${o}`;
  const nameLine = `༺♱ ${title} ♱༻`;
  const bodyWidth = numChars(obraLine) - 5;
  const pad = Math.max(0, 5 + Math.floor((bodyWidth - numChars(nameLine)) / 2));
  let out = "";
  out += `${obraLine}\n`;
  out += `${" ".repeat(pad)}${nameLine}\n`;
  out += `${obraLine}\n`;
  return out;
}

function gothicHeader(title) {
  let out = "";
  out += divider(GOTHIC.OBRA);
  out += `⛧⚔️  *${toFancy(title)}*  ⚔️⛧\n`;
  out += divider(GOTHIC.OBRA);
  out += "\n";
  return out;
}

export { GOTHIC, toFancy, divider, gothicHeader, gothicCenter, headerBlock };
