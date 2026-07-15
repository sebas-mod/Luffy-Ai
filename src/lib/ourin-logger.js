import chalk from "chalk";
import * as timeHelper from "./ourin-time.js";
import { getCachedJid, isLidConverted } from "./ourin-lid.js";

// Mock gradient-string if any other file imports it from here
const gradientMock = (text) => text;
const gradient = () => gradientMock;

// 3 Main Colors
const cGreen = chalk.greenBright;
const cWhite = chalk.whiteBright;
const cGray = chalk.gray;

// Helper to create linux-style brackets
function makeTag(label, isSuccess = false, isError = false) {
  const text = label.toUpperCase().substring(0, 4).padStart(4, " ");
  if (isSuccess) return `${cGray("[")} ${cGreen(text)} ${cGray("]")}`;
  if (isError) return `${cGray("[")} ${cWhite(text)} ${cGray("]")}`; // Error uses white inside brackets for visibility, or green? User said green for check/highlights, white for important text. Let's use White for error labels or Gray.
  return `${cGray("[")} ${cWhite(text)} ${cGray("]")}`;
}

const SYM = {
  ok: makeTag("OK", true),
  no: makeTag("FAIL", false, true),
  wn: makeTag("WARN"),
  info: makeTag("INFO"),
  sys: makeTag("SYS"),
  dbg: makeTag("DBG"),
};

function writeLog(kind, label, detail = "") {
  const tags = {
    info: SYM.info,
    success: SYM.ok,
    warn: SYM.wn,
    error: SYM.no,
    system: SYM.sys,
    debug: SYM.dbg,
  };
  const tag = tags[kind] || SYM.info;

  // Format: [  OK  ] Started OURIN AI
  const msg = `${tag} ${cWhite(label)}${detail ? " " + cGray(detail) : ""}`;
  console.log(msg);
}

const logger = {
  info: (label, detail = "") => writeLog("info", label, detail),
  success: (label, detail = "") => writeLog("success", label, detail),
  warn: (label, detail = "") => writeLog("warn", label, detail),
  error: (label, detail = "") => writeLog("error", label, detail),
  system: (label, detail = "") => writeLog("system", label, detail),
  debug: (label, detail = "") => writeLog("debug", label, detail),
  tag: (label, msg, detail = "") => {
    console.log(`${makeTag(label.substring(0, 4))} ${cWhite(msg)}${detail ? " " + cGray(detail) : ""}`);
  },
};

function createSpinner(label = "SYS", text = "loading", options = {}) {
  // Simplified spinner for linux style (just log the start)
  let active = false;
  return {
    start() {
      active = true;
      console.log(`${makeTag(label)} ${cWhite(text)}...`);
    },
    update(nextText) {
      if (active) console.log(`${makeTag(label)} ${cWhite(nextText)}...`);
    },
    stop() {
      active = false;
    },
    succeed(detail = text) {
      this.stop();
      logger.success(label, detail);
    },
    warn(detail = text) {
      this.stop();
      logger.warn(label, detail);
    },
    fail(detail = text) {
      this.stop();
      logger.error(label, detail);
    },
    isActive() {
      return active;
    }
  };
}

async function spinText(label, text, options = {}) {
  // Directly print success since we want a fast, simple boot
  console.log(`${makeTag("OK", true)} ${cWhite(text)}`);
}

async function typeLine(text, options = {}) {
  // Strip formatting from caller if it used old colors
  const clean = text.replace(/\x1B\[\d+m/g, "");
  console.log(`${makeTag("OK", true)} ${cWhite(clean)}`);
}

async function runLoader(text = "memuat", options = {}) {
  console.log(`${makeTag("OK", true)} ${cWhite(text)}`);
}

async function playBootSequence(info = {}) {
  const { name = "Luffy-Ai", version = "1.0.0", developer = "Sebas-MD", mode = "public" } = info;
  const banner = [
    "",
    `  ${cGreen("██╗     ██╗   ██╗██╗  ██╗ ██████╗")}`,
    `  ${cGreen("██║     ██║   ██║██║ ██╔╝██╔═══██╗")}`,
    `  ${cGreen("██║     ██║   ██║█████╔╝ ██║   ██║")}`,
    `  ${cGreen("██║     ██║   ██║██╔═██╗ ██║   ██║")}`,
    `  ${cGreen("███████╗╚██████╔╝██║  ██╗╚██████╔╝")}`,
    `  ${cGreen("╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝")}`,
    `                ${cGreen("AI")}`,
    "",
    `  ${cGray("Developer:")} ${cGreen(developer)}`,
    `  ${cGray("Version:")}   ${cWhite("v" + version)}`,
    `  ${cGray("Mode:")}      ${cWhite(mode)}`,
    "",
  ];
  for (const line of banner) console.log(line);
}

function getTypeTag(msgType, isNewsletter) {
  if (isNewsletter) return "Channel";

  const map = {
    imageMessage: "Image",
    videoMessage: "Video",
    audioMessage: "Audio",
    stickerMessage: "Sticker",
    documentMessage: "Doc",
    contactMessage: "Contact",
    locationMessage: "Location",
    viewOnceMessageV2: "1xView",
    extendedTextMessage: "Text",
    conversation: "Text",
    interactiveResponseMessage: "Button",
    pollCreationMessage: "Poll",
    reactionMessage: "Reaction",
  };
  return map[msgType] || "Message";
}

function logMessage(info) {
  if (typeof info === "string") {
    const [chatType, sender, message] = arguments;
    info = {
      chatType,
      sender,
      message,
      pushName: sender,
      groupName: chatType === "group" ? "Unknown" : "Private",
    };
  }

  const { chatType, groupName, pushName, sender, message, messageType, isNewsletter } = info;
  if (!message || message.trim() === "" || !sender) return;

  const num = sender.replace("@s.whatsapp.net", "");
  let msg = message.replace(/\n/g, " ").substring(0, 100) + (message.length > 100 ? "..." : "");

  msg = msg.replace(/@(\d{10,})/g, (match, num) => {
    const lidJid = num + "@lid";
    const resolved = getCachedJid(lidJid);
    if (resolved && !isLidConverted(resolved)) return "@" + resolved.replace(/@.+/g, "");
    const swJid = num + "@s.whatsapp.net";
    const resolved2 = getCachedJid(swJid);
    if (resolved2 && !isLidConverted(resolved2)) return "@" + resolved2.replace(/@.+/g, "");
    return match;
  });

  const time = timeHelper.formatTime("HH:mm:ss");
  const date = timeHelper.formatTime("DD/MM/YYYY");
  const typeTag = getTypeTag(messageType, isNewsletter || chatType === "newsletter");

  const location = chatType === "group" || chatType === "newsletter" ? (groupName || "Group") : "Private";
  const senderName = pushName || num;

  console.log("");
  console.log(`  ${cGray("╭─〔")} ${cWhite("Mensaje de")} ${chatType === "private" ? cWhite("Chat Privado") : cWhite("grupo")} ${cWhite(location)} ${cGray("〕───⬣")}`);
  console.log(`  ${cGray("│")} ${cWhite("👤 Nombre:")} ${cWhite(senderName)}`);
  console.log(`  ${cGray("│")} ${cWhite("📞 Número:")} ${cWhite("+" + num)}`);
  console.log(`  ${cGray("│")} ${cWhite("📅 Hora:")} ${cGray(date)} ${cWhite(time)}`);
  console.log(`  ${cGray("│")} ${cWhite("💬 Tipo:")} ${cGray(`[${typeTag}]`)}`);
  console.log(`  ${cGray("│")} ${cWhite("💬 " + msg)}`);
  console.log(`  ${cGray("╰───────⬣")}`);
}

function logPlugin(name, category) {
  // Simple tree view for plugin
  console.log(`  ${cGray("├─")} ${cWhite(name)} ${cGray(`[${category}]`)}`);
}

function logConnection(status, info = "") {
  if (status === "connected") {
    console.log(`${makeTag("OK", true)} ${cWhite("Connected")} ${cGray(info ? `— ${info}` : "")}`);
  } else if (status === "connecting") {
    console.log(`${makeTag("WAIT")} ${cWhite("Connecting")} ${cGray(info ? `— ${info}` : "")}`);
  } else {
    console.log(`${makeTag("FAIL", false, true)} ${cWhite("Disconnected")} ${cGray(info ? `— ${info}` : "")}`);
  }
}

function logErrorBox(title, message) {
  console.log(`${makeTag("ERR", false, true)} ${cWhite(title)}: ${cGray(message)}`);
}

function printBanner(mini = false) {
  // No banner for linux style
}

function printStartup(info = {}) {
  // Already handled by boot sequence
}

const CODES = {
  reset: "", bold: "", dim: "", italic: "", underline: "",
  green: "", purple: "", white: "", gray: "", phantom: "",
  lime: "", silver: "", red: "", yellow: "", blue: "",
  cyan: "", magenta: "", bgBlack: "", bgGray: "",
};

// Map all colors to our 3 colors
const c = {
  green: cGreen,
  purple: cWhite,
  white: cWhite,
  gray: cGray,
  bold: (v) => v,
  dim: cGray,
  greenBold: cGreen,
  purpleBold: cWhite,
  whiteBold: cWhite,
  grayDim: cGray,
  red: cWhite,
  yellow: cWhite,
  cyan: cWhite,
  blue: cWhite,
  magenta: cWhite,
};

function divider() {
  // No divider for minimalism, or just a new line
  console.log("");
}

function createBanner(lines, color = "green") {
  return lines.map(l => `${cGray("│")} ${cWhite(l)}`).join("\n");
}

function getTimestamp() {
  return cGray(timeHelper.formatTime("HH:mm:ss"));
}

const theme = {
  primary: cWhite,
  secondary: cWhite,
  accent: cGreen,
  text: cWhite,
  dim: cGray,
  muted: cGray,
  success: cGreen,
  error: cWhite,
  warning: cWhite,
  info: cWhite,
  debug: cGray,
  border: cGray,
  tag: cWhite,
  pill: (t) => t,
  rainbow: gradientMock,
  borderFx: (t) => cGray(t),
  mintFx: (t) => cGreen(t),
  warmFx: (t) => cWhite(t),
  colorizeCategory: (t) => cWhite(t),
};

export {
  c,
  CODES,
  logger,
  createSpinner,
  spinText,
  typeLine,
  runLoader,
  playBootSequence,
  logMessage,
  logPlugin,
  logConnection,
  logErrorBox,
  printBanner,
  printStartup,
  createBanner,
  getTimestamp,
  divider,
  theme,
  chalk,
  gradient
};
