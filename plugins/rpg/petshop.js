import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "petshop",
  alias: ["tokopet", "buypet", "belipet"],
  category: "rpg",
  description: "Beli pet dari toko",
  usage: ".petshop <buy> <pet>",
  example: ".petshop buy cat",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

const PETS_FOR_SALE = {
  cat: { name: "🐱 Gato", price: 5000, desc: "Trae suerte (Luck alto, Attack medio)" },
  dog: { name: "🐕 Perro", price: 6000, desc: "Guardián leal (Attack alto, Defense buena)" },
  bird: { name: "🐦 Pájaro", price: 4500, desc: "Ágil y con suerte (Luck muy alto)" },
  fish: { name: "🐟 Pez", price: 3000, desc: "Económico (Trae buena suerte)" },
  rabbit: { name: "🐰 Conejo", price: 5500, desc: "Pequeño y ágil (Stats balanceados)" },
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
    txt += `¡Elige a estos adorables compañeros de aventura!\n\n`;
    
    txt += `*Lista de Mascotas:*\n`;
    for (const [key, pet] of Object.entries(PETS_FOR_SALE)) {
      txt += `\n*${pet.name}*\n`;
      txt += `💰 Precio: Rp ${pet.price.toLocaleString()}\n`;
      txt += `📝 Carácter: ${pet.desc}\n`;
      txt += `👉 Adoptar: \`.petshop buy ${key}\`\n`;
    }
    
    txt += `\n\n💰 *Tu Dinero:* Rp ${(user.berry || 0).toLocaleString()}`;
    return m.reply(txt);
  }

  if (action === "buy") {
    if (!petKey) {
      return m.reply(`Oye, ¿qué animal quieres adoptar? ¡Dinos el tipo! 😂\nEjemplo: \`${m.prefix}petshop buy cat\``);
    }

    if (user.rpg.pet) {
      return m.reply(`Uy bro, ¡ya tienes mascota! 😭\nPobre, se pondrá celosa. Libera a tu mascota anterior o prueba el sistema de cruce (\`.breeding\`).`);
    }

    const petToBuy = PETS_FOR_SALE[petKey];
    if (!petToBuy) {
      return m.reply(`Lo siento bro, esa especie está agotada o simplemente no se vende aquí! ❌\nRevisa la lista de nuevo con \`${m.prefix}petshop\``);
    }

    if ((user.berry || 0) < petToBuy.price) {
      return m.reply(`Uy, no alcanza el dinero para la cuota de adopción bro! 😭\nEl costo total es Rp ${petToBuy.price.toLocaleString()} pero solo tienes Rp ${(user.berry || 0).toLocaleString()}`);
    }

    user.berry -= petToBuy.price;

    user.rpg.pet = {
      type: petKey,
      name: petToBuy.name.split(" ")[1] || "Mi Mascota",
      level: 1,
      exp: 0,
      hunger: 80,
      stats: null,
    };

    db.save();

    return m.reply(
      `¡FELICIDADES! 🎉🎉\n\n` +
        `Adoptaste oficialmente a *${petToBuy.name}*!\n` +
        `💰 Cuota de Adopción: *Rp -${petToBuy.price.toLocaleString()}*\n\n` +
        `Él/Ella está ansioso por pasear contigo. No olvides alimentarlo y revisar su estado con \`${m.prefix}pet\`! 🐾✨`
    );
  }
}

export { pluginConfig as config, handler };
