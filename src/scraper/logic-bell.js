import axios from "axios";
import config from "../../config.js";

function buildHistoryText(history = []) {
  if (!Array.isArray(history) || history.length === 0) {
    return "";
  }

  const lines = history
    .slice(-10)
    .map((item) => {
      const role = item?.role === "assistant" ? "AI" : "User";
      const content = String(item?.content || "").trim();
      return content ? `${role}: ${content}` : "";
    })
    .filter(Boolean);

  if (lines.length === 0) {
    return "";
  }

  return `Historial de conversación:\n${lines.join("\n")}`;
}

function buildTextMessage(message, history = [], imageBuffer = null) {
  const parts = [];
  const historyText = buildHistoryText(history);

  if (historyText) {
    parts.push(historyText);
  }

  if (imageBuffer) {
    parts.push("El usuario envió una imagen. Si la imagen puede analizarse, usa ese contexto al responder.");
  }

  parts.push(`Mensaje actual del usuario:\n${String(message || "").trim() || "(imagen sin texto)"}`);

  return parts.filter(Boolean).join("\n\n");
}

function getAiNames(aiFullName = "") {
  const fullName = String(aiFullName || config.bot?.name || "Ourin AI").trim();
  const nickName = fullName.split(/\s+/)[0] || "Ourin";
  return { fullName, nickName };
}

async function chat({
  message,
  instruction = "",
  imageBuffer = null,
  history = [],
  senderId = "",
  senderName = "",
  aiFullName = "",
  aiNickName = "",
  ownerName = "",
  role = "Temen deket",
  commands = [],
} = {}) {
  if (!message?.trim() && !imageBuffer) {
    throw new Error("Message is required.");
  }

  const apiKey = config.APIkey?.logicBell;
  if (!apiKey) {
    throw new Error("API key de logicBell no configurada.");
  }

  const aiNames = getAiNames(aiFullName);
  const payload = {
    text: buildTextMessage(message, history, imageBuffer),
    id: senderId || "anonymous@s.whatsapp.net",
    fullainame: aiNames.fullName,
    nickainame: String(aiNickName || aiNames.nickName).trim() || aiNames.nickName,
    senderName: String(senderName || "User").trim() || "User",
    ownerName: String(ownerName || config.owner?.name || "Owner").trim() || "Owner",
    date: new Date().toISOString(),
    role: String(role || "Temen deket").trim() || "Temen deket",
    msgtype: imageBuffer ? "image" : "text",
    custom_profile: String(instruction || "").trim() || undefined,
    commands: Array.isArray(commands) ? commands : [],
  };

  if (imageBuffer) {
    payload.image = imageBuffer.toString("base64");
  }

  const response = await axios.post(
    `https://api.termai.cc/api/chat/logic-bell?key=${encodeURIComponent(apiKey)}`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 60000,
    },
  );

  const data = response.data;
  if (!data?.status) {
    throw new Error(data?.msg || data?.message || "Logic Bell request failed.");
  }

  const text = String(data?.data?.msg || data?.msg || "").trim();

  return {
    text,
    raw: data,
    model: "logic-bell",
    energy: data?.data?.energy || null,
  };
}

export { chat };
export default chat;
