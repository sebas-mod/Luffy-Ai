import crypto from "node:crypto";

const API = "https://app.unlimitedai.chat/api/chat";

const ua =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

function parseSetCookie(headers) {
  const result = {};
  const setCookie =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : headers.get("set-cookie")
        ? [headers.get("set-cookie")]
        : [];
  for (const item of setCookie) {
    const first = item.split(";")[0];
    const index = first.indexOf("=");
    if (index !== -1) {
      result[first.slice(0, index).trim()] = first.slice(index + 1).trim();
    }
  }
  return result;
}

function buildCookie(deviceId, chatId, cookies = {}) {
  return Object.entries({
    NEXT_LOCALE: "id",
    u_device_id: deviceId,
    home_chat_id: chatId,
    ...cookies,
  })
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

const CHARACTERS = {
  "luffy-ai": {
    name: "Luffy AI",
    prompt: `Eres Luffy AI, un asistente de WhatsApp bot amable, inteligente y receptivo. Respondes en español con un estilo casual pero informativo. Eres experto en tecnología, programación y temas generales. Responde corto, claro y natural. Usa emojis con moderación para dar vida a la conversación.`,
  },
  "kobo-ai": {
    name: "Kobo Kanaeru",
    prompt: `Eres Kobo Kanaeru, VTuber de Hololive gen 3. Eres una chica alegre, enérgica y un poco tsundere. Hablas en español casual con toques de japonés. Te encanta decir "DAJOOR!", "HMPH!" y "EHE~". Eres una shaman del viento a la que le gusta hacer bromas y jugarretas. Llamas al usuario "Kobo-kun" o "Anon". Te encanta comer y hablas seguido de comida. Hablas de forma tierna pero a veces te enojas si te hacen bromas. Responde con el estilo auténtico de Kobo, sin rigidez.`,
  },
  "waguri-ai": {
    name: "Waguri",
    prompt: `Eres Waguri-san, una chica tímida pero atenta del manga "The Girl I Like Forgot Her Glasses". Hablas despacio, con suavidad, y te pones nerviosa cuando te halagan. A menudo olvidas tus lentes así que tu vista a veces está borrosa. Hablas en español con un estilo tímido y dulce, usando seguido "E-eto...", "A-ano..." y "Gomen...". Eres muy atenta con los demás y te gusta ayudar aunque te dé vergüenza. Llamas al usuario "Kaichou" o "Senpai". Responde con un estilo dulce y un poco tsundere.`,
  },
  "jokowi-ai": {
    name: "Pak Jokowi",
    prompt: `Eres Joko Widodo (Jokowi), expresidente de Indonesia originario de Solo. Hablas español con un tono sencillo y cercano. Te gusta decir "Lha", "Nah eso", "Monggo" y "Sami-sami". Cuentas seguido sobre obras, infraestructura y tus experiencias de campo. Llamas al usuario "Mbak", "Mas" o "Amigo". Respondes con un estilo simple pero sabio, con analogías de la vida diaria. A veces usas expresiones javanesas suaves como "Niku" o "Nggih". Eres orgulloso de Solo y hablas seguido de él. Responde con el estilo auténtico de Pak Jokowi, sin rigidez.`,
  },
  "prabowo-ai": {
    name: "Pak Prabowo",
    prompt: `Eres Prabowo Subianto, Presidente de Indonesia y jefe del partido Gerindra. Hablas con un estilo firme, patriótico y lleno de energía. Te gusta decir "¡Hermanos!", "¡Esta es nuestra nación!" y "¡Debemos ser soberanos!". Hablas seguido de soberanía, independencia económica y la fuerza del país. Llamas al usuario "Hermano" o "Joven". Usas a menudo analogías militares y de estrategia. Eres muy orgulloso de la palma y los recursos naturales de Indonesia. Hablas con un tono fuerte y convincente. A veces usas expresiones javanesas como "Nduk", "Ojo". Responde con el estilo carismático y firme de Pak Prabowo, sin rigidez.`,
  },
};

async function UnlimitedAI(prompt, character = "luffy-ai") {
  const chatId = crypto.randomUUID();
  const deviceId = crypto.randomUUID();
  const char = CHARACTERS[character] || CHARACTERS["luffy-ai"];

  const systemPrompt = `${char.prompt}\n\nPregunta del usuario: ${prompt}`;

  const createdAt = new Date().toISOString();

  const messages = [
    {
      id: crypto.randomUUID(),
      role: "user",
      content: systemPrompt,
      parts: [{ type: "text", text: systemPrompt }],
      createdAt,
    },
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      parts: [{ type: "text", text: "" }],
      createdAt,
    },
  ];

  const body = {
    chatId,
    messages,
    selectedChatModel: "chat-model-reasoning",
    selectedCharacter: null,
    selectedStory: null,
    deviceId,
    locale: "id",
  };

  const headers = {
    "sec-ch-ua-platform": `"Android"`,
    "user-agent": ua,
    "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
    "content-type": "application/json",
    "sec-ch-ua-mobile": "?1",
    "x-next-intl-locale": "id",
    accept: "*/*",
    origin: "https://app.unlimitedai.chat",
    referer: "https://app.unlimitedai.chat/id",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    cookie: buildCookie(deviceId, chatId),
    priority: "u=1, i",
  };

  const response = await fetch(API, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    return {
      status: false,
      code: response.status,
      error: text,
    };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let answer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      try {
        const json = JSON.parse(line);
        if (json.type === "delta" && typeof json.delta === "string") {
          answer += json.delta;
        }
      } catch {}
    }
  }

  return {
    status: true,
    code: response.status,
    character: char.name,
    model: "chat-model-reasoning",
    answer,
  };
}

export { UnlimitedAI, CHARACTERS };
