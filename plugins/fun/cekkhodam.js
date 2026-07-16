import fs from 'fs'
import path from 'path'
import gtts from 'gtts'
const pluginConfig = {
    name: 'cekkhodam',
    alias: ['khodam', 'cekhodam'],
    category: 'fun',
    description: 'Verifica tu khodam o el de otra persona',
    usage: '.cekkhodam o responde al mensaje de alguien',
    example: '.cekkhodam',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}
const KHODAMS = [
    { name: "Tigre Blanco", meaning: "Eres fuerte y valiente como un tigre, porque tus ancestros te heredaron un gran poder." },
    { name: "Lámpara Dormida", meaning: "Pareces cansado pero siempre das una luz cálida" },
    { name: "Panda Dientes", meaning: "Eres adorable y siempre logras hacer sonreír a la gente con tu rareza." },
    { name: "Pato de Goma", meaning: "Siempre estás tranquilo y alegre, capaz de enfrentar las olas de problemas con una sonrisa." },
    { name: "Ninja Tortuga", meaning: "Eres ágil y fuerte, listo para proteger a los débiles con tu fuerza." },
    { name: "Gato de Nevera", meaning: "Eres misterioso y siempre apareces en lugares inesperados." },
    { name: "Jabón Perfumado", meaning: "Siempre traes fragancia y frescura donde quiera que vayas." },
    { name: "Hormiguita", meaning: "Eres trabajador y siempre se puede contar contigo en cualquier situación." },
    { name: "Cupcake Arcoíris", meaning: "Eres dulce y colorido, siempre traes felicidad y alegría." },
    { name: "Robot Mini", meaning: "Eres sofisticado y siempre listo para ayudar con alta tecnología." },
    { name: "Pez Volador", meaning: "Eres único y lleno de sorpresas, siempre superas los límites." },
    { name: "Pollo Frito", meaning: "Siempre eres querido y esperado por muchos, lleno de sabor en cada paso." },
    { name: "Cucaracha Voladora", meaning: "Siempre sorprendes y haces revuelo donde quiera que vas." },
    { name: "Cabra Taladradora", meaning: "Eres único y siempre haces reír a la gente con tu comportamiento raro." },
    { name: "Chicharrón Crujiente", meaning: "Siempre haces el ambiente más divertido y delicioso." },
    { name: "Alcancía de Cerdo", meaning: "Siempre guardas sorpresas dentro de ti." },
    { name: "Armario Viejo", meaning: "Estás lleno de historias y recuerdos del pasado." },
    { name: "Café con Leche", meaning: "Eres dulce y siempre animas a la gente a tu alrededor." },
    { name: "Escoba", meaning: "Eres fuerte y siempre se puede contar contigo para resolver problemas." },
    { name: "Fideo Instantáneo", meaning: "Siempre te hace sentir satisfeito y feliz" },
    { name: "Helado Derretido", meaning: "Siempre suavizas el ambiente con tu dulzura" },
    { name: "Albóndiga Pequeña", meaning: "Siempre eres perseverante y redondo ante los problemas" },
    { name: "Pegamento Fuerte", meaning: "Siempre te adhieres en situaciones complicadas" },
    { name: "Salsa Dulce", meaning: "Siempre das un toque dulce en la vida" },
    { name: "Jabón de Baño", meaning: "Siempre limpio y fragante" },
    { name: "Café Derramado", meaning: "Siempre lleno de energía, pero a veces desordenado" },
    { name: "Gato del Pueblo", meaning: "Siempre independiente y lleno de aventuras" },
    { name: "Remedio Amargo", meaning: "Siempre das fuerza aunque no sea agradable al principio" },
    { name: "Té de Bolsa", meaning: "Siempre das calidez en el corazón" },
    { name: "Moto Astrea", meaning: "Siempre fiel y terco" },
    { name: "Fideo de Paquete", meaning: "Siempre rápido y sustancioso" },
    { name: "Bizcocho al Vapor", meaning: "Siempre suave y dulce" },
    { name: "Tofu Redondo", meaning: "Siempre delicioso en cualquier momento" },
    { name: "Arroz con Leche", meaning: "Siempre encaja en cualquier momento" },
    { name: "León Coronado", meaning: "Naciste como líder, tienes la fuerza y sabiduría de un rey." },
    { name: "Pantera Negra", meaning: "Eres misterioso y fuerte, como un felino que rara vez se ve pero siempre está alerta." },
    { name: "Caballo Dorado", meaning: "Eres valioso y fuerte, listo para correr hacia el éxito." },
    { name: "Águila Azul", meaning: "Tienes una visión aguda y puedes ver las oportunidades desde lejos." },
    { name: "Dragón Arcoíris", meaning: "Eres resistente y tienes el poder de proteger y atacar." },
    { name: "Elefante Blanco", meaning: "Eres sabio y tienes gran fuerza, símbolo de valentía y firmeza." },
    { name: "Búfalo Sagrado", meaning: "Eres fuerte y lleno de espíritu, sin miedo a los obstáculos." },
    { name: "Ventilador", meaning: "Siempre das aire fresco" },
    { name: "Olla Arrocera", meaning: "Siempre cocinas arroz a la perfección" },
    { name: "Honda Beat", meaning: "Siempre ágil en las calles" },
    { name: "Chancleta", meaning: "Siempre relajado y cómodo" },
    { name: " almohada", meaning: "Siempre cómodo en los abrazos" },
    { name: "Perro Rastreador", meaning: "Eres fiel y dedicado, siempre encuentras el camino a tu destino." }
]
function getRandomKhodam() {
    const idx = Math.floor(Math.random() * KHODAMS.length)
    return KHODAMS[idx]
}
async function handler(m, { sock }) {
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
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
    const tts = new gtts(txt, 'es')
    const id = Date.now()
    const tempPath = path.join(tempDir, `khodam-${id}.mp3`)
    try {
        await new Promise((resolve, reject) => {
            tts.save(tempPath, function (err) {
                if (err) reject(err)
                else resolve()
            })
        })
        await sock.sendMedia(m.chat, fs.readFileSync(tempPath), null, m, { type: 'audio' })
    } catch (error) {
        console.log('[cekkhodam] Error:', error.message)
    } finally {
        try { fs.unlinkSync(tempPath) } catch {}
    }
}
export { pluginConfig as config, handler }
