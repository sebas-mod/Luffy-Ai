import axios from "axios";
import { getDatabase } from "../../src/lib/luffy-database.js";
import te from "../../src/lib/luffy-error.js";
import { prepareWAMessageMedia, generateWAMessageFromContent } from "ourin";

const pluginConfig = {
  name: ["gachahusbu", "husbuaction", "tinggalinhusbu", "husbuku", "suamiku"],
  alias: ["gachasuami"],
  category: "fun",
  description: "¡Gacha el husbu de tus sueños, conquista su corazón y hazlo tu pareja!",
  usage: ".gachahusbu | .husbuku | .tinggalinhusbu",
  example: ".gachahusbu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 2,
  isEnabled: true,
};

const husbuPool = [
  // Common (50% weight)
  { name: "Yuji Itadori", age: 16, height: "173 cm", weight: "80 kg", tier: "Common", keyword: "Yuji Itadori aesthetic icon", weightChance: 50 },
  { name: "Denji", age: 17, height: "173 cm", weight: "65 kg", tier: "Common", keyword: "Denji aesthetic icon", weightChance: 50 },
  { name: "Loid Forger", age: 28, height: "187 cm", weight: "75 kg", tier: "Common", keyword: "Loid Forger aesthetic", weightChance: 50 },
  { name: "Tanjiro Kamado", age: 15, height: "165 cm", weight: "61 kg", tier: "Common", keyword: "Tanjiro Kamado icon", weightChance: 50 },
  { name: "Zenitsu Agatsuma", age: 16, height: "164.5 cm", weight: "58 kg", tier: "Common", keyword: "Zenitsu Agatsuma aesthetic", weightChance: 50 },
  { name: "Izuku Midoriya", age: 16, height: "166 cm", weight: "60 kg", tier: "Common", keyword: "Izuku Midoriya anime icon", weightChance: 50 },
  { name: "Katsuki Bakugo", age: 16, height: "172 cm", weight: "63 kg", tier: "Common", keyword: "Katsuki Bakugo aesthetic", weightChance: 50 },
  { name: "Tobio Kageyama", age: 16, height: "181 cm", weight: "66 kg", tier: "Common", keyword: "Tobio Kageyama icon", weightChance: 50 },
  { name: "Asta", age: 16, height: "155 cm", weight: "55 kg", tier: "Common", keyword: "Asta Black Clover aesthetic", weightChance: 50 },
  { name: "Toge Inumaki", age: 17, height: "164 cm", weight: "58 kg", tier: "Common", keyword: "Toge Inumaki aesthetic icon", weightChance: 50 },

  // Rare (30% weight)
  { name: "Megumi Fushiguro", age: 15, height: "175 cm", weight: "60 kg", tier: "Rare", keyword: "Megumi Fushiguro aesthetic icon", weightChance: 30 },
  { name: "Shoto Todoroki", age: 16, height: "176 cm", weight: "62 kg", tier: "Rare", keyword: "Shoto Todoroki aesthetic", weightChance: 30 },
  { name: "Giyuu Tomioka", age: 21, height: "176 cm", weight: "69 kg", tier: "Rare", keyword: "Giyuu Tomioka aesthetic icon", weightChance: 30 },
  { name: "Sanji", age: 21, height: "180 cm", weight: "66 kg", tier: "Rare", keyword: "Sanji one piece aesthetic", weightChance: 30 },
  { name: "Roronoa Zoro", age: 21, height: "181 cm", weight: "71 kg", tier: "Rare", keyword: "Roronoa Zoro aesthetic", weightChance: 30 },
  { name: "Diluc", age: 22, height: "185 cm", weight: "72 kg", tier: "Rare", keyword: "Diluc aesthetic icon", weightChance: 30 },
  { name: "Kamisato Ayato", age: 24, height: "188 cm", weight: "75 kg", tier: "Rare", keyword: "Kamisato Ayato aesthetic icon", weightChance: 30 },
  { name: "Tenguzui Uzui", age: 23, height: "198 cm", weight: "95 kg", tier: "Rare", keyword: "Tengen Uzui aesthetic", weightChance: 30 },
  { name: "Kyojuro Rengoku", age: 20, height: "177 cm", weight: "72 kg", tier: "Rare", keyword: "Kyojuro Rengoku aesthetic", weightChance: 30 },

  // Epic (15% weight)
  { name: "Levi Ackerman", age: 30, height: "160 cm", weight: "65 kg", tier: "Epic", keyword: "Levi Ackerman aesthetic icon", weightChance: 15 },
  { name: "Itachi Uchiha", age: 21, height: "178 cm", weight: "58 kg", tier: "Epic", keyword: "Itachi Uchiha aesthetic icon", weightChance: 15 },
  { name: "Kakashi Hatake", age: 30, height: "181 cm", weight: "67 kg", tier: "Epic", keyword: "Kakashi Hatake aesthetic", weightChance: 15 },
  { name: "Zhongli", age: 6000, height: "190 cm", weight: "80 kg", tier: "Epic", keyword: "Zhongli aesthetic icon", weightChance: 15 },
  { name: "Tartaglia (Childe)", age: 21, height: "185 cm", weight: "74 kg", tier: "Epic", keyword: "Tartaglia Genshin aesthetic", weightChance: 15 },
  { name: "Neuvillette", age: 500, height: "188 cm", weight: "75 kg", tier: "Epic", keyword: "Neuvillette aesthetic icon", weightChance: 15 },
  { name: "Jing Yuan", age: 700, height: "185 cm", weight: "75 kg", tier: "Epic", keyword: "Jing Yuan honkai star rail aesthetic", weightChance: 15 },
  { name: "Dan Heng", age: 25, height: "180 cm", weight: "70 kg", tier: "Epic", keyword: "Dan Heng IL aesthetic icon", weightChance: 15 },
  { name: "Aventurine", age: 22, height: "183 cm", weight: "73 kg", tier: "Epic", keyword: "Aventurine honkai star rail aesthetic", weightChance: 15 },
  { name: "Kaeluc (Kaeya)", age: 22, height: "186 cm", weight: "75 kg", tier: "Epic", keyword: "Kaeya Genshin aesthetic", weightChance: 15 },

  // Legendary (5% weight)
  { name: "Gojo Satoru", age: 28, height: "190 cm", weight: "85 kg", tier: "Legendary", keyword: "Gojo Satoru aesthetic icon", weightChance: 5 },
  { name: "Ryomen Sukuna", age: 1000, height: "173 cm", weight: "80 kg", tier: "Legendary", keyword: "Sukuna aesthetic icon", weightChance: 5 },
  { name: "Toji Fushiguro", age: 30, height: "185 cm", weight: "90 kg", tier: "Legendary", keyword: "Toji Fushiguro aesthetic", weightChance: 5 },
  { name: "Gilgamesh", age: 3000, height: "182 cm", weight: "68 kg", tier: "Legendary", keyword: "Gilgamesh Fate aesthetic", weightChance: 5 },
  { name: "Sesshomaru", age: 900, height: "185 cm", weight: "75 kg", tier: "Legendary", keyword: "Sesshomaru aesthetic icon", weightChance: 5 },
  { name: "Alhaitham", age: 25, height: "188 cm", weight: "76 kg", tier: "Legendary", keyword: "Alhaitham aesthetic icon", weightChance: 5 },
  { name: "Dazai Osamu", age: 22, height: "181 cm", weight: "67 kg", tier: "Legendary", keyword: "Dazai Osamu aesthetic", weightChance: 5 },
];

async function getHusbuImage(keyword) {
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
    console.error("[GachaHusbu] Pinterest API error:", e.message);
  }
  return "https://i.pinimg.com/736x/8f/3e/2a/8f3e2a77ec65cdbcfad4ff3bc17e825f.jpg"; // Placeholder fall-back
}

async function getBuffer(url) {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer", timeout: 15000 });
    return Buffer.from(res.data);
  } catch {
    return null;
  }
}

function rollHusbu() {
  const totalWeight = husbuPool.reduce((acc, h) => acc + h.weightChance, 0);
  let random = Math.random() * totalWeight;
  for (const husbu of husbuPool) {
    random -= husbu.weightChance;
    if (random <= 0) return husbu;
  }
  return husbuPool[husbuPool.length - 1];
}

async function sendHusbuMessage(m, sock, husbu, textContent, customButtons = null) {
  let imgBuffer = null;
  if (husbu.imageUrl) {
    imgBuffer = await getBuffer(husbu.imageUrl);
  }
  if (!imgBuffer) {
    const newUrl = await getHusbuImage(husbu.keyword);
    husbu.imageUrl = newUrl;
    imgBuffer = await getBuffer(newUrl) || Buffer.alloc(0);
  }

  const media = await prepareWAMessageMedia(
    { image: imgBuffer },
    { upload: sock.waUploadToServer }
  );

  let buttons = customButtons;
  if (!buttons) {
    if (husbu.affection < 80) {
      buttons = [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🚶‍♀️ Paseo", id: `${m.prefix}husbuaction jalanjalan` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "☕ Quedar en un Café", id: `${m.prefix}husbuaction kafe` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🎬 Cine", id: `${m.prefix}husbuaction bioskop` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🛍️ Comprar Ropa", id: `${m.prefix}husbuaction belanja` }) },
      ];
    } else if (husbu.affection < 100) {
      buttons = [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🫂 Abrazarlo por la Espalda", id: `${m.prefix}husbuaction peluk` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💋 Besar su Mejilla", id: `${m.prefix}husbuaction cium` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🛏️ Dormir Juntos", id: `${m.prefix}husbuaction tidur` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🛁 Bañarse Juntos", id: `${m.prefix}husbuaction mandi` }) },
      ];
    } else {
      if (!husbu.married) {
        buttons = [
          { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💍 Aceptar su Propuesta", id: `${m.prefix}husbuaction nikah` }) },
          { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💝 Pedir Dinero para Compras", id: `${m.prefix}husbuaction hadiah` }) },
        ];
      } else {
        buttons = [
          { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "👨‍👩‍👦 Pasar Tiempo Juntos", id: `${m.prefix}husbuaction mesra` }) },
          { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💌 Halaga a tu Marido", id: `${m.prefix}husbuaction rayu` }) },
        ];
      }
    }
  }

  let footerText = "❤️ Haz que se derrita y se enamore de ti!";
  if (customButtons) footerText = "💭 Él espera tu respuesta...";
  else if (husbu.married) footerText = "❤️ ¡Eres su esposa legítima!";

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
            title: `🌟 *${husbu.tier.toUpperCase()} TIER HUSBANDO* 🌟`,
            subtitle: husbu.name,
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
  if (cmd === "husbuku" || cmd === "suamiku") {
    if (!user.husbu) {
      return m.reply(`⚠️ *¡Aún no tienes husbu!*\nEscribe *${m.prefix}gachahusbu* para empezar!`);
    }
    m.react("🕕");
    const husbu = user.husbu;
    let statusPernikahan = husbu.married ? "Casado 💍" : "En Conquista 💖";
    const textContent = `📸 *ESTADO DE TU HUSBU* 📸\n\n` +
      `💖 *Nombre Completo:* ${husbu.name}\n` +
      `🎂 *Edad:* ${husbu.age} años\n` +
      `💎 *Tier:* ${husbu.tier}\n` +
      `💞 *Affection:* ${husbu.affection}/100\n` +
      `💍 *Estado:* ${statusPernikahan}\n\n` +
      `¡Continúa la interacción eligiendo una de las acciones de cita de abajo!`;

    m.react("✅");
    return await sendHusbuMessage(m, sock, husbu, textContent, null);
  }
  if (cmd === "tinggalinhusbu") {
    if (!user.husbu) {
      return m.reply(`⚠️ *¡Ni siquiera tienes husbu!* ¡Búscate uno primero!`);
    }

    const husbuName = user.husbu.name;
    const husbuJid = 'husbu_' + husbuName.replace(/\s+/g, '') + '@s.whatsapp.net';
    if (user.husbu.married) {
      if (user.fun && user.fun.pasangan === husbuJid) {
        user.fun.pasangan = "";
      }
      db.setUser(husbuJid, { fun: { pasangan: "" } });
    }

    delete user.husbu;
    db.setUser(m.sender, user);

    m.react("💔");
    return m.reply(
      `💔 *ABANDONASTE A ${husbuName.toUpperCase()}!*\n\n` +
      `Le devolviste sus cosas y le pediste que se fuera. ` +
      `Te miró con los ojos llenos de una profunda decepción, se dio la vuelta sin decir una sola palabra y desapareció en medio de la lluvia.\n\n` +
      `Ahora están oficialmente separados.`
    );
  }
  if (cmd === "gachahusbu" || cmd === "gachasuami") {
    if (user.husbu) {
      m.react("😡");
      let pesanStatus = user.husbu.married ? "¡Ya es tu esposo!" : "¡Está tratando de ganarse tu corazón!";
      return m.reply(
        `⚠️ *¡Ya tienes un Husbu!*\n\n` +
        `Nombre: *${user.husbu.name}*\n` +
        `Tier: *${user.husbu.tier}*\n` +
        `Affection: *${user.husbu.affection}/100*\n\n` +
        `¡No seas codiciosa! Cuida al husbu que ya tienes. ${pesanStatus} Escribe *${m.prefix}husbuku* para interactuar con él.`
      );
    }

    const sub = (m.args[0] || "").toLowerCase();

    if (sub !== "start") {
      const panduan = `💕 *SISTEMA GACHA HUSBU* 💕\n\n` +
        `¡Simulación de citas virtuales interactivas para conseguir a tu chico anime soñado! ¡Gana su atención, hazlo enamorarse y cásate con él!\n\n` +
        `*USO DE COMANDOS:*\n` +
        `• *${m.prefix}gachahusbu* — Abre este menú de guía\n` +
        `• *${m.prefix}husbuku* — Abre el panel de interacción con tu husbu\n` +
        `• *${m.prefix}tinggalinhusbu* — Abandona a tu husbu y reinicia el estado\n\n` +
        `*EXPLICACIÓN DEL FLUJO DE LA HISTORIA:*\n` +
        `1. Pulsa el botón **Comenzar Gacha** de abajo para invocar al chico más guapo a tu vida.\n` +
        `2. Habrá 3 Fases de Relación según los Puntos de Amor (Affection).\n` +
        `3. *Fase de Acercamiento (< 80)*: ¡Elige una ruta de cita! Cada elección afectará sus sentimientos hacia ti.\n` +
        `4. *Fase Íntima (80 - 99)*: Si él ya se siente cómodo, se abrirán interacciones más cariñosas. Pero no pases los límites antes de tiempo, ¡o se va a *enfriar*!\n` +
        `5. *Fase de Casamiento (100)*: Haz que se arrodille y te pida matrimonio para conseguir la *Recompensa Exclusiva* de berry y límites!`;

      const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
            interactiveMessage: {
              body: { text: panduan },
              footer: { text: "¡Pulsa el botón de abajo para invocar a tu futuro esposo!" },
              nativeFlowMessage: {
                buttons: [
                  { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🎲 ¡Invoca a tu Husbando Ahora!", id: `${m.prefix}gachahusbu start` }) }
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
      const husbuData = rollHusbu();
      const husbu = {
        ...husbuData,
        affection: 50,
        married: false,
        imageUrl: await getHusbuImage(husbuData.keyword)
      };

      user.husbu = husbu;
      db.setUser(m.sender, user);

      const textContent = `🎉 *KYAAA! CONSEGUISTE UN NUEVO HUSBANDO!* 🎉\n\n` +
        `💖 *Nombre Completo:* ${husbu.name}\n` +
        `🎂 *Edad:* ${husbu.age} años\n` +
        `📏 *Altura:* ${husbu.height}\n` +
        `⚖️ *Peso:* ${husbu.weight}\n` +
        `💎 *Tier:* ${husbu.tier}\n` +
        `💞 *Affection:* ${husbu.affection}/100\n\n` +
        `Elige la interacción de abajo para empezar a conquistarlo. ¡Responde con cuidado para que sus sentimientos hacia ti se profundicen!`;

      m.react("✅");
      await sendHusbuMessage(m, sock, husbu, textContent, null);
    } catch (err) {
      console.error(err);
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
    return;
  }
  if (cmd === "husbuaction") {
    if (!user.husbu) {
      m.react("❌");
      return m.reply(`¡No tienes husbu aún! Escribe *${m.prefix}gachahusbu* para conseguir a tu primer husbando.`);
    }

    const action = (m.args[0] || "").toLowerCase();
    let husbu = user.husbu;
    let responseText = "";
    let affectionChange = 0;
    if (action === "jalanjalan") {
      return sendHusbuMessage(m, sock, husbu, `Estás yendo a dar un paseo con *${husbu.name}*. Parece aburrido. ¿A dónde quieres llevarlo?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🌳 A un Picnic", id: `${m.prefix}husbuaction kencan_taman` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🎢 Al Parque de Diversiones", id: `${m.prefix}husbuaction kencan_mall` }) }
      ]);
    }
    if (action === "kafe") {
      return sendHusbuMessage(m, sock, husbu, `*${husbu.name}* te invita a su café favorito. Al pedir el café, te pregunta qué bebida prefieres.`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "☕ Café Amargo", id: `${m.prefix}husbuaction kencan_kopi` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🍓 Fresa con Leche", id: `${m.prefix}husbuaction kencan_matcha` }) }
      ]);
    }
    if (action === "bioskop") {
      return sendHusbuMessage(m, sock, husbu, `Van juntos al cine. Él te pide que elijas la película. ¿Qué película eliges?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💥 De Acción", id: `${m.prefix}husbuaction kencan_romantis` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "👻 De Terror", id: `${m.prefix}husbuaction kencan_horor` }) }
      ]);
    }
    if (action === "belanja") {
      return sendHusbuMessage(m, sock, husbu, `Van al centro comercial. *${husbu.name}* se ofrece a comprarte algo. ¿Qué le pides?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "👕 Chaqueta Genial en Pareja", id: `${m.prefix}husbuaction kencan_baju` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💍 Un Anillo Elegante", id: `${m.prefix}husbuaction kencan_perhiasan` }) }
      ]);
    }
    const rejectIntimate = async () => {
      husbu.affection -= (Math.floor(Math.random() * 30) + 30);
      if (husbu.affection < 0) husbu.affection = 0;
      let outText = `💢 *¡ALTO AHÍ!* Estás actuando con demasiada agresividad mientras sus sentimientos aún son vagos! *${husbu.name}* aparta tu mano con el rostro enojado y decepcionado! "¡¿Y tú qué te has creído?!" grita.`;
      await processAffection(outText, husbu.affection);
    };

    if (["peluk", "cium", "tidur", "mandi"].includes(action) && husbu.affection < 80) {
      return await rejectIntimate();
    }

    if (action === "peluk") {
      return sendHusbuMessage(m, sock, husbu, `Ves la espalda ancha de *${husbu.name}*. Una buena oportunidad, ¡lo abrazas! ¿Por dónde?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🤗 Abrazarlo por la Cintura", id: `${m.prefix}husbuaction intim_belakang` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💪 Tomarle la Mano con Fuerza", id: `${m.prefix}husbuaction intim_depan` }) }
      ]);
    }
    if (action === "cium") {
      return sendHusbuMessage(m, sock, husbu, `Su rostro está muy cerca mirándote con intensidad. Te atreves a besarlo. ¿Dónde?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "😚 Besar su Mejilla", id: `${m.prefix}husbuaction intim_kening` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "💋 Besar sus Labios", id: `${m.prefix}husbuaction intim_bibir` }) }
      ]);
    }
    if (action === "tidur") {
      return sendHusbuMessage(m, sock, husbu, `Es tarde, están a solas en la habitación. Él te atrae hacia su abrazo. ¿Cuál es tu reacción?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🫂 Recostarte en su Pecho", id: `${m.prefix}husbuaction intim_kelon` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🔥 Responder con Pasión", id: `${m.prefix}husbuaction intim_panas` }) }
      ]);
    }
    if (action === "mandi") {
      return sendHusbuMessage(m, sock, husbu, `*${husbu.name}* te atrae al baño contigo. Su rostro sonríe con picardía. ¿Qué haces?`, [
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🛁 Lavar su Espalda", id: `${m.prefix}husbuaction intim_punggung` }) },
        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🧼 Acariciar su Pecho", id: `${m.prefix}husbuaction intim_bahu` }) }
      ]);
    }

    if (action === "kencan_taman") {
      affectionChange = Math.floor(Math.random() * 10) + 10;
      responseText = `🌳 *${husbu.name}* disfruta mucho de la brisa fresca y pasa el tiempo recostado en tu regazo en el parque.`;
    }
    else if (action === "kencan_mall") {
      affectionChange = Math.floor(Math.random() * 15) + 10;
      responseText = `🎢 ¡Jugar en el parque de diversiones resultó muy divertido para él! *${husbu.name}* gana un gran osito de peluche y te lo regala.`;
    }
    else if (action === "kencan_kopi") {
      affectionChange = Math.floor(Math.random() * 10) + 10;
      responseText = `☕ "Una elección elegante", te elogia. Toman café amargo mientras charlan animadamente; se le ve muy a gusto conversando contigo.`;
    }
    else if (action === "kencan_matcha") {
      affectionChange = -(Math.floor(Math.random() * 10) + 5);
      responseText = `🍓 Te compra una bebida dulce, pero al parecer su conversación no conecta mucho. Se le ve algo aburrido y se queda callado.`;
    }
    else if (action === "kencan_romantis") {
      affectionChange = Math.floor(Math.random() * 15) + 10;
      responseText = `💥 ¡Ver películas de acción es su favorito! Durante toda la película te sostiene la mano con fuerza por lo emocionante que es.`;
    }
    else if (action === "kencan_horor") {
      affectionChange = Math.floor(Math.random() * 5) + 5;
      responseText = `👻 *¡SUSTO!* Por reflejo saltas y lo abrazas. Él se ríe un poco, pero luego te abraza para protegerte del miedo.`;
    }
    else if (action === "kencan_baju") {
      affectionChange = Math.floor(Math.random() * 15) + 10;
      responseText = `👕 Te compra una chaqueta de pareja que le queda perfecta! Sonríe con orgullo al verte vistiendo ropa a juego con él.`;
    }
    else if (action === "kencan_perhiasan") {
      affectionChange = -(Math.floor(Math.random() * 10) + 10);
      responseText = `💍 "Mi dinero no alcanza tanto este mes", se queja suspirando profundamente. Se niega a comprarlo y siente que eres demasiado materialista.`;
    }
    else if (action === "intim_belakang") {
      affectionChange = Math.floor(Math.random() * 10) + 10;
      responseText = `🤗 Se sorprende cuando lo abrazas por la cintura desde atrás, pero sus orejas se ponen rojas. Acaricia tu mano suavemente.`;
    }
    else if (action === "intim_depan") {
      affectionChange = Math.floor(Math.random() * 15) + 10;
      responseText = `💪 Tomas su mano con firmeza. Él sonríe con ternura y te devuelve el gesto apretando tu mano mientras te mira fijamente a los ojos.`;
    }
    else if (action === "intim_kening") {
      affectionChange = Math.floor(Math.random() * 10) + 5;
      responseText = `😚 Besas su mejilla. Él ríe bajito y te devuelve el beso en la frente con mucho cariño.`;
    }
    else if (action === "intim_bibir") {
      affectionChange = Math.floor(Math.random() * 20) + 10;
      responseText = `💋 Lo besas en los labios de repente. Él abre los ojos sorprendido por un instante antes de tomarte de la cintura y devolverte el beso con fiereza.`;
    }
    else if (action === "intim_kelon") {
      affectionChange = Math.floor(Math.random() * 15) + 10;
      responseText = `🫂 Recuestas tu cabeza sobre su pecho firme. Él acaricia tu cabello lentamente mientras te susurra lo mucho que significas para él.`;
    }
    else if (action === "intim_panas") {
      affectionChange = Math.floor(Math.random() * 20) + 15;
      responseText = `🔥 Lo miras a los ojos con deseo. Él sonríe con picardía, "Tú lo pediste..." dice con una voz ronca y sensual antes de abalanzarse sobre ti.`;
    }
    else if (action === "intim_punggung") {
      affectionChange = Math.floor(Math.random() * 10) + 10;
      responseText = `🛁 Le lavas la espalda lentamente. El tacto de tus manos lo relaja y exhala aliviado con los ojos cerrados.`;
    }
    else if (action === "intim_bahu") {
      affectionChange = Math.floor(Math.random() * 15) + 15;
      responseText = `🧼 Cuando acaricias su pecho, inhala profundamente y toma tu mano. "Estás provocándome a propósito, ¿eh?" susurra.`;
    }
    else if (action === "nikah") {
      if (husbu.affection < 100) return m.reply(`⚠️ ¡Los puntos de affection aún no llegan a 100! ¡Espera a que realmente te pida matrimonio!`);
      if (husbu.married) return m.reply(`⚠️ ¡Pero si ya están casados!`);

      husbu.married = true;
      user.limit = (user.limit || 0) + 5000;
      user.berry = (user.berry || 0) + 100000;

      if (!user.fun) user.fun = {};
      const husbuJid = 'husbu_' + husbu.name.replace(/\s+/g, '') + '@s.whatsapp.net';
      user.fun.pasangan = husbuJid;
      db.setUser(husbuJid, { fun: { pasangan: m.sender }, name: husbu.name });

      responseText = `💍 *¡ACEPTASTE LA PROPUESTA DE ${husbu.name.toUpperCase()}!* 💍\n\nSe arrodilla frente a ti y te ofrece un hermoso anillo de diamantes, "¿Quieres ser mi esposa para siempre?" pregunta. Cuando asientes, ¡de inmediato te carga y te besa lleno de felicidad!\n\nComo primer manutención de su parte, obtienes:\n- ⚡ 5000 Límite/Energía\n- 💰 100,000 Saldo/Berry\n\nTu estado en la función \`.cekpacar\` ahora está oficialmente emparejado con él!`;
      affectionChange = 0;
    }
    else if (action === "hadiah") {
      if (husbu.affection < 100) return m.reply(`⚠️ ¡Tu esposo está ocupado trabajando, no lo molestes!`);
      affectionChange = 0;
      user.berry = (user.berry || 0) + 5000;
      responseText = `💝 *${husbu.name}* te da su tarjeta de crédito sonriendo, "Gasta lo que quieras, cariño."\n¡Recibiste 💰 5,000 Berry de tu esposo!`;
    }
    else if (["mesra", "rayu"].includes(action)) {
      if (!husbu.married) return m.reply(`¡Esta acción es solo para parejas casadas!`);
      affectionChange = 0;
      responseText = `👨‍👩‍👦 Ambos disfrutan de una tranquila y romántica cena. Su mirada de amor no se desvanece; está muy agradecido de tenerte como su esposa.`;
    }
    else {
      m.react("❓");
      return m.reply(`Acción no reconocida. Usa las interacciones de los botones.`);
    }

    async function processAffection(customResponseText, currentAffectionVal) {
      let finalResponseText = customResponseText || responseText;
      husbu.affection += affectionChange;
      if (husbu.affection > 100) husbu.affection = 100;
      if (husbu.affection < 0) husbu.affection = 0;

      let sign = affectionChange > 0 ? "+" : "";
      let affectionText = `💞 *Affection cambiado:* ${sign}${affectionChange} (Total: ${husbu.affection}/100)`;
      if (husbu.affection === 100) affectionText = `💞 *Affection MÁXIMO! (100/100)*`;
      if (affectionChange === 0) affectionText = `💞 *Affection:* ${husbu.affection}/100`;

      if (husbu.affection <= 0) {
        const leavingText = `💔 *${husbu.name.toUpperCase()} TE HA DEJADO PARA SIEMPRE!* 💔\n\n${finalResponseText}\n\n${affectionText}\n\nDebido a que su cariño por ti se ha agotado por completo (llega a 0), empaca todas sus cosas. Cuando intentas detenerlo, aparta tu mano. "Nuestra relación termina aquí," dice con frialdad antes de irse. ¡Has perdido a tu esposo! Busca otro husbu cuando tu corazón esté listo.\n*(Escribe ${m.prefix}gachahusbu para empezar de nuevo)*`;

        if (husbu.married) {
          const husbuJid = 'husbu_' + husbu.name.replace(/\s+/g, '') + '@s.whatsapp.net';
          if (user.fun && user.fun.pasangan === husbuJid) user.fun.pasangan = "";
          db.setUser(husbuJid, { fun: { pasangan: "" } });
        }

        delete user.husbu;
        db.setUser(m.sender, user);

        m.react("💔");
        return m.reply(leavingText);
      }

      user.husbu = husbu;
      db.setUser(m.sender, user);

      const updatedText = `${finalResponseText}\n\n${affectionText}`;
      m.react(husbu.affection === 100 ? "💍" : "✨");
      await sendHusbuMessage(m, sock, husbu, updatedText, null);
    }

    await processAffection();
  }
}

export { pluginConfig as config, handler };
