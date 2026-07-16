import {
  getRandomItem,
  createSession,
  getSession,
  endSession,
  hasActiveSession,
  setSessionTimer,
  getRemainingTime,
  formatRemainingTime,
  isSurrender,
  isReplyToGame,
  getRandomReward,
} from "../../src/lib/ourin-game-data.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "family100",
  alias: ["f100", "survei"],
  category: "game",
  description: "Survey says! Adivina las respuestas mas votadas de la encuesta",
  usage: ".family100",
  example: ".family100",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const chatId = m.chat;

  if (hasActiveSession(chatId)) {
    const session = getSession(chatId);
    if (session && session.gameType === "family100") {
      const remaining = getRemainingTime(chatId);
      const answered = session.answered || [];
      const total = session.question.jawaban.length;

      let text = `¡Vaya, la sesion de Family 100 sigue activa! 😱✨\n\n`;
      text += `*${session.question.soal}*\n\n`;
      text += `Respondido: *${answered.length} de ${total}*\n`;
      answered.forEach((ans, i) => {
        text += `${i + 1}. ✅ ${ans}\n`;
      });
      for (let i = answered.length; i < total; i++) {
        text += `${i + 1}. ❓ ???\n`;
      }
      text += `\nTiempo restante: *${formatRemainingTime(remaining)}* ⏳\n`;
      text += `¡Responde rapido! 🔥`;
      await m.reply(text);
      return;
    }
  }

  const question = getRandomItem("family100.json");
  if (!question) {
    await m.reply("Lo siento, las preguntas del juego estan vacias 😭💔");
    return;
  }

  const total = question.jawaban.length;

  let text = `Es hora de jugar *FAMILY 100*! 🎉✨\n\n`;
  text += `*Pregunta:* ${question.soal}\n\n`;
  text += `Total de Respuestas: *${total}* 📝\n`;
  for (let i = 0; i < total; i++) {
    text += `${i + 1}. ❓ ???\n`;
  }
  text += `\nSolo tienes *120 segundos*! ⏱️\n`;
  text += `¿Premios? *EXP* y *Monedas* aleatorias por cada respuesta correcta! 🎁💸\n\n`;
  text += `Como jugar: responde directamente a este mensaje con tu respuesta, o responde con la palabra *rendirse* si ya no puedes mas 🏳️😂`;

  const sentMsg = await m.reply(text);

  const session = createSession(
    chatId,
    "family100",
    question,
    sentMsg.key,
    120000,
  );
  session.answered = [];
  session.answeredBy = {};

  setSessionTimer(chatId, async () => {
    const sess = getSession(chatId);
    const answered = sess?.answered || [];
    const remaining = question.jawaban.filter(
      (j) => !answered.includes(j.toLowerCase()),
    );

    let timeoutText = `¡Vaya, el tiempo se agoto! 😭😭⏱️\n\n`;
    timeoutText += `Lograron adivinar *${answered.length}* de *${question.jawaban.length}* respuestas! ✨\n\n`;
    if (remaining.length > 0) {
      timeoutText += `Estas son las respuestas que faltaron:\n`;
      remaining.forEach((ans) => {
        timeoutText += `• ${ans}\n`;
      });
    }
    timeoutText += `\n¡Gracias por jugar, esperamos la proxima sesion! 💖🎉`;

    endSession(chatId);
    await sock.sendMessage(chatId, { text: timeoutText }, { quoted: sentMsg });
  });
}

async function family100AnswerHandler(m, sock) {
  const chatId = m.chat;
  const session = getSession(chatId);

  if (!session || session.gameType !== "family100") return false;
  if (!isReplyToGame(m, session)) return false;

  const userAnswer = (m.body || "").toLowerCase().trim();
  if (!userAnswer || userAnswer.startsWith(".")) return false;

  if (isSurrender(userAnswer)) {
    const answered = session.answered || [];
    const remaining = session.question.jawaban.filter(
      (j) => !answered.includes(j.toLowerCase()),
    );

    let text = `¡Oh, todos se rindieron? 🥺🏳️\n\n`;
    text += `Aunque ya habian adivinado *${answered.length}* de *${session.question.jawaban.length}*! 👏\n\n`;
    if (remaining.length > 0) {
      text += `Aqui estan las respuestas restantes:\n`;
      remaining.forEach((ans) => {
        text += `• ${ans}\n`;
      });
    }
    text += `\nNo pasa nada, la proxima vez lo lograras! 💖✨`;

    endSession(chatId);
    await m.reply(text);
    return true;
  }

  const correctAnswers = session.question.jawaban.map((j) => j.toLowerCase());
  const answered = session.answered || [];

  if (answered.includes(userAnswer)) {
    await m.react("⚠️");
    await m.reply(`Cuidado, la respuesta *${userAnswer}* ya la alguien dijo antes! Busca otra 😂✨`);
    return true;
  }

  const matchIndex = correctAnswers.findIndex((ans) => {
    const similarity = getSimilarity(ans, userAnswer);
    return (
      similarity >= 0.8 || ans.includes(userAnswer) || userAnswer.includes(ans)
    );
  });

  if (matchIndex !== -1) {
    const originalAnswer = session.question.jawaban[matchIndex];

    if (!answered.includes(originalAnswer.toLowerCase())) {
      session.answered.push(originalAnswer.toLowerCase());
      session.answeredBy[originalAnswer.toLowerCase()] = m.sender;

      const db = getDatabase();
      const user = db.getUser(m.sender);

      const answerReward = getRandomReward();
      if (!user.rpg) user.rpg = {};
      await addExpWithLevelCheck(sock, m, db, user, answerReward.exp);
      db.updateKoin(m.sender, answerReward.koin);
      db.save();

      if (session.answered.length === correctAnswers.length) {
        endSession(chatId);

        const participants = Object.values(session.answeredBy);
        const uniqueParticipants = [...new Set(participants)];

        let text = `¡WOW, INCREIBLE! ¡Todas las respuestas fueron adivinadas! 🎉🔥✨\n\n`;
        text += `*Pregunta:* ${session.question.soal}\n\n`;
        session.question.jawaban.forEach((ans, i) => {
          const who = session.answeredBy[ans.toLowerCase()];
          text += `${i + 1}. ✅ ${ans} - @${who?.split("@")[0] || "?"}\n`;
        });
        text += `\n🎊 Felicidades a todos los que participaron! ¡Son geniales! 🧠💯`;

        await m.reply(text, { mentions: uniqueParticipants });
        return true;
      }

      const total = session.question.jawaban.length;
      let text = `¡Correcto! ✅🎉\n@${m.sender.split("@")[0]} obtuvo *+${answerReward.exp} EXP* y *+${answerReward.koin} Monedas*! 💸✨\n\n`;
      text += `*Pregunta:* ${session.question.soal}\n\n`;
      session.question.jawaban.forEach((ans, i) => {
        const isAnswered = session.answered.includes(ans.toLowerCase());
        if (isAnswered) {
          text += `${i + 1}. ✅ ${ans}\n`;
        } else {
          text += `${i + 1}. ❓ ???\n`;
        }
      });
      text += `\nVamos, quedan *${total - session.answered.length}* respuestas mas! 🔥⏱️`;

      await m.reply(text, { mentions: [m.sender] });
      return true;
    }
  }

  await m.react("❌");
  await m.reply(`¡Error! ❌ Incorrecto! Piensa un poco mas 😂🧠`);
  return true;
}

function getSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const costs = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }

  return (longer.length - costs[shorter.length]) / longer.length;
}

export { pluginConfig as config, handler, family100AnswerHandler };
