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
} from "../../src/lib/luffy-game-data.js";
import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "family100",
  alias: ["f100", "survei"],
  category: "game",
  description: "Survey says! Adivina las respuestas más populares de la encuesta",
  usage: ".family100",
  example: ".family100",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
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

      let text = `¡Vaya, la sesión de Family 100 sigue en curso! 😱✨\n\n`;
      text += `*${session.question.soal}*\n\n`;
      text += `Respondidas: *${answered.length} de ${total}*\n`;
      answered.forEach((ans, i) => {
        text += `${i + 1}. ✅ ${ans}\n`;
      });
      for (let i = answered.length; i < total; i++) {
        text += `${i + 1}. ❓ ???\n`;
      }
      text += `\nTiempo restante: *${formatRemainingTime(remaining)}* ⏳\n`;
      text += `¡Apresúrate a responder este mensaje! 🔥`;
      await m.reply(text);
      return;
    }
  }

  const question = getRandomItem("family100.json");
  if (!question) {
    await m.reply("Uy, perdón, pero las preguntas del juego están vacías 😭💔");
    return;
  }

  const total = question.jawaban.length;

  let text = `¡Es hora de jugar *FAMILY 100*! 🎉✨\n\n`;
  text += `*Pregunta:* ${question.soal}\n\n`;
  text += `Total de Respuestas: *${total}* 📝\n`;
  for (let i = 0; i < total; i++) {
    text += `${i + 1}. ❓ ???\n`;
  }
  text += `\nSolo tienes *120 segundos*! ⏱️\n`;
  text += `¿El premio? *EXP* & *Berry* aleatorios por cada respuesta correcta! 🎁💸\n\n`;
  text += `Cómo jugar: simplemente *responde a este mensaje* con tu respuesta, o escribe la palabra *nyerah* / *me rindo* si ya estás harto 🏳️😂`;

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

    let timeoutText = `¡Qué pena, el tiempo se acabó! 😭😭⏱️\n\n`;
    timeoutText += `Acertaron *${answered.length}* de *${question.jawaban.length}* respuestas! ✨\n\n`;
    if (remaining.length > 0) {
      timeoutText += `Estas son las respuestas que se perdieron:\n`;
      remaining.forEach((ans) => {
        timeoutText += `• ${ans}\n`;
      });
    }
    timeoutText += `\n¡Gracias por jugar, esperamos la próxima sesión! 💖🎉`;

    endSession(chatId);
    await sock.sendMessage(chatId, { text: timeoutText }, { quoted: sentMsg });
  });
}

async function family100AnswerHandler(m, sock) {
  const chatId = m.chat;
  const session = getSession(chatId);

  if (!session || session.gameType !== "family100") return false;
  if (!m.body || m.isCommand) return false;

  const userAnswer = m.body.toLowerCase().trim();
  if (!userAnswer) return false;

  const isQuotingGame = isReplyToGame(m, session);

  const spanishSurrender = /^(me rindo|me doy por vencido|rendirse|rendicion|abandono|pasar|paso|no se|no sé)$/i.test(userAnswer);

  if (isSurrender(userAnswer) || spanishSurrender) {
    const answered = session.answered || [];
    const remaining = session.question.jawaban.filter(
      (j) => !answered.includes(j.toLowerCase()),
    );

    let text = `¿O sea que se rinden? 🥺🏳️\n\n`;
    text += `¡Pero ya habían acertado *${answered.length}* de *${session.question.jawaban.length}*! 👏\n\n`;
    if (remaining.length > 0) {
      text += `Te digo las respuestas restantes:\n`;
      remaining.forEach((ans) => {
        text += `• ${ans}\n`;
      });
    }
    text += `\nNo pasa nada, la próxima será con una sonrisa completa! 💖✨`;

    endSession(chatId);
    await m.reply(text);
    return true;
  }

  const correctAnswers = session.question.jawaban.map((j) => j.toLowerCase());
  const answered = session.answered || [];

  if (answered.includes(userAnswer)) {
    if (isQuotingGame) {
      await m.react("⚠️");
      await m.reply(`¡Ey, la respuesta *${userAnswer}* ya la dijeron antes! Busca otra 😂✨`);
      return true;
    }
    return false;
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
      db.updateBerry(m.sender, answerReward.berry);
      db.save();

      if (session.answered.length === correctAnswers.length) {
        endSession(chatId);

        const participants = Object.values(session.answeredBy);
        const uniqueParticipants = [...new Set(participants)];

        let text = `¡¡WOWWW INCREÍBLE! ¡Se acertaron todas las respuestas! 🎉🔥✨\n\n`;
        text += `*Pregunta:* ${session.question.soal}\n\n`;
        session.question.jawaban.forEach((ans, i) => {
          const who = session.answeredBy[ans.toLowerCase()];
          text += `${i + 1}. ✅ ${ans} - @${who?.split("@")[0] || "?"}\n`;
        });
        text += `\n🎊 Felicidades a todos los que participaron pensando! ¡Tienen un cerebro increíble! 🧠💯`;

        await m.reply(text, { mentions: uniqueParticipants });
        return true;
      }

      const total = session.question.jawaban.length;
      let text = `¡Correctooooo! ✅🎉\n@${m.sender.split("@")[0]} gana *+${answerReward.exp} EXP* & *+${answerReward.berry} Berry*! 💸✨\n\n`;
      text += `*Pregunta:* ${session.question.soal}\n\n`;
      session.question.jawaban.forEach((ans, i) => {
        const isAnswered = session.answered.includes(ans.toLowerCase());
        if (isAnswered) {
          text += `${i + 1}. ✅ ${ans}\n`;
        } else {
          text += `${i + 1}. ❓ ???\n`;
        }
      });
      text += `\nVamos, quedan *${total - session.answered.length}* respuestas más! 🔥⏱️`;

      await m.reply(text, { mentions: [m.sender] });
      return true;
    }
  }

  if (isQuotingGame) {
    await m.react("❌");
    await m.reply(`¡Beeep! ❌ ¡Incorrecto! Vuelve a pensarlo 😂🧠`);
    return true;
  }

  await m.react("❌");
  return false;
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
