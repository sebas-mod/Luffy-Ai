import { getDatabase } from "../../src/lib/luffy-database.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: ["tod", "putarbotol"],
  alias: ["todgame"],
  category: "fun",
  description: "¡Juega a Verdad o Reto con tus amigos del grupo al instante!",
  usage: ".tod",
  example: ".tod",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  carne: 1,
  isEnabled: true,
};

const truths = [
  "¿A quién le escribiste por último antes de este mensaje?",
  "¿Cuál es el mayor secreto que nunca le has contado a nadie de este grupo?",
  "Si tuvieras que casarte con un miembro de este grupo, ¿a quién elegirías? ¡Etiquétalo!",
  "¿Alguna vez te ha gustado alguien de este grupo pero no te atreviste a decirlo?",
  "¿Cuál es lo más vergonzoso que te ha pasado en público?",
  "Menciona 3 cosas que más odias de ti mismo.",
  "Si pudieras volver al pasado, ¿qué momento vergonzoso cambiarías?",
  "¿Quién es tu ex más lindo/a? ¿Por qué terminaron?",
  "¿Alguna vez mentiste a tus padres para faltar a la escuela/universidad/trabajo? ¡Cuéntalo!",
  "¿Qué es lo más ridículo que has buscado en el historial de Google?",
  "¿Qué miembro de este grupo es el más divertido y quién el más molesto?",
  "¿Cuándo fue la última vez que lloraste y por qué?",
  "¿Cuánto saldo tienes en tu cuenta/e-wallet ahora? ¡Sé honesto!",
  "¿Alguien te ha pillado espiando sus redes sociales? ¿A quién?",
  "¿Cuál es la mentira más grande que le has dicho a tu mejor amigo?"
];

const dares = [
  "¡Envía una selfie con la peor pose ahora mismo al grupo!",
  "Envía una nota de voz cantando el estribillo de la canción 'Mis Cinco Globos' pero cambiando todas las vocales por 'O'.",
  "Escríbele a tu ex ahora, dile 'todavía te quiero', haz captura y envíala al grupo!",
  "¡Usa tu peor foto de perfil durante 1 hora completa!",
  "Escribe en tu estado de WhatsApp 'te quiero muchísimo [etiqueta a 1 miembro del grupo]' y déjalo 30 minutos. ¡Captura y envía al grupo!",
  "Envía una nota de voz diciendo 'Mewing mewing sigma skibidi' con tono serio al grupo.",
  "Envía al grupo 5 stickers de los más absurdos/raros que tengas.",
  "Etiqueta a un admin del grupo y dile 'Hoy estás muy feo/a'.",
  "Cambia tu bio de WhatsApp a 'Soy un payaso de circo' durante 1 día.",
  "¡Envíale la frase de ligue más cursi a un miembro del sexo opuesto de este grupo!",
  "Escribe un poema cursi sobre pollo frito y léelo en una nota de voz.",
  "Escribe 'en realidad soy un alien' y etiqueta a 3 personas al azar del grupo.",
  "¡Di tu nombre completo gritando en una nota de voz!",
  "Elige un número al azar de tus contactos, envíale 'P' 10 veces y haz captura aquí.",
  "Usa la foto de perfil de este bot como tu foto de perfil de WhatsApp durante 30 minutos."
];

async function handler(m, { sock }) {
  try {
    const cmd = m.command.toLowerCase();
    if (cmd === "tod" || cmd === "spin" || cmd === "putarbotol") {
      const groupMetadata = await sock.groupMetadata(m.chat);
      const participants = groupMetadata.participants;
      const randomMember = participants[Math.floor(Math.random() * participants.length)];
      const targetJid = randomMember.jid;
      const isTruth = Math.random() > 0.5;
      let typeLabel = "";
      let challengeText = "";

      if (isTruth) {
        typeLabel = "🗣️ *TRUTH* 🗣️\n_(¡Debe responderse con total honestidad!)_";
        challengeText = truths[Math.floor(Math.random() * truths.length)];
      } else {
        typeLabel = "🔥 *DARE* 🔥\n_(¡Debe cumplirse, demuéstralo al grupo!)_";
        challengeText = dares[Math.floor(Math.random() * dares.length)];
      }

      let text = `☽◯☾ ╭━ ♰ 🍾 ♰ ━╮ ☽◯☾\n   *¡LA BOTELLA GIRA!* 🍾\n╰━ ⊱༺༒༻⊰ ━╯\n\n`;
      text += `La botella gira rápido en medio de todos...\n`;
      text += `Lentamente se va frenando, y se detiene señalando a...\n\n`;
      text += `⚡•───•⚡\n👉 @${targetJid.split('@')[0]} 👈\n⚡•───•⚡\n\n`;
      text += `${typeLabel}\n\n`;
      text += `*Reto/Pregunta:*\n👉 ${challengeText}`;

      return m.reply(text, { mentions: [targetJid] });
    }
  } catch (error) {
    console.error("[ToD Plugin Error]", error);
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
