import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "breeding",
  alias: ["breed", "kawin", "petbreed"],
  category: "rpg",
  description: "Cruzar mascotas para obtener una nueva",
  usage: ".breeding @user",
  example: ".breeding @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3600,
  energi: 3,
  isEnabled: true,
};

const BREEDING_RESULTS = {
  "cat+cat": ["cat", "cat", "lion"],
  "dog+dog": ["dog", "dog", "wolf"],
  "cat+dog": ["cat", "dog", "rabbit"],
  "bird+bird": ["bird", "bird", "phoenix"],
  "fish+fish": ["fish", "fish", "dragon"],
  "rabbit+rabbit": ["rabbit", "rabbit", "thunderbunny"],
  "cat+bird": ["cat", "bird", "phoenix"],
  "dog+rabbit": ["dog", "rabbit", "wolf"],
  default: ["cat", "dog", "bird", "fish", "rabbit"],
};

const PET_NAMES = {
  cat: "🐱 Kucing",
  dog: "🐕 Anjing",
  bird: "🐦 Burung",
  fish: "🐟 Ikan",
  rabbit: "🐰 Kelinci",
  lion: "🦁 Singa",
  wolf: "🐺 Serigala",
  phoenix: "🔥 Phoenix",
  dragon: "🐉 Naga",
  thunderbunny: "⚡ Thunder Bunny",
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const mentioned = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!mentioned) {
    return m.reply(
      `💕 *Cría y Cruce de Mascotas* 💕\n\n` +
        `¡Este sistema permite cruzar tu mascota con la de otro jugador!\n¡Quién sabe, tal vez obtengas una descendencia rara! ✨\n\n` +
        `*Cómo Usar:*\n` +
        `👉 \`${m.prefix}breeding @user_objetivo\`\n\n` +
        `*Requisitos:* \n` +
        `1. Ambos deben tener mascota\n` +
        `2. Ambas mascotas mínimo Nivel 5\n` +
        `3. Costo de parto: *Rp 3.000*`
    );
  }

  if (mentioned === m.sender) {
    return m.reply(`Oye, ¿vas a cruzarte contigo mismo? ¡Eso no se puede! ¡Etiqueta a un amigo! 😂❌`);
  }

  if (!user.rpg.pet) {
    return m.reply(`¡Tú no tienes mascota! ¡Ve a comprar una en \`${m.prefix}petshop\`! 😭`);
  }

  const partner = db.getUser(mentioned);
  if (!partner?.rpg?.pet) {
    return m.reply(`¡El objetivo que etiquetaste no tiene mascota! Qué lástima por la tuya. 💔`);
  }

  const myPet = user.rpg.pet;
  const partnerPet = partner.rpg.pet;

  if ((myPet.level || 1) < 5) {
    return m.reply(`¡Tu mascota es muy joven para cruzar! Mínimo *Nivel 5* (Ahora: Nivel ${myPet.level || 1}). 🐣`);
  }

  if ((partnerPet.level || 1) < 5) {
    return m.reply(`¡La mascota del compañero es muy joven! Mínimo *Nivel 5* (Ahora: Nivel ${partnerPet.level || 1}). 🐣`);
  }

  const breedingCost = 3000;
  if ((user.koin || 0) < breedingCost) {
    return m.reply(`¡No tienes suficiente dinero para pagar al veterinario! Necesitas Rp ${breedingCost.toLocaleString()}. 😭`);
  }

  user.koin -= breedingCost;

  await m.react("💕");
  await m.reply(`Uy, tu ${PET_NAMES[myPet.type]} y el ${PET_NAMES[partnerPet.type]} de tu amigo están a solas... 💕✨\nEspera un momento, el doctor está revisando el parto!`);
  await new Promise((r) => setTimeout(r, 4000));

  const breedKey = [myPet.type, partnerPet.type].sort().join("+");
  const possibleResults = BREEDING_RESULTS[breedKey] || BREEDING_RESULTS["default"];
  const resultPetType = possibleResults[Math.floor(Math.random() * possibleResults.length)];

  const isRare = ["lion", "wolf", "phoenix", "dragon", "thunderbunny"].includes(resultPetType);

  if (!user.rpg.petStorage) user.rpg.petStorage = [];

  const newPet = {
    type: resultPetType,
    name: PET_NAMES[resultPetType]?.split(" ")[1] || "Baby",
    level: 1,
    exp: 0,
    hunger: 100,
    stats: null,
    birthDate: Date.now(),
  };

  user.rpg.petStorage.push(newPet);

  const expReward = isRare ? 500 : 200;
  await addExpWithLevelCheck(sock, m, db, user, expReward);
  db.save();

  await m.react(isRare ? "🎉" : "✅");

  let txt = `¡AWWW! ¡NACIMIENTO! 🍼✨\n\n`;
  if (isRare) {
    txt += `🎉 *¡¡SUERTE!! ¡¡DESCENDENCIA RARA!!* 🎉\n`;
  }
  
  txt += `¡Felicidades! Eclosionaste un bebé:\n`;
  txt += `🐣 Especie: *${PET_NAMES[resultPetType]}*\n\n`;
  
  txt += `EXP obtenida: *+${expReward}*\n`;
  txt += `Costo de Parto: *Rp -${breedingCost.toLocaleString()}*\n\n`;
  
  txt += `*(Tu bebé fue guardado en la Pet Storage. Total guardados: ${user.rpg.petStorage.length})*`;

  return m.reply(txt, { mentions: [m.sender, mentioned] });
}

export { pluginConfig as config, handler };
