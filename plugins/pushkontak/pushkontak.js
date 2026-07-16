import fs from "fs";
import path from "path";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { getGroupMode } from "../group/botmode.js";
import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";
import {
  resolveAnyLidToJid,
  isLidConverted,
  getCachedJid,
} from "../../src/lib/ourin-lid.js";

const pluginConfig = {
  name: "pushcontacto",
  alias: [
    "puscontacto",
    "push",
    "stoppush",
    "setjedapush",
    "pushcontacto_start",
    "alolapush",
    "autovcf_on",
    "autovcf_off",
    "kodeunik_on",
    "kodeunik_off",
    "vcftarget_private",
    "vcftarget_group",
    "skipadmin_on",
    "skipadmin_off",
  ],
  category: "pushcontacto",
  description: "Push mensaje a todos los miembros grup + auto simpan contacto VCF",
  usage: ".pushcontacto",
  example: ".pushcontacto",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

if (!global.pushkontakSessions) global.pushkontakSessions = {};

const SESSION_TIMEOUT = 300000;
const SERIAL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

import axios from "axios";
import { getAssetBuffer } from "../../src/lib/ourin-asset-manager.js";

let cachedThumb = null;
let cachedDoc = null;
try {
  if (getAssetBuffer("ourin")) {
    cachedThumb = getAssetBuffer("ourin");
  }
  cachedDoc = fs.readFileSync("./package.json");
} catch { }

function serial(len) {
  let r = "";
  for (let i = 0; i < len; i++)
    r += SERIAL_CHARS[Math.floor(Math.random() * SERIAL_CHARS.length)];
  return r;
}

function buildVcf(contacts) {
  return contacts
    .map((jid) => {
      const num = jid.split("@")[0];
      return `BEGIN:VCARD\nVERSION:3.0\nFN:WA[${serial(2)}] ${num}\nTEL;type=CELL;type=VOICE;waid=${num}:+${num}\nEND:VCARD\n`;
    })
    .join("");
}

function resolveParticipants(metadata, botId, senderJid, skipAdmin = false) {
  return metadata.participants
    .filter((p) => {
      if (skipAdmin && (p.admin === "admin" || p.admin === "superadmin"))
        return false;
      return true;
    })
    .map((p) => {
      if (p.phoneNumber) return p.phoneNumber;
      if (p.jid && !p.jid.endsWith("@lid")) return p.jid;
      if (p.id && !p.id.endsWith("@lid")) return p.id;
      const resolved = resolveAnyLidToJid(p.jid || p.id, metadata.participants);
      if (resolved && !resolved.endsWith("@lid") && !isLidConverted(resolved))
        return resolved;
      const cached = getCachedJid(p.jid || p.id || p.lid || "");
      if (cached && !cached.endsWith("@lid") && !isLidConverted(cached))
        return cached;
      return null;
    })
    .filter((id) => id && id !== botId && !id.includes(senderJid));
}

function getSession(jid) {
  return global.pushkontakSessions[jid] || null;
}

function clearSession(jid) {
  const s = global.pushkontakSessions[jid];
  if (s?.timeout) clearTimeout(s.timeout);
  delete global.pushkontakSessions[jid];
}

function createSession(jid, chatJid) {
  clearSession(jid);
  const session = {
    step: "message",
    message: null,
    chatJid,
    promptId: null,
    startedAt: Date.now(),
    timeout: setTimeout(() => {
      delete global.pushkontakSessions[jid];
    }, SESSION_TIMEOUT),
  };
  global.pushkontakSessions[jid] = session;
  return session;
}

function nativeFlowMsg(m, title, buttons) {
  return {
    interactiveMessage: {
      title,
      footer: config.bot?.name || "Luffy-AI",
      image: cachedThumb,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 7,
        isForwarded: true,
      },
      nativeFlowMessage: {
        messageParamsJson: JSON.stringify({
          limited_time_offer: {
            text: config.bot?.name || "Luffy-AI",
            url: "",
            copy_code: "Push Contacto",
            expiration_time: Date.now() * 7,
          },
          bottom_sheet: {
            in_thread_buttons_limit: 2,
            divider_indices: [1, 2, 3, 4, 5, 999],
            list_title: "Push Contacto",
            button_title: "📢 Pilih Fesor",
          },
          tap_target_configuration: {
            title: " X ",
            description: "bomboclard",
            canonical_url: "https://ourin.site",
            domain: "shop.example.com",
            button_index: 0,
          },
        }),
        buttons,
      },
    },
  };
}

async function sendVcf(sock, ownerJid, contacts, groupName) {
  const tmpDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const vcfPath = path.join(tmpDir, `pushcontacto_${Date.now()}.vcf`);
  fs.writeFileSync(vcfPath, buildVcf(contacts), "utf8");
  await sock.sendMessage(ownerJid, {
    document: fs.readFileSync(vcfPath),
    fileName: `Contacto_${groupName || "Group"}_${contacts.length}.vcf`,
    mimetype: "text/vcard",
    caption:
      `💾 *AUTO-SAVE KONTAK*\n\n` +
      `📊 *Total:* ${contacts.length} contacto\n` +
      `👥 *Grup:* ${groupName || "Unknown"}\n\n` +
      `📱 _Import file esto a HP para guarydo todos contacto_`,
  });
  try {
    fs.unlinkSync(vcfPath);
  } catch { }
}

async function handleStop(m) {
  if (!global.statuspush) {
    return m.reply(
      `❌ *GAGAL*\n\n🚫 *No hay push de contactos en ejecución actualmente*`,
    );
  }
  global.stoppush = true;
  m.react("⏹️");
  return m.reply(
    `⏹️ *PUSH DIHENTIKAN*\n\n✅ *El proceso de push de contactos se detendrá pronto*`,
  );
}

function getPushSettings(db) {
  return {
    autoVcf: db.setting("pushAutoVcf") !== false,
    kodeUnik: db.setting("pushKodeUnik") !== false,
    vcfTarget: db.setting("pushVcfTarget") || "private",
    skipAdmin: db.setting("pushSkipAdmin") === true,
    jeda: db.setting("jedaPush") || 5000,
  };
}

async function handleKelola(m, sock) {
  const db = getDatabase();
  const s = getPushSettings(db);
  const p = m.prefix;

  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({ has_multiple_buttons: true }),
    },
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "⚙️ Alola Push Contacto",
        sections: [
          {
            title: "💾 Auto VCF",
            highlight_label: s.autoVcf ? "ON" : "OFF",
            rows: [
              {
                title: `${s.autoVcf ? "🔴" : "🟢"} Auto VCF: ${s.autoVcf ? "Desactivar" : "Activar"}`,
                id: `${p}${s.autoVcf ? "autovcf_off" : "autovcf_on"}`,
                description: "Simpan contacto a VCF automáticamente después de push",
              },
            ],
          },
          {
            title: "🔑 Kode Unik",
            highlight_label: s.kodeUnik ? "ON" : "OFF",
            rows: [
              {
                title: `${s.kodeUnik ? "🔴" : "🟢"} Kode Unik: ${s.kodeUnik ? "Desactivar" : "Activar"}`,
                id: `${p}${s.kodeUnik ? "kodeunik_off" : "kodeunik_on"}`,
                description: "Tambah kode random di akhir mensaje",
              },
            ],
          },
          {
            title: "📱 Target VCF",
            highlight_label: s.vcfTarget === "private" ? "Private" : "Group",
            rows: [
              {
                title: `${s.vcfTarget === "private" ? "✅" : "⬜"} Envía a Private Chat`,
                id: `${p}vcftarget_private`,
                description: "VCF dienvía a chat pribadi owner",
              },
              {
                title: `${s.vcfTarget === "group" ? "✅" : "⬜"} Envía a Group Chat`,
                id: `${p}vcftarget_group`,
                description: "VCF dienvía a group chat",
              },
            ],
          },
          {
            title: "👑 Skip Admin",
            highlight_label: s.skipAdmin ? "ON" : "OFF",
            rows: [
              {
                title: `${s.skipAdmin ? "🔴" : "🟢"} Skip Admin: ${s.skipAdmin ? "Desactivar" : "Activar"}`,
                id: `${p}${s.skipAdmin ? "skipadmin_off" : "skipadmin_on"}`,
                description: "Lewati admin grup cuando push",
              },
            ],
          },
          {
            title: "⏱️ Jeda Push",
            highlight_label: `${(s.jeda / 1000).toFixed(0)}s`,
            rows: [
              {
                title: "⚡ 3 Segundo",
                id: `${p}setjedapush 3000`,
                description: "Cepat, rcontenidoko ban tinggi",
              },
              {
                title: "🔄 5 Segundo",
                id: `${p}setjedapush 5000`,
                description: "Normal, rekomendasi",
              },
              {
                title: "🛡️ 10 Segundo",
                id: `${p}setjedapush 10000`,
                description: "Aman de ban",
              },
              {
                title: "🐢 15 Segundo",
                id: `${p}setjedapush 15000`,
                description: "Sangat aman",
              },
            ],
          },
        ],
        has_multiple_buttons: true,
      }),
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "📢 Mulai Push",
        id: `${p}pushcontacto_start`,
      }),
    },
  ];

  return sock.sendMessage(
    m.chat,
    nativeFlowMsg(
      m,
      `⚙️ *KELOLA PUSH KONTAK*

` +
      `📋 *SETTING SAAT INI*\n\n` +
      `💾 Auto VCF: *${s.autoVcf ? "✅ ON" : "❌ OFF"}*\n` +
      `🔑 Kode Unik: *${s.kodeUnik ? "✅ ON" : "❌ OFF"}*\n` +
      `📱 VCF Target: *${s.vcfTarget === "private" ? "Private" : "Group"}*\n` +
      `👑 Skip Admin: *${s.skipAdmin ? "✅ ON" : "❌ OFF"}*\n` +
      `⏱️ Jeda: *${s.jeda}ms (${(s.jeda / 1000).toFixed(1)}s)*\n\n` +
      `📌 *Selecciona del botón de abajo para cambiar la configuración*`,
      buttons,
    ),
    { quoted: m },
  );
}

async function handleSettingToggle(m, settingKey, label, onVal, offVal) {
  const db = getDatabase();
  const cmd = m.command?.toLowerCase();
  const isOn = cmd.endsWith("_on");
  db.setting(settingKey, isOn ? onVal : offVal);
  m.react(isOn ? "✅" : "🔴");
  await m.reply(
    `${isOn ? "✅" : "🔴"} *${label} ${isOn ? "DINYALAKAN" : "DIMATIKAN"}*

` + `⚙️ *${label}:* ${isOn ? "ON" : "OFF"}`,
  );
}

async function handleSetJeda(m, sock) {
  const db = getDatabase();
  const val = parseInt(m.args[1] || m.args[0]);

  if (!val || isNaN(val)) {
    const current = db.setting("jedaPush") || 5000;
    const buttons = [
      {
        name: "single_select",
        buttonParamsJson: JSON.stringify({ has_multiple_buttons: true }),
      },
      {
        name: "single_select",
        buttonParamsJson: JSON.stringify({
          title: "⏱️ Pilih Jeda",
          sections: [
            {
              title: "⏱️ Rekomendasi Jeda Push Contacto",
              highlight_label: "Rekomendasi",
              rows: [
                {
                  title: "⚡ 3 Segundo (Cepat)",
                  id: `${m.prefix}setjedapush 3000`,
                  description: "Rcontenidoko ban más alto",
                },
                {
                  title: "🔄 5 Segundo (Normal)",
                  id: `${m.prefix}setjedapush 5000`,
                  description: "Rekomendasi para peentoncesian umum",
                },
                {
                  title: "🛡️ 10 Segundo (Aman)",
                  id: `${m.prefix}setjedapush 10000`,
                  description: "Paling aman de rcontenidoko ban",
                },
                {
                  title: "🐢 15 Segundo (Sangat Aman)",
                  id: `${m.prefix}setjedapush 15000`,
                  description: "Para grup besar 500+ member",
                },
                {
                  title: "🏔️ 30 Segundo (Maksimal)",
                  id: `${m.prefix}setjedapush 30000`,
                  description: "Pausa más larga",
                },
              ],
            },
          ],
          has_multiple_buttons: true,
        }),
      },
    ];
    return sock.sendMessage(
      m.chat,
      nativeFlowMsg(
        m,
        `⏱️ *SET JEDA PUSH KONTAK*\n\n` +
        `📋 *Mengatur interval antar pengiriman mensaje*\n\n` +
        `⏱️ *Jeda actualmente:* ${current}ms (${(current / 1000).toFixed(1)} segundo)\n\n` +
        `*PENGGUNAAN:*\n` +
        `📝 *${m.prefix}setjedapush <milisegundo>* — Cambiando jeda push\n\n` +
        `*PENJELASAN:*\n` +
        `1. La pausa es el tiempo de espera entre el envío de mensajes a cada miembro\n` +
        `2. Cuanto menor sea la pausa, más rápido termina el push, pero el riesgo de ser bloqueado es mayor\n` +
        `3. Rekomendasi mestomal *3000ms* (3 segundo) agar aman\n` +
        `4. Nilai maksimal *30000ms* (30 segundo)\n\n` +
        `📌 *Selecciona la pausa del botón de abajo o escribe manual*`,
        buttons,
      ),
      { quoted: m },
    );
  }

  if (val < 1000 || val > 30000) {
    return m.reply(`❌ *GAGAL*\n\n🚫 *Jeda debe antara 1000ms - 30000ms*`);
  }

  db.setting("jedaPush", val);
  m.react("✅");
  return m.reply(
    `✅ *JEDA DIUBAH*\n\n` +
    `⏱️ *Jeda nuevo:* ${val}ms (${(val / 1000).toFixed(1)} segundo)`,
  );
}

async function handlePush(m, sock) {
  const db = getDatabase();
  const groupMode = getGroupMode(m.chat, db);

  if (groupMode !== "pushcontacto" && groupMode !== "all") {
    const buttons = [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "🔓 Activokan Mode Pushcontacto",
          id: `${m.prefix}botmode pushcontacto`,
        }),
      },
    ];
    return sock.sendMessage(
      m.chat,
      nativeFlowMsg(
        m,
        `❌ *MODE TIDAK SESUAI*\n\n` +
        `🔒 *Grup esto aún no en mode pushcontacto*\n\n` +
        `*CARA AKTIVASI:*\n` +
        `1. Presiona el botón de abajo para activar el modo pushcontacto\n` +
        `2. Después de mode berubah, ulangi comando push contacto`,
        buttons,
      ),
      { quoted: m },
    );
  }

  const text = m.text?.trim();

  if (text) {
    return startPush(m, sock, text);
  }

  const s = getPushSettings(db);
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({ has_multiple_buttons: true }),
    },
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "📋 Pilih Fesor",
        sections: [
          {
            title: "📢 Aksi",
            highlight_label: "Push Contacto",
            rows: [
              {
                title: "📢 Mulai Push (Sesi Input)",
                id: `${m.prefix}pushcontacto_start`,
                description: "Input mensaje lalu push a todos los miembros",
              },
              {
                title: "⏹️ Stop Push",
                id: `${m.prefix}stoppush`,
                description: "Detener el push que está en ejecución",
              },
            ],
          },
          {
            title: "⚙️ Alola Cepat",
            highlight_label: "Setting",
            rows: [
              {
                title: "⚙️ Alola Push Contacto",
                id: `${m.prefix}alolapush`,
                description: `VCF:${s.autoVcf ? "ON" : "OFF"} | Kode:${s.kodeUnik ? "ON" : "OFF"} | Jeda:${(s.jeda / 1000).toFixed(0)}s`,
              },
              {
                title: "⏱️ Set Jeda Push",
                id: `${m.prefix}setjedapush`,
                description: `Jeda actualmente: ${s.jeda}ms`,
              },
            ],
          },
        ],
        has_multiple_buttons: true,
      }),
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "⚙️ Alola",
        id: `${m.prefix}alolapush`,
      }),
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "📢 Mulai Push",
        id: `${m.prefix}pushcontacto_start`,
      }),
    },
  ];
  return sock.sendMessage(
    m.chat,
    nativeFlowMsg(
      m,
      `📢 *PUSH KONTAK*\n\n` +
      `📋 *Envía mensaje a todos los miembros grup de forma automáticamente + simpan contacto a file VCF*\n\n` +
      `*PENGGUNAAN:*\n` +
      `📝 *${m.prefix}pushcontacto <mensaje>* — Push langsung con mensaje\n` +
      `📢 *${m.prefix}pushcontacto* — Buka menu interactivo\n` +
      `⏹️ *${m.prefix}stoppush* — Detener el push que está en ejecución\n` +
      `⏱️ *${m.prefix}setjedapush <ms>* — Atur jeda antar pengiriman\n\n` +
      `*PENJELASAN ALUR PENGGUNAAN:*\n` +
      `1. Pastikan grup en mode pushcontacto: *${m.prefix}botmode pushcontacto*\n` +
      `2. Escribe *${m.prefix}pushcontacto* lalu pilih "Mulai Push" de menu\n` +
      `3. El bot te pedirá que ingreses el mensaje que quieres enviar mediante reply\n` +
      `4. Después de confirmar, el bot enviará el mensaje a cada miembro uno por uno\n` +
      `5. A cada mensaje se le agrega un código único para ser detectado diferente por WhatsApp\n` +
      `6. Después de completar, el bot enviará automáticamente un archivo VCF con todos los contactos de los miembros\n\n` +
      `*INFO:*\n` +
      `📋 *SETTING*\n\n` +
      `💾 Auto VCF: *${s.autoVcf ? "✅ ON" : "❌ OFF"}*\n` +
      `🔑 Kode Unik: *${s.kodeUnik ? "✅ ON" : "❌ OFF"}*\n` +
      `📱 VCF Target: *${s.vcfTarget === "private" ? "Private" : "Group"}*\n` +
      `👑 Skip Admin: *${s.skipAdmin ? "✅ ON" : "❌ OFF"}*\n` +
      `⏱️ Jeda: *${s.jeda}ms (${(s.jeda / 1000).toFixed(1)}s)*\n\n` +
      `🔑 *Akses:* Owner only`,
      buttons,
    ),
    { quoted: m },
  );
}

async function handleStartSession(m, sock) {
  const db = getDatabase();
  const groupMode = getGroupMode(m.chat, db);

  if (groupMode !== "pushcontacto" && groupMode !== "all") {
    return m.reply(
      `❌ *GAGAL*\n\n🔒 *Activa el modo pushcontacto primero*\n\n📝 *${m.prefix}botmode pushcontacto*`,
    );
  }

  if (global.statuspush) {
    return m.reply(
      `❌ *GAGAL*\n\n🔄 *Push de contactos está en ejecución*\n\n⏹️ *Escribe* ${m.prefix}stoppush *para detenerlo*`,
    );
  }

  if (getSession(m.sender)) {
    return m.reply(
      `📝 *Sesión de push ya activa*\n\n📩 *Responde al mensaje anterior con el mensaje que quieres enviar*\n\n❌ *O responde* \`batal\` *para cancelar*`,
    );
  }

  const session = createSession(m.sender, m.chat);

  const sent = await m.reply(
    `📢 *SESI PUSH KONTAK*\n\n` +
    `📝 *Langkah 1/2 — Input Mensaje*\n\n` +
    `🔤 *Envía el mensaje que quieres enviar a todos los miembros*\n\n` +
    `📩 *Responde a este mensaje con el mensaje que quieres enviar*\n\n` +
    `❌ *Reply* \`batal\` *para cancelar sesi*`,
  );

  session.promptId = sent?.key?.id || null;
  m.react("📝");
}

async function startPush(m, sock, text) {
  if (global.statuspush) {
    return m.reply(
      `❌ *GAGAL*\n\n🔄 *Push de contactos está en ejecución*\n\n⏹️ *Escribe* ${m.prefix}stoppush *para detenerlo*`,
    );
  }

  m.react("📢");

  try {
    const db = getDatabase();
    const metadata = m.groupMetadata;
    const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    const s = getPushSettings(db);
    const participants = resolveParticipants(
      metadata,
      botId,
      m.sender,
      s.skipAdmin,
    );

    if (participants.length === 0) {
      m.react("❌");
      return m.reply(
        `❌ *GAGAL*\n\n🚫 *No hay miembros a los que se les pueda enviar el mensaje*`,
      );
    }

    const jedaPush = s.jeda;
    const estimasi = Math.ceil((participants.length * jedaPush) / 60000);

    const buttons = [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "⏹️ Stop Push",
          id: `${m.prefix}stoppush`,
        }),
      },
    ];

    await sock.sendMessage(
      m.chat,
      nativeFlowMsg(
        m,
        `📢 *PUSH KONTAK DIMULAI*\n\n` +
        `📝 *Mensaje:* ${text.substring(0, 80)}${text.length > 80 ? "..." : ""}\n` +
        `👥 *Target:* ${participants.length} miembros\n` +
        `⏱️ *Jeda:* ${jedaPush}ms\n` +
        `📊 *Estimasi:* ${estimasi} minuto\n` +
        `💾 *Auto VCF:* ${s.autoVcf ? "ON" : "OFF"} | 🔑 *Kode Unik:* ${s.kodeUnik ? "ON" : "OFF"}\n\n` +
        `🔄 *Estociando push...*`,
        buttons,
      ),
      { quoted: m },
    );

    global.statuspush = true;
    let success = 0;
    let failed = 0;
    const saved = [];

    for (const member of participants) {
      if (global.stoppush) {
        delete global.stoppush;
        delete global.statuspush;
        await m.reply(
          `⏹️ *PUSH DIHENTIKAN*\n\n` +
          `✅ *Éxito:* ${success}\n` +
          `❌ *Fallo:* ${failed}\n` +
          `⏸️ *Sisa:* ${participants.length - success - failed}`,
        );
        if (saved.length > 0 && s.autoVcf) {
          const vcfTarget = s.vcfTarget === "group" ? m.chat : m.sender;
          await sendVcf(sock, vcfTarget, saved, metadata.subject);
        }
        return;
      }

      try {
        const msgText = s.kodeUnik ? `${text}\n\n#${serial(6)}` : text;
        await sock.sendMessage(member, { text: msgText });
        saved.push(member);
        success++;
      } catch {
        failed++;
      }

      await new Promise((r) => setTimeout(r, jedaPush));
    }

    delete global.statuspush;
    if (saved.length > 0 && s.autoVcf) {
      const vcfTarget = s.vcfTarget === "group" ? m.chat : m.sender;
      await sendVcf(sock, vcfTarget, saved, metadata.subject);
    }

    m.react("✅");

    const doneButtons = [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "📢 Push Ulang",
          id: `${m.prefix}pushcontacto_start`,
        }),
      },
    ];

    await sock.sendMessage(
      m.chat,
      nativeFlowMsg(
        m,
        `✅ *PUSH SELESAI*\n\n` +
        `✅ *Éxito:* ${success}\n` +
        `❌ *Fallo:* ${failed}\n` +
        `📊 *Total:* ${participants.length}\n` +
        `💾 *Contacto:* ${saved.length} dcontenidompan\n\n` +
        `📱 *File VCF ha dienvía a chat pribadi*`,
        doneButtons,
      ),
      { quoted: m },
    );
  } catch (error) {
    delete global.statuspush;
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

async function pushkontakAnswerHandler(m, sock) {
  if (!m.body) return false;
  if (m.isCommand) return false;

  const session = getSession(m.sender);
  if (!session) return false;
  if (m.chat !== session.chatJid) return false;

  const text = m.body.trim();
  const lowText = text.toLowerCase();

  if (["batal", "cancel", "batalkan"].includes(lowText)) {
    clearSession(m.sender);
    await m.reply(
      `❌ *Sesi push contacto dibatalkan*\n\n📢 *Escribe* ${m.prefix}pushcontacto *para estociando de nuevo*`,
    );
    return true;
  }

  if (session.step === "message") {
    if (text.length < 1) {
      await m.reply(
        `❌ *El mensaje no puede estar vacío*\n\n📩 *Responde de nuevo con un mensaje válido*`,
      );
      return true;
    }

    session.message = text;
    session.step = "confirm";

    const db = getDatabase();
    const metadata = m.groupMetadata;
    const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    const s = getPushSettings(db);
    const participants = resolveParticipants(
      metadata,
      botId,
      m.sender,
      s.skipAdmin,
    );
    const jedaPush = s.jeda;
    const estimasi = Math.ceil((participants.length * jedaPush) / 60000);

    const sent = await m.reply(
      `✅ *LANGKAH 2/2 — KONFIRMASI*\n\n` +
      `📝 *Mensaje:* ${text.substring(0, 100)}${text.length > 100 ? "..." : ""}\n` +
      `👥 *Target:* ${participants.length} miembros\n` +
      `⏱️ *Jeda:* ${jedaPush}ms\n` +
      `📊 *Estimasi:* ${estimasi} minuto\n\n` +
      `*Reply mensaje esto con:*\n` +
      `✅ *ya* — Mulai push ahora\n` +
      `📝 *ubah* — cambia el mensaje que quieres enviar\n` +
      `❌ *batal* — Batalkan sesi`,
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "confirm") {
    if (
      ["ya", "y", "iya", "yes", "lanjut", "confirm", "ok"].includes(lowText)
    ) {
      const pushMessage = session.message;
      clearSession(m.sender);
      await startPush(m, sock, pushMessage);
      return true;
    }

    if (["ubah", "edit", "ganti", "revcontenido"].includes(lowText)) {
      session.step = "message";
      const sent = await m.reply(
        `📝 *UBAH PESAN*\n\n` +
        `🔤 *Envía el mensaje nuevo que quieres enviar*\n\n` +
        `📩 *Reply mensaje esto con mensaje nuevo*\n\n` +
        `❌ *Reply* \`batal\` *para cancelar*`,
      );
      session.promptId = sent?.key?.id || session.promptId;
      return true;
    }

    await m.reply(
      `❌ *Reply no válido*\n\n📩 *Reply con:* \`ya\`, \`ubah\`, o \`batal\``,
    );
    return true;
  }

  return false;
}

async function handler(m, { sock }) {
  const cmd = m.command?.toLowerCase();
  if (cmd === "stoppush") return handleStop(m);
  if (cmd === "setjedapush") return handleSetJeda(m, sock);
  if (cmd === "pushcontacto_start") return handleStartSession(m, sock);
  if (cmd === "alolapush") return handleKelola(m, sock);
  if (cmd === "autovcf_on" || cmd === "autovcf_off")
    return handleSettingToggle(m, "pushAutoVcf", "Auto VCF", true, false);
  if (cmd === "kodeunik_on" || cmd === "kodeunik_off")
    return handleSettingToggle(m, "pushKodeUnik", "Kode Unik", true, false);
  if (cmd === "vcftarget_private")
    return handleSettingToggle(
      m,
      "pushVcfTarget",
      "VCF Target",
      "private",
      "private",
    );
  if (cmd === "vcftarget_group")
    return handleSettingToggle(
      m,
      "pushVcfTarget",
      "VCF Target",
      "group",
      "group",
    );
  if (cmd === "skipadmin_on" || cmd === "skipadmin_off")
    return handleSettingToggle(m, "pushSkipAdmin", "Skip Admin", true, false);
  return handlePush(m, sock);
}

export { pluginConfig as config, handler, pushkontakAnswerHandler };
