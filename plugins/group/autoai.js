import { getDatabase } from "../../src/lib/ourin-database.js";
import config from "../../config.js";
import axios from "axios";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
const execAsync = promisify(exec);

const pluginConfig = {
  name: "autoai",
  alias: ["aai"],
  category: "group",
  description:
    "Activa/desactiva respuesta automática de IA para grupos con opciones de texto o voz",
  usage:
    ".autoai on/off --ourinmode=<character|custom> --logic=<custom instruction> --type=<text|voice> --mode=<onlychat|assistant>",
  example: ".autoai on --ourinmode=furina --type=voice --mode=onlychat",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const characters = {
  furina: {
    name: "Furina",
    instruction:
      "Eres Furina de Genshin Impact. Hablas de forma relajada pero elegante, un poco dramática, a veces algo presumida pero siempre cálida. No hagas respuestas muy largas, ve al grano como en un chat normal. De vez en cuando puedes mencionar temas de escenarios o el mar. No admitas ser una IA.",
  },
  zeta: {
    name: "Zeta",
    instruction:
      "Eres Zeta de Spy x Family. Hablas de forma seria y tranquila, pero siempre algo sospechosa como si olieras una conspiración. Mantente natural como alguien conversando normal, sé breve y ve al grano. No admitas ser una IA.",
  },
  kobo: {
    name: "Kobo Kanaeru",
    instruction:
      "Eres Kobo Kanaeru. Hablas de forma relajada, alegre, algo traviesa. Estilo de chat normal, no muy larga. Puedes ser un poco random o graciosa. No abuses de mayúsculas ni emojis. No admitas ser una IA.",
  },
  elaina: {
    name: "Elaina",
    instruction:
      "Eres Elaina. Hablas de forma suave, tranquila, segura de ti misma, con un poco de narcisismo sutil. Responde de forma breve, ordenada y directa como en un chat normal. No admitas ser una IA.",
  },
  waguri: {
    name: "Waguri",
    instruction:
      "Eres Waguri. Hablas de forma breve, algo fría pero en realidad te importa. Un poco tsundere, directa, como en un chat normal. No admitas ser una IA.",
  },
  bell409: {
    name: "Bell409",
    instruction: config.autoaiPersonas?.Bell409 || "",
  },
};
async function convertToOggOpus(inputPath) {
  const outputPath = inputPath.replace(/\.[^.]+$/, ".ogg");
  const cmd = `ffmpeg -y -i "${inputPath}" -c:a libopus -b:a 64k -ac 1 -ar 48000 "${outputPath}"`;

  try {
    await execAsync(cmd, { timeout: 60000 });
    if (fs.existsSync(outputPath)) {
      return outputPath;
    }
  } catch (e) {
    console.log("[AutoAI] FFmpeg error:", e.message);
  }
  return null;
}

async function handler(m) {
  const db = getDatabase();
  const args = m.args || [];
  const fullArgs = m.fullArgs || "";

  if (!m.isGroup) {
    return m.reply(`❌ ¡Esta función solo está disponible para grupos!`);
  }

  if (!m.isAdmin && !m.isOwner) {
    return m.reply(`❌ ¡Solo los admins pueden usar esta función!`);
  }

  if (!db.db.data.autoai) db.db.data.autoai = {};
  if (!db.db.data.autoai_personas) db.db.data.autoai_personas = {};
  if (!db.db.data.autoai_global) db.db.data.autoai_global = { enabled: false };

  const subcmd = args[0]?.toLowerCase();

  if (subcmd === "tambahpersona") {
    if (!m.isOwner)
      return m.reply(`❌ ¡Solo el owner puede agregar personas!`);
    const personaArgs = fullArgs
      .replace(/^tambahpersona\s*/i, "")
      .split("|")
      .map((s) => s.trim());
    if (personaArgs.length < 2 || !personaArgs[0] || !personaArgs[1])
      return m.reply(
        `❌ ¡Formato incorrecto!\n\n> .autoai tambahpersona nombre | instrucción\n\n> Ejemplo: .autoai tambahpersona nexa | eres nexa ai, ...`,
      );
    const pName = personaArgs[0].toLowerCase().replace(/\s+/g, "_");
    const pInstruction = personaArgs.slice(1).join("|").trim();
    if (characters[pName])
      return m.reply(
        `❌ ¡El nombre "${pName}" ya está en uso por una persona predeterminada!\n\n> Elige otro nombre`,
      );
    db.db.data.autoai_personas[pName] = {
      name: personaArgs[0],
      instruction: pInstruction,
      createdBy: m.sender,
      createdAt: new Date().toISOString(),
    };
    db.save();
    return m.reply(
      `✅ *Persona agregada*\n\n> Nombre: ${personaArgs[0]}\n> Key: ${pName}\n> Lógica: ${pInstruction.substring(0, 80)}${pInstruction.length > 80 ? "..." : ""}\n\n> Usa: .autoai on --ourinmode=${pName}`,
    );
  }

  if (subcmd === "hapuspersona") {
    if (!m.isOwner)
      return m.reply(`❌ ¡Solo el owner puede eliminar personas!`);
    const pKey = (args[1] || "").toLowerCase().trim();
    if (!pKey)
      return m.reply(
        `❌ ¡Formato incorrecto!\n\n> .autoai hapuspersona <nombre>\n\n> Ejemplo: .autoai hapuspersona nexa`,
      );
    if (!db.db.data.autoai_personas[pKey])
      return m.reply(
        `❌ ¡La persona "${pKey}" no fue encontrada!\n\n> Escribe .autoai listpersona para ver la lista`,
      );
    delete db.db.data.autoai_personas[pKey];
    db.save();
    return m.reply(`✅ Persona "${pKey}" eliminada exitosamente`);
  }

  if (subcmd === "enablecommand" || subcmd === "enablecmd") {
    if (!m.isAdmin && !m.isOwner)
      return m.reply(`❌ ¡Solo los admins pueden configurar esto!`);
    const cfg = db.db.data.autoai[m.chat];
    if (!cfg?.enabled) return m.reply(`❌ ¡AutoAI no está activo en este grupo!`);
    if (cfg.enableCommands)
      return m.reply(`ℹ️ *Comando ya habilitado*

> Los usuarios pueden usar comandos incluso con AutoAI activo`);
    cfg.enableCommands = true;
    db.save();
    return m.reply(
      `✅ *ᴄᴏᴍᴀɴᴅᴏs ʜᴀʙɪʟɪᴛᴀᴅᴏs*

` +
        `> Los usuarios ahora pueden usar comandos con AutoAI activo
` +
        `> El bot sigue respondiendo cuando lo mencionan o responden

` +
        `_Usa ${m.prefix}autoai disablecommand para deshabilitar_`,
    );
  }

  if (subcmd === "disablecommand" || subcmd === "disablecmd") {
    if (!m.isAdmin && !m.isOwner)
      return m.reply(`❌ ¡Solo los admins pueden configurar esto!`);
    const cfg = db.db.data.autoai[m.chat];
    if (!cfg?.enabled) return m.reply(`❌ ¡AutoAI no está activo en este grupo!`);
    if (!cfg.enableCommands)
      return m.reply(`ℹ️ *Comando ya deshabilitado*

> Todos los comandos (excepto owner) están bloqueados con AutoAI activo`);
    cfg.enableCommands = false;
    db.save();
    return m.reply(
      `🔒 *ᴄᴏᴍᴀɴᴅᴏs ᴅᴇsʜᴀʙɪʟɪᴛᴀᴅᴏs*

` +
        `> Todos los comandos (excepto owner) bloqueados con AutoAI activo
` +
        `> El bot solo responde cuando lo mencionan o responden

` +
        `_Usa ${m.prefix}autoai enablecommand para reactivar_`,
    );
  }

  if (subcmd === "listpersona") {
    const builtIn = Object.entries(characters)
      .map(([k, v]) => `  ▸ ${k} - ${v.name}`)
      .join("\n");
    const customEntries = Object.entries(db.db.data.autoai_personas);
    const custom = customEntries.length
      ? customEntries
          .map(
            ([k, v]) =>
              `  ▸ ${k} - ${v.name} (${v.instruction.substring(0, 40)}${v.instruction.length > 40 ? "..." : ""})`,
          )
          .join("\n")
      : "  ▸ (aún no hay persona personalizada)";
    let txt = `🤖 *Lista de Personas*\n\n`;
    txt += `*Predeterminadas:*\n${builtIn}\n\n`;
    txt += `*Personalizadas:*\n${custom}\n\n`;
    txt += `*Global:* ${db.db.data.autoai_global.enabled ? "✅ Activo" : "❌ Inactivo"}\n\n`;
    txt += `> .autoai on --ourinmode=<key>\n`;
    txt += `> .autoai tambahpersona nombre | logic\n`;
    txt += `> .autoai hapuspersona nombre\n`;
    txt += `> .autoai global on/off`;
    return m.reply(txt);
  }

  if (subcmd === "global") {
    if (!m.isOwner) return m.reply(`❌ ¡Solo el owner puede activar/desactivar global!`);
    const globalMode = (args[1] || "").toLowerCase();
    if (!["on", "off"].includes(globalMode))
      return m.reply(
        `❌ ¡Formato incorrecto!\n\n> .autoai global on/off\n\n> Global actual: ${db.db.data.autoai_global.enabled ? "✅ Activo" : "❌ Inactivo"}`,
      );
    if (globalMode === "on") {
      const modeMatch = fullArgs.match(/--ourinmode=(\w+)/i);
      const typeMatch = fullArgs.match(/--type=(text|voice)/i);
      const aimodeMatch = fullArgs.match(/--mode=(onlychat|assistant)/i);
      const logicMatch = fullArgs.match(
        /--logic=(.+?)(?=\s+--(?:ourinmode|type|logic|mode)|$)/i,
      );
      const charKey = modeMatch ? modeMatch[1].toLowerCase() : null;
      const responseType = typeMatch ? typeMatch[1].toLowerCase() : "text";
      const aiMode = aimodeMatch ? aimodeMatch[1].toLowerCase() : "assistant";
      const customLogic = logicMatch ? logicMatch[1].trim() : null;

      let instruction = "";
      let characterName = "Global";
      let character = "global";

      if (charKey === "custom" && customLogic) {
        instruction = customLogic;
        character = "custom";
        characterName = "Custom";
      } else if (charKey && characters[charKey]) {
        instruction = characters[charKey].instruction;
        character = charKey;
        characterName = characters[charKey].name;
      } else if (charKey && db.db.data.autoai_personas[charKey]) {
        instruction = db.db.data.autoai_personas[charKey].instruction;
        character = charKey;
        characterName = db.db.data.autoai_personas[charKey].name;
      } else if (!charKey) {
        const existingGlobal = db.db.data.autoai_global;
        if (existingGlobal.instruction) {
          instruction = existingGlobal.instruction;
          character = existingGlobal.character || "global";
          characterName = existingGlobal.characterName || "Global";
        } else {
          return m.reply(
            `❌ ¡Aún no hay persona global configurada!\n\n> .autoai global on --ourinmode=furina\n> .autoai global on --ourinmode=custom --logic=...`,
          );
        }
      } else {
        const charList = [
          ...Object.keys(characters),
          ...Object.keys(db.db.data.autoai_personas),
          "custom",
        ].join(", ");
        return m.reply(`❌ ¡Personaje no válido!\n\n> Disponibles: ${charList}`);
      }

      db.db.data.autoai_global = {
        enabled: true,
        character,
        characterName,
        instruction,
        responseType,
        mode: aiMode,
      };
      db.save();
      return m.reply(
        `🌐 *ᴀᴜᴛᴏ ᴀɪ ɢʟᴏʙᴀʟ ACTIVADO*\n\n` +
          `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n` +
          `┃ 🎭 Personaje: *${characterName}*\n` +
          `┃ 📢 Respuesta: *${responseType === "voice" ? "🎤 Nota de voz" : "💬 Texto"}*\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `> ℹ️ AutoAI activo en todos los grupos\n` +
          `> ℹ️ Los grupos con configuración propia mantienen su config\n` +
          `> ℹ️ Escribe *.autoai global off* para desactivar`,
      );
    } else {
      db.db.data.autoai_global.enabled = false;
      db.save();
      return m.reply(
        `🌐 *ᴀᴜᴛᴏ ᴀɪ ɢʟᴏʙᴀʟ ᴅᴇꜱᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> AutoAI solo activo en grupos que lo tengan configurado`,
      );
    }
  }

  const mode = subcmd;
  const modeMatch = fullArgs.match(/--ourinmode=(\w+)/i);
  const typeMatch = fullArgs.match(/--type=(text|voice)/i);
  const aimodeMatch = fullArgs.match(/--mode=(onlychat|assistant)/i);
  const logicMatch = fullArgs.match(
    /--logic=(.+?)(?=\s+--(?:ourinmode|type|logic|mode)|$)/i,
  );
  const charKey = modeMatch ? modeMatch[1].toLowerCase() : null;
  const responseType = typeMatch ? typeMatch[1].toLowerCase() : "text";
  const aiMode = aimodeMatch ? aimodeMatch[1].toLowerCase() : "assistant";
  const customLogic = logicMatch ? logicMatch[1].trim() : null;

  if (!mode || !["on", "off"].includes(mode)) {
    const charList = Object.entries(characters)
      .map(([key, val]) => `> ${key} - ${val.name}`)
      .join("\n");
    const customP = Object.entries(db.db.data.autoai_personas);
    const customList = customP.length
      ? customP.map(([k, v]) => `> ${k} - ${v.name} (custom)`).join("\n")
      : "";
    let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ*\n\n`;
    txt += `> Activar/desactivar respuesta automática de IA\n\n`;
    txt += `*Uso:*\n`;
    txt += `> .autoai on --ourinmode=<personaje|custom> --type=<text|voice> --mode=<onlychat|assistant>\n`;
    txt += `> .autoai off\n`;
    txt += `> .autoai tambahpersona nombre | lógica\n`;
    txt += `> .autoai hapuspersona nombre\n`;
    txt += `> .autoai listpersona\n`;
    txt += `> .autoai global on/off\n`;
    txt += `> .autoai enablecommand / disablecommand\n\n`;
    txt += `*Personajes predeterminados:*\n${charList}\n`;
    if (customList) txt += `\n*Personajes personalizados:*\n${customList}\n`;
    txt += `\n*Global:* ${db.db.data.autoai_global.enabled ? "✅ Activo" : "❌ Inactivo"}\n\n`;
    txt += `*Tipo de respuesta:*\n`;
    txt += `> text - Responder con texto normal\n`;
    txt += `> voice - Responder con nota de voz (TTS)\n\n`;
    txt += `*Modo AutoAI:*\n`;
    txt += `> assistant - El bot puede ejecutar acciones (abrir/cerrar grupo, kick, mensaje enriquecido)\n`;
    txt += `> onlychat - El bot solo chatea de forma relajada\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `> .autoai on --ourinmode=furina --type=text\n`;
    txt += `> .autoai on --ourinmode=custom --logic=eres un asistente IA...\n`;
    txt += `> .autoai tambahpersona nexa | eres un asistente IA...\n`;
    txt += `> .autoai global on --ourinmode=furina`;
    return m.reply(txt);
  }

  if (mode === "off") {
    db.db.data.autoai[m.chat] = { enabled: false };
    db.save();
    const globalStatus = db.db.data.autoai_global?.enabled
      ? `\n\n> ℹ️ Global sigue activo, pero este grupo ha salido\n> ℹ️ Escribe *.autoai global off* para desactivar global`
      : "";
    return m.reply(
      `🤖 *ᴀᴜᴛᴏ ᴀɪ ᴅᴇꜱᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> AutoAI para este grupo ha sido desactivado\n> Todos los comandos vuelven a estar activos${globalStatus}`,
    );
  }

  if (!charKey) {
    const charList = [
      ...Object.keys(characters),
      ...Object.keys(db.db.data.autoai_personas),
      "custom",
    ].join(", ");
    return m.reply(
      `❌ ¡Personaje no válido!\n\n> Personajes disponibles: ${charList}\n\n> Ejemplo: .autoai on --ourinmode=furina --type=voice\n> Custom: .autoai on --ourinmode=custom --logic=eres un asistente IA`,
    );
  }

  if (charKey === "custom") {
    if (!customLogic) {
      return m.reply(
        `❌ ¡El modo custom requiere --logic!\n\n> Ejemplo: .autoai on --ourinmode=custom --logic=eres un asistente IA, ...`,
      );
    }
    db.db.data.autoai[m.chat] = {
      enabled: true,
      character: "custom",
      characterName: "Custom",
      instruction: customLogic,
      responseType: responseType,
      mode: aiMode,
      enableCommands: false,
      sessions: {},
      activatedBy: m.sender,
      activatedAt: new Date().toISOString(),
    };
    db.save();
    let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ ACTIVADO*\n\n`;
    txt += `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n`;
    txt += `┃ 🎭 Personaje: *Custom*\n`;
    txt += `┃ 🧠 Lógica: ${customLogic.substring(0, 100)}${customLogic.length > 100 ? "..." : ""}\n`;
    txt += `┃ 📢 Respuesta: *${responseType === "voice" ? "🎤 Nota de voz" : "💬 Texto"}*\n`;
    txt += `┃ 👤 Activado por: @${m.sender.split("@")[0]}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
    txt += `> ℹ️ Todos los comandos (excepto owner) desactivados\n`;
    txt += `> ℹ️ El bot responde cuando le reply o le etiquetan\n`;
    txt +=
      responseType === "voice" ? `> ℹ️ La respuesta es en nota de voz\n` : "";
    txt += `> ℹ️ Escribe *.autoai off* para desactivar`;
    return m.reply(txt, { mentions: [m.sender] });
  }

  const customPersona = db.db.data.autoai_personas[charKey];
  if (customPersona) {
    db.db.data.autoai[m.chat] = {
      enabled: true,
      character: charKey,
      characterName: customPersona.name,
      instruction: customPersona.instruction,
      responseType: responseType,
      mode: aiMode,
      enableCommands: false,
      sessions: {},
      activatedBy: m.sender,
      activatedAt: new Date().toISOString(),
    };
    db.save();
    let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ ACTIVADO*\n\n`;
    txt += `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n`;
    txt += `┃ 🎭 Personaje: *${customPersona.name}* (custom)\n`;
    txt += `┃ 📢 Respuesta: *${responseType === "voice" ? "🎤 Nota de voz" : "💬 Texto"}*\n`;
    txt += `┃ 👤 Activado por: @${m.sender.split("@")[0]}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
    txt += `> ℹ️ Todos los comandos (excepto owner) desactivados\n`;
    txt += `> ℹ️ El bot responde cuando le reply o le etiquetan\n`;
    txt +=
      responseType === "voice" ? `> ℹ️ La respuesta es en nota de voz\n` : "";
    txt += `> ℹ️ Escribe *.autoai off* para desactivar`;
    return m.reply(txt, { mentions: [m.sender] });
  }

  if (!characters[charKey]) {
    const charList = [
      ...Object.keys(characters),
      ...Object.keys(db.db.data.autoai_personas),
      "custom",
    ].join(", ");
    return m.reply(
      `❌ ¡Personaje no válido!\n\n> Personajes disponibles: ${charList}\n\n> Ejemplo: .autoai on --ourinmode=furina --type=voice`,
    );
  }

  db.db.data.autoai[m.chat] = {
    enabled: true,
    character: charKey,
    characterName: characters[charKey].name,
    instruction: characters[charKey].instruction,
    responseType: responseType,
    mode: aiMode,
    enableCommands: false,
    sessions: {},
    activatedBy: m.sender,
    activatedAt: new Date().toISOString(),
  };
  db.save();

  let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ ACTIVADO*\n\n`;
  txt += `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n`;
  txt += `┃ 🎭 Personaje: *${characters[charKey].name}*\n`;
  txt += `┃ 📢 Respuesta: *${responseType === "voice" ? "🎤 Nota de voz" : "💬 Texto"}*\n`;
  txt += `┃ 👤 Activado por: @${m.sender.split("@")[0]}\n`;
  txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  txt += `> ℹ️ Todos los comandos (excepto owner) desactivados\n`;
  txt += `> ℹ️ El bot responde cuando le reply o le etiquetan\n`;
  txt +=
    responseType === "voice" ? `> ℹ️ La respuesta es en nota de voz\n` : "";
  txt += `> ℹ️ Escribe *.autoai off* para desactivar`;

  await m.reply(txt, { mentions: [m.sender] });
}

async function generateVoiceResponse(text, sock, chatId, quotedMsg) {
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const mp3Path = path.join(tempDir, `tts_${Date.now()}.mp3`);
  let oggPath = null;

  try {
    const apiUrl = `https://firefly.maiku.my.id/api/crikk?apikey=${config.APIkey.firefly}&text=${encodeURIComponent(text)}&voice=id-ID-ArdiNeural`;
    const response = await axios.get(apiUrl);
    
    if (!response.data?.status || !response.data?.data?.audio) {
      throw new Error("Error al generar audio desde la API Firefly");
    }
    
    const audioRes = await axios.get(response.data.data.audio, {
      responseType: "arraybuffer",
      timeout: 30000
    });
    
    fs.writeFileSync(mp3Path, Buffer.from(audioRes.data));

    oggPath = await convertToOggOpus(mp3Path);

    if (oggPath && fs.existsSync(oggPath)) {
      const audioBuffer = fs.readFileSync(oggPath);

      await sock.sendMessage(
        chatId,
        {
          audio: audioBuffer,
          mimetype: "audio/ogg; codecs=opus",
          ptt: true,
        },
        { quoted: quotedMsg },
      );
    } else {
      const audioBuffer = fs.readFileSync(mp3Path);

      await sock.sendMessage(
        chatId,
        {
          audio: audioBuffer,
          mimetype: "audio/mpeg",
          ptt: true,
        },
        { quoted: quotedMsg },
      );
    }

    return true;
  } catch (e) {
    console.log("[AutoAI Voice] Error:", e.message);
    return false;
  } finally {
    try { fs.unlinkSync(mp3Path); } catch {}
    if (oggPath) try { fs.unlinkSync(oggPath); } catch {}
  }
}

export { pluginConfig as config, handler, characters, generateVoiceResponse };
