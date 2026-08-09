import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "breeding",
  alias: ["breed", "kawin", "petbreed"],
  category: "rpg",
  description: "Breeding pets untuk mendapat pet baru",
  usage: ".breeding @user",
  example: ".breeding @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3600,
  carne: 3,
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
  cat: "🐱 Gato",
  dog: "🐕 Perro",
  bird: "🐦 Pájaro",
  fish: "🐟 Pez",
  rabbit: "🐰 Conejo",
  lion: "🦁 León",
  wolf: "🐺 Lobo",
  phoenix: "🔥 Fénix",
  dragon: "🐉 Dragón",
  thunderbunny: "⚡ Conejo Trueno",
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const mentioned = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!mentioned) {
    return m.reply(
      `💕 *Granja & Cruce* 💕\n\n` +
        `Este sistema permite que tu mascota se aparee con la mascota de otro jugador!\nQuién sabe, tal vez consigas un descendiente raro! ✨\n\n` +
        `*Cómo Usarlo:*\n` +
        `👉 \`${m.prefix}breeding @usuario_objetivo\`\n\n` +
        `*Requisitos:* \n` +
        `1. Tú y el Objetivo deben tener mascota\n` +
        `2. Ambas mascotas deben tener mínimo Nivel 5\n` +
        `3. Costo de parto: *Rp 3.000*`
    );
  }

  if (mentioned === m.sender) {
    return m.reply(`Oye, ¿quieres aparearte contigo mismo? ¡No se puede! ¡Etiqueta a tu amigo! 😂❌`);
  }

  if (!user.rpg.pet) {
    return m.reply(`Ni siquiera tienes mascota bro! ¡Compra una primero en \`${m.prefix}petshop\` 😭`);
  }

  const partner = db.getUser(mentioned);
  if (!partner?.rpg?.pet) {
    return m.reply(`El objetivo que etiquetaste no tiene mascota! Pobre tu mascota siendo ignorada. 💔`);
  }

  const myPet = user.rpg.pet;
  const partnerPet = partner.rpg.pet;

  if ((myPet.level || 1) < 5) {
    return m.reply(`Tu mascota es demasiado chiquita para aparearse! Mínimo *Nivel 5* bro (Ahora Nivel ${myPet.level || 1}). 🐣`);
  }

  if ((partnerPet.level || 1) < 5) {
    return m.reply(`La mascota de tu pareja es demasiado pequeña para aparearse! Mínimo *Nivel 5* bro (Ahora Nivel ${partnerPet.level || 1}). 🐣`);
  }

  const breedingCost = 3000;
  if ((user.berry || 0) < breedingCost) {
    return m.reply(`Te falta dinero para pagar al veterinario bro! Se necesitan Rp ${breedingCost.toLocaleString()}. 😭`);
  }

  user.berry -= breedingCost;

  await m.react("💕");
  await m.reply(`Aw, tu ${PET_NAMES[myPet.type]} y la ${PET_NAMES[partnerPet.type]} de tu amigo están a solas ahora... 💕✨\nEspera un momento, el veterinario está revisando el parto!`);
  await new Promise((r) => setTimeout(r, 4000));

  const breedKey = [myPet.type, partnerPet.type].sort().join("+");
  const possibleResults = BREEDING_RESULTS[breedKey] || BREEDING_RESULTS["default"];
  const resultPetType = possibleResults[Math.floor(Math.random() * possibleResults.length)];

  const isRare = ["lion", "wolf", "phoenix", "dragon", "thunderbunny"].includes(resultPetType);

  if (!user.rpg.petStorage) user.rpg.petStorage = [];

  const newPet = {
    type: resultPetType,
    name: PET_NAMES[resultPetType]?.split(" ")[1] || "Bebé",
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

  let txt = `¡AWWW!! ¡NACIÓ UN NUEVO BEBÉ! 🍼✨\n\n`;
  if (isRare) {
    txt += `🎉 *¡¡SUERTUDO!! ¡DESCENDIENTE RARO!!* 🎉\n`;
  }
  
  txt += `¡Felicidades! Lograste incubar un bebé:\n`;
  txt += `🐣 Especie: *${PET_NAMES[resultPetType]}*\n\n`;
  
  txt += `Obtuviste EXP *+${expReward}*\n`;
  txt += `Costo del Parto: *Rp -${breedingCost.toLocaleString()}*\n\n`;
  
  txt += `*(El bebé de tu mascota fue guardado en el Almacén de Mascotas. Tu almacenamiento total: ${user.rpg.petStorage.length} mascotas)*`;

  return m.reply(txt, { mentions: [m.sender, mentioned] });
}

export { pluginConfig as config, handler };
