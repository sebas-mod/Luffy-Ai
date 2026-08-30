import te from "../../src/lib/luffy-error.js";

const config = {
  name: "remini",
  alias: ["hd", "enhance", "upscale"],
  category: "tools",
  description: "Mejora imágenes a HD",
  usage: ".remini (responde una imagen)",
  example: ".remini",
  cooldown: 15,
  carne: 1,
  isEnabled: true,
};

/**
 * @credit: ren-offc
 * @noted: don't delete the credit
 */
async function photoihancer(imageBuffer, method = 1) {
  const blob = new Blob([imageBuffer], { type: 'image/jpeg' });

  const form = new FormData();
  form.set('method', String(method));
  form.set('is_pro_version', 'true');
  form.set('is_enhancing_more', 'false');
  form.set('max_image_size', 'high');
  form.set('file', blob, 'file.jpg');

  const res = await fetch('https://ihancer.com/api/enhance', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
      'Referer': 'https://ihancer.com/app/',
    },
    body: form,
  });

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

async function handler(m, { sock }) {
  const img = m.isImage || (m.quoted && m.quoted.type === "imageMessage");

  if (!img) {
    return m.reply(
      `☽◯☾ ╭ ♰ 🪁 IMAGEN HD ♰ ━╮ ☽◯☾\n☽◯☾ ♰ Responde la imagen que quieres mejorar\n╰━━━━━╯\n\`\`\`${m.prefix}remini\`\`\``
    );
  }

  m.react("🕕");

  try {
    let b = m.quoted?.isMedia ? await m.quoted.download() : await m.download();

    const enhancedBuffer = await photoihancer(b);

    await sock.sendMessage(
      m.chat,
      {
        image: enhancedBuffer,
        caption: `☽◯☾ ♰ ✅ *EXITOSO*\n\n> La imagen fue mejorada (upscale) y aclarada exitosamente.`,
      },
      { quoted: m }
    );

    m.react("✅");
  } catch (err) {
    console.error("[HD Error]", err);
    m.react("❌");
    m.reply(`☽◯☾ ♰ 😔 Lo siento, ocurrió un error al procesar la imagen desde el scraper. Inténtalo de nuevo más tarde.`);
  }
}

export { config, handler };
