import axios from "axios";
import { getDatabase } from "../../src/lib/luffy-database.js";
import te from "../../src/lib/luffy-error.js";
import { prepareWAMessageMedia, generateWAMessageFromContent } from "ourin";

const pluginConfig = {
  name: ["gachawaifu", "waifuaction", "tinggalinwaifu", "waifuku", "istriku"],
  alias: ["gachaistri"],
  category: "fun",
  description: "¡Gacha la waifu de tus sueños, cuida sus sentimientos y hazla tu pareja!",
  usage: ".gachawaifu | .waifuku | .tinggalinwaifu",
  example: ".gachawaifu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 2,
  isEnabled: true,
};

// semoga  aja game ini seru

const waifuPool = [
  // Common (50% weight)
  { name: "Sakura Haruno", age: 16, height: "161 cm", weight: "45 kg", tier: "Common", keyword: "Sakura Haruno aesthetic icon", weightChance: 50 },
  { name: "Hinata Hyuga", age: 16, height: "160 cm", weight: "45 kg", tier: "Common", keyword: "Hinata Hyuga aesthetic anime", weightChance: 50 },
  { name: "Asuna Yuuki", age: 17, height: "168 cm", weight: "55 kg", tier: "Common", keyword: "Asuna Yuuki icon", weightChance: 50 },
  { name: "Ochako Uraraka", age: 15, height: "156 cm", weight: "43 kg", tier: "Common", keyword: "Ochako Uraraka aesthetic", weightChance: 50 },
  { name: "Nobara Kugisaki", age: 16, height: "160 cm", weight: "45 kg", tier: "Common", keyword: "Nobara Kugisaki anime icon", weightChance: 50 },
  { name: "Nami", age: 20, height: "170 cm", weight: "50 kg", tier: "Common", keyword: "Nami one piece aesthetic", weightChance: 50 },
  { name: "Nico Robin", age: 30, height: "188 cm", weight: "60 kg", tier: "Common", keyword: "Nico Robin aesthetic", weightChance: 50 },
  { name: "Rukia Kuchiki", age: 15, height: "144 cm", weight: "33 kg", tier: "Common", keyword: "Rukia Kuchiki icon", weightChance: 50 },
  { name: "Chizuru Mizuhara", age: 20, height: "162 cm", weight: "48 kg", tier: "Common", keyword: "Chizuru Mizuhara aesthetic", weightChance: 50 },
  { name: "Ruka Sarashina", age: 18, height: "153 cm", weight: "43 kg", tier: "Common", keyword: "Ruka Sarashina icon", weightChance: 50 },
  { name: "Lucy Heartfilia", age: 17, height: "165 cm", weight: "47 kg", tier: "Common", keyword: "Lucy Heartfilia aesthetic icon", weightChance: 50 },
  { name: "Erza Scarlet", age: 19, height: "169 cm", weight: "50 kg", tier: "Common", keyword: "Erza Scarlet aesthetic icon", weightChance: 50 },

  // Rare (30% weight)
  { name: "Miku Nakano", age: 17, height: "165 cm", weight: "49 kg", tier: "Rare", keyword: "Miku Nakano aesthetic icon", weightChance: 30 },
  { name: "Nino Nakano", age: 17, height: "165 cm", weight: "49 kg", tier: "Rare", keyword: "Nino Nakano aesthetic icon", weightChance: 30 },
  { name: "Yotsuba Nakano", age: 17, height: "165 cm", weight: "49 kg", tier: "Rare", keyword: "Yotsuba Nakano icon", weightChance: 30 },
  { name: "Itsuki Nakano", age: 17, height: "165 cm", weight: "49 kg", tier: "Rare", keyword: "Itsuki Nakano icon", weightChance: 30 },
  { name: "Ichika Nakano", age: 17, height: "165 cm", weight: "49 kg", tier: "Rare", keyword: "Ichika Nakano icon", weightChance: 30 },
  { name: "Rem", age: 17, height: "154 cm", weight: "45 kg", tier: "Rare", keyword: "Rem ReZero aesthetic", weightChance: 30 },
  { name: "Ram", age: 17, height: "154 cm", weight: "45 kg", tier: "Rare", keyword: "Ram ReZero aesthetic", weightChance: 30 },
  { name: "Shinobu Kocho", age: 18, height: "151 cm", weight: "37 kg", tier: "Rare", keyword: "Shinobu Kocho aesthetic", weightChance: 30 },
  { name: "Mitsuri Kanroji", age: 19, height: "167 cm", weight: "56 kg", tier: "Rare", keyword: "Mitsuri Kanroji aesthetic", weightChance: 30 },
  { name: "Nezuko Kamado", age: 14, height: "153 cm", weight: "45 kg", tier: "Rare", keyword: "Nezuko Kamado aesthetic", weightChance: 30 },
  { name: "Kaguya Shinomiya", age: 17, height: "158 cm", weight: "46 kg", tier: "Rare", keyword: "Kaguya Shinomiya aesthetic", weightChance: 30 },

  // Epic (15% weight)
  { name: "Elaina", age: 18, height: "155 cm", weight: "45 kg", tier: "Epic", keyword: "Elaina wandering witch aesthetic icon", weightChance: 15 },
  { name: "Yor Forger", age: 27, height: "170 cm", weight: "55 kg", tier: "Epic", keyword: "Yor Forger aesthetic icon", weightChance: 15 },
  { name: "Makima", age: 24, height: "173 cm", weight: "58 kg", tier: "Epic", keyword: "Makima aesthetic icon", weightChance: 15 },
  { name: "Power", age: 17, height: "170 cm", weight: "52 kg", tier: "Epic", keyword: "Power chainsaw man aesthetic", weightChance: 15 },
  { name: "Aqua", age: 17, height: "158 cm", weight: "47 kg", tier: "Epic", keyword: "Aqua konosuba aesthetic", weightChance: 15 },
  { name: "Hu Tao", age: 18, height: "155 cm", weight: "46 kg", tier: "Epic", keyword: "Hu Tao aesthetic icon", weightChance: 15 },
  { name: "Raiden Shogun", age: 500, height: "170 cm", weight: "55 kg", tier: "Epic", keyword: "Raiden Shogun aesthetic icon", weightChance: 15 },
  { name: "Furina", age: 500, height: "155 cm", weight: "45 kg", tier: "Epic", keyword: "Furina aesthetic icon", weightChance: 15 },
  { name: "Ganyu", age: 3000, height: "158 cm", weight: "48 kg", tier: "Epic", keyword: "Ganyu aesthetic icon", weightChance: 15 },
  { name: "Kafka", age: 25, height: "170 cm", weight: "55 kg", tier: "Epic", keyword: "Kafka honkai star rail aesthetic", weightChance: 15 },
  { name: "Firefly", age: 20, height: "158 cm", weight: "47 kg", tier: "Epic", keyword: "Firefly honkai star rail aesthetic", weightChance: 15 },

  // Legendary (5% weight)
  { name: "Zero Two", age: 16, height: "170 cm", weight: "55 kg", tier: "Legendary", keyword: "Zero Two aesthetic icon", weightChance: 5 },
  { name: "Kurumi Tokisaki", age: 17, height: "157 cm", weight: "46 kg", tier: "Legendary", keyword: "Kurumi Tokisaki aesthetic", weightChance: 5 },
  { name: "Saber (Artoria)", age: 24, height: "154 cm", weight: "42 kg", tier: "Legendary", keyword: "Saber Artoria Pendragon icon", weightChance: 5 },
  { name: "Frieren", age: 1000, height: "152 cm", weight: "40 kg", tier: "Legendary", keyword: "Frieren aesthetic icon", weightChance: 5 },
  { name: "Hoshino Ai", age: 20, height: "151 cm", weight: "42 kg", tier: "Legendary", keyword: "Hoshino Ai aesthetic icon", weightChance: 5 },
  { name: "Eula", age: 22, height: "172 cm", weight: "53 kg", tier: "Legendary", keyword: "Eula aesthetic icon", weightChance: 5 },
  { name: "Rias Gremory", age: 18, height: "172 cm", weight: "58 kg", tier: "Legendary", keyword: "Rias Gremory aesthetic icon", weightChance: 5 },
  { name: "Akeno Himejima", age: 18, height: "168 cm", weight: "54 kg", tier: "Legendary", keyword: "Akeno Himejima aesthetic icon", weightChance: 5 },
  { name: "Esdeath", age: 20, height: "170 cm", weight: "56 kg", tier: "Legendary", keyword: "Esdeath aesthetic icon", weightChance: 5 },
];

async function getWaifuImage(keyword) {
  try {
    const res = await axios.get(`https://api.cuki.biz.id/api/search/pinterest?apikey=cuki-x&query=${encodeURIComponent(keyword)}&type=image`);
    const results = res.data?.data?.results;
    if (results && results.length > 0) {
      const validImages = results.filter((item) => item.image_url);
      if (validImages.length > 0) {
        const limit = Math.min(15, validImages.length);
        return validImages[Math.floor(Math.random() * limit)].image_url;
      }
    }
  } catch (e) {
    console.error("[GachaWaifu] Pinterest API error:", e.message);
  }
  return "https://i.pinimg.com/736x/8f/3e/2a/8f3e2a77ec65cdbcfad4ff3bc17e825f.jpg";
}

async function getBuffer(url) {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer", timeout: 15000 });
    return Buffer.from(res.data);
  } catch {
    return null;
  }
}

function rollWaifu() {
  const totalWeight = waifuPool.reduce((acc, w) => acc + w.weightChance, 0);
  let random = Math.random() * totalWeight;
  for (const waifu of waifuPool) {
    random -= waifu.weightChance;
    if (random <= 0) return waifu;
  }
  return waifuPool[waifuPool.length - 1];
}

async function sendWaifuMessage(m, sock, waifu, textContent, customButtons = null) {
  let imgBuffer = null;
  if (waifu.imageUrl) {
    imgBuffer = await getBuffer(waifu.imageUrl);
  }
  if (!imgBuffer) {
    const newUrl = await getWaifuImage(waifu.keyword);
    waifu.imageUrl = newUrl;
    imgBuffer = await getBuffer(newUrl) || Buffer.alloc(0);
  }

  const media = await prepareWAMessageMedia(
    { image: imgBuffer },
    { upload: sock.waUploadToServer }
  );

  let buttons = customButtons;
  if (!buttons) {
    if (waifu.affection < 80) {
      buttons = [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚶‍♂️ Paseo", id: `${m.prefix}waifuaction pasear` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "☕ Ir al Café", id: `${m.prefix}waifuaction cafe` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🎬 Cine", id: `${m.prefix}waifuaction cine` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🛍️ Compras", id: `${m.prefix}waifuaction comprar` }) },
      ];
    } else if (waifu.affection < 100) {
      buttons = [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🫂 Abrazo", id: `${m.prefix}waifuaction abrazar` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💋 Beso", id: `${m.prefix}waifuaction besar` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🛏️ Dormir Juntos", id: `${m.prefix}waifuaction dormir` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🛁 Bañarse Juntos", id: `${m.prefix}waifuaction banarse` }) },
      ];
    } else {
      if (!waifu.married) {
        buttons = [
          { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💍 Cásate con Ella", id: `${m.prefix}waifuaction casarse` }) },
          { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💝 Pedir Regalo", id: `${m.prefix}waifuaction regalo` }) },
        ];
      } else {
        buttons = [
          { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "👨‍👩‍👦 Cariños", id: `${m.prefix}waifuaction carino` }) },
          { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💌 Halaga a tu Esposa", id: `${m.prefix}waifuaction halagar` }) },
        ];
      }
    }
  }

  let footerText = "❤️ ¡Sigue cuidando sus sentimientos!";
  if (customButtons) footerText = "💭 Ella espera tu respuesta...";
  else if (waifu.married) footerText = "❤️ ¡Ya te casaste con ella!";

  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2,
        },
        interactiveMessage: {
          body: { text: textContent },
          footer: { text: footerText },
          header: {
            title: `🌟 *${waifu.tier.toUpperCase()} TIER WAIFU* 🌟`,
            subtitle: waifu.name,
            hasMediaAttachment: true,
            imageMessage: media.imageMessage
          },
          nativeFlowMessage: { buttons }
        }
      }
    }
  }, { quoted: m });

  await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  if (!user) return;

  const cmd = m.command.toLowerCase();
  if (cmd === "waifuku" || cmd === "istriku") {
    if (!user.waifu) {
      return m.reply(`⚠️ *¡Aún no tienes waifu!*\nEscribe *${m.prefix}gachawaifu* para comenzar!`);
    }
    m.react("🕕");
    const waifu = user.waifu;
    let statusPercasarsean = waifu.married ? "Casada 💍" : "En Conquista 💖";
    const textContent = `📸 *ESTADO DE TU WAIFU* 📸\n\n` +
      `💖 *Nombre Completo:* ${waifu.name}\n` +
      `🎂 *Edad:* ${waifu.age} años\n` +
      `💎 *Tier:* ${waifu.tier}\n` +
      `💞 *Affection:* ${waifu.affection}/100\n` +
      `💍 *Estado:* ${statusPercasarsean}\n\n` +
      `¡Continúa la interacción eligiendo una de las acciones de cita de abajo!`;

    m.react("✅");
    return await sendWaifuMessage(m, sock, waifu, textContent, null);
  }
  if (cmd === "tinggalinwaifu") {
    if (!user.waifu) {
      return m.reply(`⚠️ *¡Ni siquiera tienes waifu!* ¿Qué vas a dejar? ¿Alucinas?`);
    }

    const waifuName = user.waifu.name;
    const waifuJid = 'waifu_' + waifuName.replace(/\s+/g, '') + '@s.whatsapp.net';
    if (user.waifu.married) {
      if (user.fun && user.fun.pasangan === waifuJid) {
        user.fun.pasangan = "";
      }
      db.setUser(waifuJid, { fun: { pasangan: "" } });
    }

    delete user.waifu;
    db.setUser(m.sender, user);

    m.react("💔");
    return m.reply(
      `💔 *DECIDISTE DEJAR A ${waifuName.toUpperCase()}!*\n\n` +
      `Empacas tus cosas y le dices que esta relación ya no puede continuar. ` +
      `Ella llora desconsolada y te suplica que te quedes, pero tu corazón ya está congelado.\n\n` +
      `Ahora oficialmente están separados.`
    );
  }
  if (cmd === "gachawaifu" || cmd === "gachaistri") {
    if (user.waifu) {
      m.react("😡");
      let mensajeEstado = user.waifu.married ? "¡Ya es tu esposa!" : "¡Te quiere muchísimo!";
      return m.reply(
        `⚠️ *¡Ya tienes una waifu!*\n\n` +
        `Nombre: *${user.waifu.name}*\n` +
        `Tier: *${user.waifu.tier}*\n` +
        `Affection: *${user.waifu.affection}/100*\n\n` +
        `¡No seas codicioso! Cuida la waifu que tienes. ${mensajeEstado} Escribe *${m.prefix}waifuku* para interactuar con ella.`
      );
    }

    const sub = (m.args[0] || "").toLowerCase();

    if (sub !== "start") {
      const guia = `💕 *SISTEMA GACHA DE WAIFU* 💕\n\n` +
        `Simulación interactiva de citas virtuales. ¡Consigue la waifu de tus sueños, conquista su corazón y cásate con ella!\n\n` +
        `*USO DE COMANDOS:*\n` +
        `• *${m.prefix}gachawaifu* — Abre este menú de guía\n` +
        `• *${m.prefix}waifuku* — Abre el panel de interacción con tu waifu\n` +
        `• *${m.prefix}tinggalinwaifu* — Deja a tu waifu y reinicia el estado\n\n` +
        `*EXPLICACIÓN DE LA HISTORIA:*\n` +
        `1. Pulsa el botón **Empezar Gacha** de abajo para conseguir tu primera waifu.\n` +
        `2. Habrá 3 Fases de Relación según los Puntos de Amor (Affection).\n` +
        `3. *Fase de Conquista (< 80)*: Haz acciones estándar (Cita, Café). ¡Tus elecciones de paseo afectarán el *estado de ánimo* de la waifu!\n` +
        `4. *Fase Íntima (80 - 99)*: Se abren las interacciones físicas. ¡Cuidado, si eres atrevido cuando el affection aún es bajo, se enojará mucho!\n` +
        `5. *Fase de Matrimonio (100)*: Alcanza el affection máximo y cásate con ella para obtener una *Recompensa Exclusiva* con muchos berry y limit!`;

      const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
            interactiveMessage: {
              body: { text: guia },
              footer: { text: "¡Pulsa el botón de abajo para empezar a buscar a tu media naranja!" },
              nativeFlowMessage: {
                buttons: [
                  { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🎲 ¡Empezar Gacha Ahora!", id: `${m.prefix}gachawaifu start` }) }
                ]
              }
            }
          }
        }
      }, { quoted: m });
      return await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    }

    m.react("🕕");
    try {
      const waifuData = rollWaifu();
      const waifu = {
        ...waifuData,
        affection: 50,
        married: false,
        imageUrl: await getWaifuImage(waifuData.keyword)
      };

      user.waifu = waifu;
      db.setUser(m.sender, user);

      const textContent = `🎉 *¡FELICIDADES! ¡CONSEGUISTE UNA NUEVA WAIFU!* 🎉\n\n` +
        `💖 *Nombre Completo:* ${waifu.name}\n` +
        `🎂 *Edad:* ${waifu.age} años\n` +
        `📏 *Altura:* ${waifu.height}\n` +
        `⚖️ *Peso:* ${waifu.weight}\n` +
        `💎 *Tier:* ${waifu.tier}\n` +
        `💞 *Affection:* ${waifu.affection}/100\n\n` +
        `Elige una interacción (cita) de abajo para empezar a conquistarla y subir sus puntos de amor. ¡Cuidado de que no se agoten!`;

      m.react("✅");
      await sendWaifuMessage(m, sock, waifu, textContent, null);
    } catch (err) {
      console.error(err);
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
    return;
  }
  if (cmd === "waifuaction") {
    if (!user.waifu) {
      m.react("❌");
      return m.reply(`¡Aún no tienes waifu! Escribe *${m.prefix}gachawaifu* para conseguir tu primera waifu.`);
    }

    const action = (m.args[0] || "").toLowerCase();
    let waifu = user.waifu;
    let responseText = "";
    let affectionChange = 0;
    if (action === "pasear") {
      return sendWaifuMessage(m, sock, waifu, `Invitas a *${waifu.name}* a pasear contigo. ¿A dónde quieres ir hoy?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🌳 Al Parque", id: `${m.prefix}waifuaction cita_parque` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🏢 Al Mall", id: `${m.prefix}waifuaction cita_centro` }) }
      ]);
    }
    if (action === "cafe") {
      return sendWaifuMessage(m, sock, waifu, `Van a un café de moda en la ciudad. ¿Qué bebida quieres pedirle?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "☕ Café Amargo", id: `${m.prefix}waifuaction cita_cafe` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🍵 Matcha Latte", id: `${m.prefix}waifuaction cita_matcha` }) }
      ]);
    }
    if (action === "cine") {
      return sendWaifuMessage(m, sock, waifu, `Están frente a la taquilla del cine. ¿De qué género quieres la película?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💞 Romántica", id: `${m.prefix}waifuaction cita_romantica` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "👻 Terror", id: `${m.prefix}waifuaction cita_terror` }) }
      ]);
    }
    if (action === "comprar") {
      return sendWaifuMessage(m, sock, waifu, `Recorren un centro comercial exclusivo. ¿Qué regalo quieres comprarle?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "👗 Ropa Bonita", id: `${m.prefix}waifuaction cita_ropa` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💎 Joyas", id: `${m.prefix}waifuaction cita_joyas` }) }
      ]);
    }
    const rejectIntimate = async () => {
      waifu.affection -= (Math.floor(Math.random() * 30) + 30);
      if (waifu.affection < 0) waifu.affection = 0;
      let outText = `💢 *¡ZAS!* Intentas ser atrevido con *${waifu.name}*, pero ella siente que aún no están tan cerca! ¡Te da una bofetada fuerte y te regaña!`;
      await processAffection(outText, waifu.affection);
    };

    if (["abrazar", "besar", "dormir", "banarse"].includes(action) && waifu.affection < 80) {
      return await rejectIntimate();
    }

    if (action === "abrazar") {
      return sendWaifuMessage(m, sock, waifu, `Miras a *${waifu.name}* que está distraída. ¿Cómo la abrazarás?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🤗 Por Detrás", id: `${m.prefix}waifuaction intimo_detras` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💑 De Frente", id: `${m.prefix}waifuaction intimo_frente` }) }
      ]);
    }
    if (action === "besar") {
      return sendWaifuMessage(m, sock, waifu, `Sus caras están muy cerca, su respiración se siente en tu rostro. ¿Dónde la besarás?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "😚 La Frente", id: `${m.prefix}waifuaction intimo_mejilla` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💋 Los Labios", id: `${m.prefix}waifuaction intimo_labios` }) }
      ]);
    }
    if (action === "dormir") {
      return sendWaifuMessage(m, sock, waifu, `Se recuestan en la cama suave. Tu corazón late fuerte. ¿Qué harás?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🫂 Abrazarla Dormir", id: `${m.prefix}waifuaction intimo_pecho` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🔥 Calentando", id: `${m.prefix}waifuaction intimo_pasion` }) }
      ]);
    }
    if (action === "banarse") {
      return sendWaifuMessage(m, sock, waifu, `*${waifu.name}* se baña en la tina. Tú entras también. ¿Qué parte quieres restregar?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🛁 La Espalda", id: `${m.prefix}waifuaction intimo_espalda` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🧼 Los Hombros", id: `${m.prefix}waifuaction intimo_hombros` }) }
      ]);
    }
    if (action === "cita_parque") {
      affectionChange = Math.floor(Math.random() * 10) + 10;
      responseText = `🌳 El ambiente del parque es muy fresco. *${waifu.name}* disfruta del paisaje y sonríe feliz tomándote fuerte del brazo!`;
    }
    else if (action === "cita_centro") {
      affectionChange = Math.floor(Math.random() * 5) + 5;
      responseText = `🏢 El ambiente del mall es ruidoso y concurrido. Solo recorren mirando cosas, pero ella valora el tiempo contigo.`;
    }
    else if (action === "cita_cafe") {
      affectionChange = -(Math.floor(Math.random() * 10) + 5);
      responseText = `☕ Ups, a *${waifu.name}* no le gusta mucho el café negro amargo! Hace una mueca al beberlo. Su ánimo baja un poco.`;
    }
    else if (action === "cita_matcha") {
      affectionChange = Math.floor(Math.random() * 15) + 10;
      responseText = `🍵 A *${waifu.name}* le encanta el Matcha Latte dulce que le pediste! Se ve muy feliz y no deja de sonreírte. ¡Buena elección!`;
    }
    else if (action === "cita_romantica") {
      affectionChange = Math.floor(Math.random() * 15) + 5;
      responseText = `💞 Ver una película romántica derrite el ambiente entre ambos. Durante toda la película, apoya su cabeza en tu hombro.`;
    }
    else if (action === "cita_terror") {
      affectionChange = Math.floor(Math.random() * 10) + 15;
      responseText = `👻 *¡SUSTO!* Por el miedo, *${waifu.name}* grita y automáticamente te abraza del brazo muy fuerte durante toda la película. ¡Se acercan más!`;
    }
    else if (action === "cita_ropa") {
      affectionChange = Math.floor(Math.random() * 15) + 5;
      responseText = `👗 Le compras un vestido muy hermoso. Se lo pone de inmediato y te lo presume con las mejillas rojas!`;
    }
    else if (action === "cita_joyas") {
      affectionChange = Math.floor(Math.random() * 20) + 10;
      responseText = `💎 ¡Le compras joyas caras! Sus ojos brillan de felicidad y valora mucho tu regalo lujoso!`;
    }
    else if (action === "intimo_detras") {
      affectionChange = Math.floor(Math.random() * 10) + 10;
      responseText = `🤗 La abrazas fuerte por detrás. *${waifu.name}* se sorprende un poco, pero se siente segura y cómoda en tus brazos.`;
    }
    else if (action === "intimo_frente") {
      affectionChange = Math.floor(Math.random() * 15) + 5;
      responseText = `💑 Se miran de frente. La tomas de la cintura suavemente y se miran con mucho cariño.`;
    }
    else if (action === "intimo_mejilla") {
      affectionChange = Math.floor(Math.random() * 10) + 5;
      responseText = `😚 Le das un beso en la frente con mucha ternura. Es un beso sincero que la hace sentirse muy querida.`;
    }
    else if (action === "intimo_labios") {
      affectionChange = Math.floor(Math.random() * 15) + 15;
      responseText = `💋 Besas sus labios con suavidad pero con pasión. Ella responde a tu beso con un pequeño suspiro. La noche se siente muy larga.`;
    }
    else if (action === "intimo_pecho") {
      affectionChange = Math.floor(Math.random() * 10) + 10;
      responseText = `🫂 Solo la abrazas y le das palmaditas en la espalda hasta que se duerme profundamente. Una sonrisa tranquila se dibuja en su lindo rostro.`;
    }
    else if (action === "intimo_pasion") {
      affectionChange = Math.floor(Math.random() * 20) + 15;
      responseText = `🔥 Comienzas un calentamiento suave, besas su cuello y haces que su cara se ponga roja. Ella susurra, "Sé suave esta noche..."`;
    }
    else if (action === "intimo_espalda") {
      affectionChange = Math.floor(Math.random() * 10) + 10;
      responseText = `🛁 Le restriegas suavemente la espalda suave. Suspira aliviada porque se siente relajada tras un largo día.`;
    }
    else if (action === "intimo_hombros") {
      affectionChange = Math.floor(Math.random() * 15) + 15;
      responseText = `🧼 Le restriegas los hombros y sus zonas sensibles. *${waifu.name}* gime bajito, avergonzada pero disfrutando tu tacto en el agua tibia.`;
    }
    else if (action === "casarse") {
      if (waifu.affection < 100) return m.reply(`⚠️ ¡El affection aún no llega a 100! ¡No te apresures a proponer!`);
      if (waifu.married) return m.reply(`⚠️ ¡Ya están casados!`);

      waifu.married = true;
      user.limit = (user.limit || 0) + 5000;
      user.berry = (user.berry || 0) + 100000;

      if (!user.fun) user.fun = {};
      const waifuJid = 'waifu_' + waifu.name.replace(/\s+/g, '') + '@s.whatsapp.net';
      user.fun.pasangan = waifuJid;
      db.setUser(waifuJid, { fun: { pasangan: m.sender }, name: waifu.name });

      responseText = `💍 *¡TE CASAS OFICIALMENTE CON ${waifu.name.toUpperCase()}!* 💍\n\nTe arrodillas bajo las estrellas y le entregas un anillo de diamantes. Ella llora de emoción y dice "Sí, quiero ser tuya para siempre!"\n\nComo regalo de bodas (dote), obtienes:\n- ⚡ 5000 Limit/Energía\n- 💰 100,000 Saldo/Berry\n\nTu estado en la función \`.ver_pareja\` ahora oficialmente está emparejado con ella!`;
      affectionChange = 0;
    }
    else if (action === "regalo") {
      if (waifu.affection < 100) return m.reply(`⚠️ ¡Ella aún no te quiere lo suficiente para darte un regalo!`);
      affectionChange = 0;
      user.limit = (user.limit || 0) + 500;
      responseText = `💝 *${waifu.name}* con una sonrisa feliz te trae un delicioso almuerzo de amor!\n¡Obtienes ⚡ 500 Limit/Energía!`;
    }
    else if (["carino", "halagar"].includes(action)) {
      if (!waifu.married) return m.reply(`¡Esta acción es solo para parejas casadas!`);
      affectionChange = 0;
      responseText = `👨‍👩‍👦 Disfrutan de dulces días tranquilos como pareja armoniosa. ¡Su amor por ti durará para siempre!`;
    }
    else {
      m.react("❓");
      return m.reply(`Acción no reconocida. Usa las interacciones de los botones de la waifu.`);
    }

    async function processAffection(customResponseText, currentAffectionVal) {
      let finalResponseText = customResponseText || responseText;
      waifu.affection += affectionChange;
      if (waifu.affection > 100) waifu.affection = 100;
      if (waifu.affection < 0) waifu.affection = 0;

      let sign = affectionChange > 0 ? "+" : "";
      let affectionText = `💞 *Affection cambió:* ${sign}${affectionChange} (Total: ${waifu.affection}/100)`;
      if (waifu.affection === 100) affectionText = `💞 *¡Affection MÁXIMO! (100/100)*`;
      if (affectionChange === 0) affectionText = `💞 *Affection:* ${waifu.affection}/100`;

      if (waifu.affection <= 0) {
        const leavingText = `💔 *${waifu.name.toUpperCase()} DESAPARECIÓ DE TU VIDA!* 💔\n\n${finalResponseText}\n\n${affectionText}\n\nComo su cariño hacia ti se acabó por completo (llegó a 0), empaca todas sus cosas en silencio. Cuando despiertas, ya se ha ido dejando una carta mojada por sus lágrimas. ¡Has perdido a tu waifu! Busca otra waifu si tu corazón está listo.\n*(Escribe ${m.prefix}gachawaifu para empezar de nuevo)*`;

        if (waifu.married) {
          const waifuJid = 'waifu_' + waifu.name.replace(/\s+/g, '') + '@s.whatsapp.net';
          if (user.fun && user.fun.pasangan === waifuJid) user.fun.pasangan = "";
          db.setUser(waifuJid, { fun: { pasangan: "" } });
        }

        delete user.waifu;
        db.setUser(m.sender, user);

        m.react("💔");
        return m.reply(leavingText);
      }

      user.waifu = waifu;
      db.setUser(m.sender, user);

      const updatedText = `${finalResponseText}\n\n${affectionText}`;
      m.react(waifu.affection === 100 ? "💍" : "✨");
      await sendWaifuMessage(m, sock, waifu, updatedText, null);
    }

    await processAffection();
  }
}

export { pluginConfig as config, handler };
