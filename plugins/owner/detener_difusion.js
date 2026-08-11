const pluginConfig = {
  name: 'detener_difusion',
  alias: ['stopbroadcastpc'],
  category: 'owner',
  description: 'Detener el broadcast privado que está en ejecución',
  usage: '.stopbcpc',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true
}

async function handler(m) {
  if (!global.statusBcpc) {
    return m.reply('❌ No hay ningún broadcast privado en ejecución.')
  }
  global.stopBcpc = true
  return m.reply('⏹️ Deteniendo el broadcast privado...')
}

export { pluginConfig as config, handler }
