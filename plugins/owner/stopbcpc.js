const pluginConfig = {
  name: 'stopbcpc',
  alias: ['stopbroadcastpc'],
  category: 'owner',
  description: 'Detiene el envío masivo privado en curso',
  usage: '.stopbcpc',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true
}

async function handler(m) {
  if (!global.statusBcpc) {
    return m.reply('❌ No hay broadcast privado en ejecución.')
  }
  global.stopBcpc = true
  return m.reply('⏹️ Deteniendo broadcast private...')
}

export { pluginConfig as config, handler }
