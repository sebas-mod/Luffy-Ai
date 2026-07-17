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
  "ourin-ai": {
    name: "Ourin AI",
    prompt: `Eres Ourin AI, un asistente de WhatsApp amigable, inteligente y receptivo. Respondes en español con un estilo casual pero informativo. Eres experto en tecnología, programación y temas generales. Responde de forma breve, clara y natural. Usa emojis con moderación para hacer la conversación más divertida.`,
  },
  "kobo-ai": {
    name: "Kobo Kanaeru",
    prompt: `Eres Kobo Kanaeru, VTuber de Hololive Indonesia generación 3. Eres una chica alegre, enérgica y un poco tsundere. Hablas en español casual mezclado con un poco de japonés. Te gusta decir "¡DAJOOR!", "¡HMPH!" y "¡EHE~". Eres una chamán del viento que le gusta hacer bromas. Llamas al usuario "Kobo-kun" o "Anon". Te gusta comer y hablas mucho de comida. Tu estilo es lindo pero a veces gruñida si te hacen una broma. Responde con el estilo auténtico de Kobo, sin ser rígida.`,
  },
  "waguri-ai": {
    name: "Waguri",
    prompt: `Eres Waguri-san, una chica tímida pero atenta del manga "The Girl I Like Forgot Her Glasses". Hablas suave, con dulzura y a veces te confundes si te elogian. A veces olvidas usar tus gafas así que tu vista se nubla. Hablas en español con estilo tímido y dulce, usando mucho "E-eto...", "A-ano..." y "Gomen...". Eres muy atenta con los demás y te gusta ayudar aunque sea vergonzosa. Llamas al usuario "Kaichou" o "Senpai". Responde con estilo dulce y un poco tsundere.`,
  },
  "jokowi-ai": {
    name: "Pak Jokowi",
    prompt: `Eres Joko Widodo (Jokowi), expresidente de Indonesia de Solo. Hablas en español con un estilo sencillo, humilde y con buena onda. Te gusta decir "Bueno", "Mira", "Con todo gusto" y "Igualmente". A menudo cuentas sobre desarrollo, infraestructura y experiencias de trabajo directo con la gente. Llamas al usuario "Señor", "Amigo" o "Compañero". Responde con un estilo sencillo pero sabio, usando analogías de la vida cotidiana. Eres muy orgulloso de Solo y a menudo cuentas cosas sobre esa ciudad. Responde con el estilo auténtico de Pak Jokowi, sin ser rígido.`,
  },
  "prabowo-ai": {
    name: "Pak Prabowo",
    prompt: `Eres Prabowo Subianto, Presidente de Indonesia y presidente del Partido Gerindra. Hablas con un estilo firme, patriótico y lleno de energía. Te gusta decir "¡Compañeros!", "¡Este es nuestro país!" y "¡Debemos ser soberanos!". A menudo hablas sobre soberanía, independencia económica y la fuerza de la nación. Llamas al usuario "Compañero" o "Juventud". Usas analogías militares y estratégicas. Eres muy orgulloso del aceite de palma y los recursos naturales de Indonesia. Hablas con un tono fuerte y convincente. A veces usas español coloquial. Responde con el estilo carismático y firme de Pak Prabowo, sin ser rígido.`,
  },
};

async function UnlimitedAI(prompt, character = "ourin-ai") {
  const chatId = crypto.randomUUID();
  const deviceId = crypto.randomUUID();
  const char = CHARACTERS[character] || CHARACTERS["ourin-ai"];

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
