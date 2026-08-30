import fs from 'fs'
import path from 'path'
import gtts from 'gtts'
const pluginConfig = {
    name: 'ver_khodam',
    alias: ["khodam"],
    category: 'fun',
    description: 'Comprueba tu khodam o el de otra persona',
    usage: '.ver_khodam o responde al mensaje de alguien',
    example: '.ver_khodam',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 1,
    isEnabled: true
}
const KHODAMS = [
    { name: "Tigre Blanco", meaning: "Eres fuerte y valiente como un tigre, porque tus ancestros te heredaron una gran fuerza." },
    { name: "Lámpara Dormida", meaning: "Parece somnoliento pero siempre da una luz cálida" },
    { name: "Panda Desdentado", meaning: "Eres adorable y siempre logras sacar sonrisas con tus rarezas." },
    { name: "Pato de Goma", meaning: "Siempre estás tranquilo y alegre, capaz de afrontar las olas de problemas con una sonrisa." },
    { name: "Tortuga Ninja", meaning: "Eres ágil y resistente, listo para proteger a los débiles con tu poder de combate." },
    { name: "Gato Refrigerador", meaning: "Eres misterioso y siempre estás en lugares inesperados." },
    { name: "Jabón Perfumado", meaning: "Siempre llevas frescura y buenos aromas dondequiera que estés." },
    { name: "Hormiga Pequeña", meaning: "Eres trabajador y siempre confiable en cualquier situación." },
    { name: "Cupcake Arcoíris", meaning: "Eres dulce y lleno de color, siempre traes felicidad y alegría." },
    { name: "Mini Robot", meaning: "Eres sofisticado y siempre listo para ayudar con alta inteligencia tecnológica." },
    { name: "Pez Volador", meaning: "Eres único y lleno de sorpresas, siempre superas los límites." },
    { name: "Pollo Frito", meaning: "Siempre caes bien y te esperan con ansias, lleno de sabor en cada paso." },
    { name: "Cucaracha Voladora", meaning: "Siempre sorprendes y animas toda la habitación." },
    { name: "Cabra Perforadora", meaning: "Eres único y siempre haces reír a la gente con tus rarezas." },
    { name: "Galleta Crujiente", meaning: "Siempre haces el ambiente más divertido y agradable." },
    { name: "Alcancía Cerdito", meaning: "Siempre guardas sorpresas dentro de ti." },
    { name: "Armario Viejo", meaning: "Estás lleno de historias y recuerdos del pasado." },
    { name: "Café con Leche", meaning: "Eres dulce y siempre animas a quienes te rodean." },
    { name: "Escoba de Varillas", meaning: "Eres fuerte y siempre confiable para limpiar problemas." },
    { name: "Indomie Frito", meaning: "Siempre llena el estómago y alegra" },
    { name: "Helado Derretido", meaning: "Siempre derrite el ambiente con su dulzura" },
    { name: "Albóndiga Tenaz", meaning: "Siempre tenaz y firme al enfrentar problemas" },
    { name: "Pegamento Súper", meaning: "Siempre se pega en situaciones complicadas" },
    { name: "Salsa de Soja Dulce", meaning: "Siempre aporta un toque dulce a la vida" },
    { name: "Jabón de Baño", meaning: "Siempre limpio y fragante" },
    { name: "Café Derramado", meaning: "Siempre lleno de energía, pero a veces desordenado" },
    { name: "Gato Callejero", meaning: "Siempre independiente y lleno de aventura" },
    { name: "Remedio Amargo", meaning: "Siempre da fuerza aunque al principio sea desagradable" },
    { name: "Té en Bolsita", meaning: "Siempre da calidez al corazón" },
    { name: "Moto Astrea", meaning: "Siempre leal y travieso" },
    { name: "Fideos Instantáneos", meaning: "Siempre rápido y saciante" },
    { name: "Bizcocho al Vapor", meaning: "Siempre suave y dulce" },
    { name: "Tofu Redondo", meaning: "Siempre rico en cualquier ocasión" },
    { name: "Arroz Uduk", meaning: "Siempre perfecto en cualquier momento" },
    { name: "León Coronado", meaning: "Naciste como líder, con la fuerza y la sabiduría de un rey." },
    { name: "Pantera Negra", meaning: "Eres misterioso y fuerte, como una pantera que rara vez se ve pero siempre está alerta." },
    { name: "Caballo de Oro", meaning: "Eres valioso y fuerte, listo para correr hacia el éxito." },
    { name: "Águila Azul", meaning: "Tienes una visión aguda y puedes ver oportunidades desde lejos." },
    { name: "Dragón Arcoíris", meaning: "Eres resistente y tienes el poder de proteger y atacar." },
    { name: "Elefante Blanco", meaning: "Eres sabio y de gran poder, símbolo de valentía y firmeza." },
    { name: "Toro Mágico", meaning: "Eres fuerte y lleno de energía, sin miedo a los obstáculos." },
    { name: "Ventilador", meaning: "Siempre trae un aire fresco" },
    { name: "Olla Arrocera", meaning: "Siempre cocina el arroz a la perfección" },
    { name: "Honda Beat", meaning: "Siempre ágil en la calle" },
    { name: "Chanclas", meaning: "Siempre relajado y cómodo" },
    { name: "Almohada Abrazable", meaning: "Siempre cómodo en el abrazo" },
    { name: "Perro Rastreador", meaning: "Eres leal y dedicado, siempre encuentras el camino hacia tu meta." }
]
function getRandomKhodam() {
    const idx = Math.floor(Math.random() * KHODAMS.length)
    return KHODAMS[idx]
}
function handler(m, { sock }) {
    let targetJid = m.sender
    let targetName = m.pushName || m.sender.split('@')[0]
    if (m.quoted) {
        targetJid = m.quoted.sender
        targetName = m.quoted.pushName || targetJid.split('@')[0]
    } else if (m.mentionedJid?.[0]) {
        targetJid = m.mentionedJid[0]
        targetName = targetJid.split('@')[0]
    } else if(m.text) {
        targetName = m.text
    }
    const khodam = getRandomKhodam()
    let txt = `Hola ${targetName || ""}, tu Khodam es ${khodam.name}, este Khodam significa: ${khodam.meaning}`
    const tts = new gtts(txt, 'id')
    const id = Date.now()
    const tempPath = path.join(process.cwd(), 'temp', `khodam-${id}.mp3`)
    tts.save(tempPath, async function (err) {
        if (err) return console.log(err)
        await sock.sendMedia(m.chat, fs.readFileSync(tempPath), null, m, { type: 'audio' })
        try {
            fs.unlinkSync(tempPath)
        } catch (error) {
        }
    })
}
export { pluginConfig as config, handler }