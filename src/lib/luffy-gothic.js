// Librería de estilo semi-gótico para los menús del bot
const GOTHIC = {
  OBRA: "⏝꒷♱ 𖥔 ♱꒷⏝",
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
    a: "𝖆", b: "𝖇", c: "𝖈", d: "𝖉", e: "𝖊", f: "𝖋", g: "𝖌", h: "𝖍",
    i: "𝖎", j: "𝖏", k: "𝖐", l: "𝖑", m: "𝖒", n: "𝖓", o: "𝖔", p: "𝖕",
    q: "𝖖", r: "𝖗", s: "𝖘", t: "𝖙", u: "𝖚", v: "𝖛", w: "𝖜", x: "𝖝",
    y: "𝖞", z: "𝖟",
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

function gothicHeader(title) {
  let out = "";
  out += divider(GOTHIC.OBRA);
  out += `⛧⚔️  *${toFancy(title)}*  ⚔️⛧\n`;
  out += divider(GOTHIC.OBRA);
  out += "\n";
  return out;
}

export { GOTHIC, toFancy, divider, gothicHeader };
