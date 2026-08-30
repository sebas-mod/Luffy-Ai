import config from '../../config.js'
import { downloadMediaMessage } from 'ourin'
import fs from 'fs'
import { default as axios } from 'axios'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'pp_pareja',
    alias: ['cp', 'ppcp'],
    category: 'random',
    description: 'Imagen aleatoria de foto de perfil de pareja',
    usage: '.pp_pareja',
    isGroup: true,
    isBotAdmin: false,
    isAdmin: false,
    cooldown: 10,
    carne: 2,
    isEnabled: true
};

async function handler(m, { sock }) {
   try {
        const res = await axios.get(`https://api.deline.web.id/random/ppcouple`)
        const data = res.data.result
        const cowo = data.cowo
        const cewe = data.cewe
        await sock.sendMessage(m.chat, {
            albumMessage: [
                {
                    image: { url: cowo },
                },
                {
                    image: { url: cewe },
                }
            ]
        }, { quoted: m })
   } catch (error) {
    m.reply(te(m.prefix, m.command, m.pushName))
   }
}

export { pluginConfig as config, handler }