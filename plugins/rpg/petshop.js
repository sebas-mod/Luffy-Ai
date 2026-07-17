import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "petshop",
  alias: ["tokopet", "buypet", "belipet"],
  category: "rpg",
  description: "Comprar mascota de la tienda",
  usage: ".petshop <buy> <pet>",
  example: ".petshop buy cat",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const PETS_FOR_SALE = {
  cat: { name: "🐱 Gato", price: 5000, desc: "Porta buena suerte (Suerte alta, Ataque medio)" },
  dog: { name: "🐕 Perro", price: 6000, desc: "Guardián leal (Ataque alto, Buena defensa)" },
  bird: { name: "🐦 Pájaro", price: 4500, desc: "Ágil y con suerte (Suerte muy alta)" },
  fish: { name: "🐟 Pez", price: 3000, desc: "Barato y alegre (Porta buena fortuna)" },
  rabbit: { name: "🐰 Conejo", price: 5500, desc: "Pequeño y ágil (Todas las stats balanceadas)" },
};

function handler(m) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const petKey = args[1]?.toLowerCase();

  if (!action || action !== "buy") {
    let txt = `¡Hola Aventurero! Bienvenido a la Tienda de Mascotas 🐾🏪\n`;
    txt += `¡Elige a tu adorable compañero de aventuras!\n\n`;
    
    txt += `*Lista de Mascotas:*\n`;
    for (const [key, pet] of Object.entries(PETS_FOR_SALE)) {
      txt += `\n*${pet.name}*\n`;
      txt += `💰 Precio: Belly ${pet.price.toLocaleString()}\n`;
      txt += `📝 Rasgo: ${pet.desc}\n`;
      txt += `👉 Adopsi: \`.petshop buy ${key}\`\n`;
    }
    
    txt += `\n\n💰 *Tu Dinero:* Belly ${(user.belly || 0).toLocaleString()}`;
    return m.reply(txt);
  }

  if (action === "buy") {
    if (!petKey) {
      return m.reply(`¡Vamos, ¿qué mascota quieres adoptar? ¡Escribe el tipo! 😂\nEjemplo: \`${m.prefix}petshop buy cat\``);
    }

    if (user.rpg.pet) {
      return m.reply(`¡Vaya, ya tienes una mascota! 😭\n¡Pobre de ella si se pone celosa! Libera a tu mascota anterior o prueba el sistema de cruzamiento (\`.breeding\`).`);
    }

    const petToBuy = PETS_FOR_SALE[petKey];
    if (!petToBuy) {
      return m.reply(`Lo siento, ese tipo de mascota no está disponible o no se vende aquí! ❌\nRevisa la lista con \`${m.prefix}petshop\``);
    }

    if ((user.belly || 0) < petToBuy.price) {
      return m.reply(`¡Ay, no tienes suficiente dinero para la adopción! 😭\nEl costo es Belly ${petToBuy.price.toLocaleString()} pero solo tienes Belly ${(user.belly || 0).toLocaleString()}`);
    }

    user.belly -= petToBuy.price;

    user.rpg.pet = {
      type: petKey,
      name: petToBuy.name.split(" ")[1] || "My Pet",
      level: 1,
      exp: 0,
      hunger: 80,
      stats: null,
    };

    db.save();

    return m.reply(
      `¡¡FELICIDADES! 🎉🎉\n\n` +
        `¡Oficialmente adoptaste a *${petToBuy.name}*!\n` +
        `💰 Costo de Adopción: *Belly -${petToBuy.price.toLocaleString()}*\n\n` +
        `¡No puede esperar para pasear contigo! No olvides darle de comer y revisar su estado con \`${m.prefix}pet\`! 🐾✨`
    );
  }
}

export { pluginConfig as config, handler };
