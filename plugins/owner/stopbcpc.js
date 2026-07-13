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
    return m.reply('❌ Tidak ada broadcast private yang sedang berjalan.')
  }
  global.stopBcpc = true
  return m.reply('⏹️ Menghentikan broadcast private...')
}

export { pluginConfig as config, handler }
