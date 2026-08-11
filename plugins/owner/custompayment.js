import { getDatabase } from '../../src/lib/luffy-database.js'

const pluginConfig = {
  name: 'custompayment',
  alias: ["configurar_pago", "configurar_texto_pago"],
  category: 'owner',
  description: 'Configurar el texto personalizado de .payment con placeholders',
  usage: '.custompayment <texto> / .custompayment reset',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true
}

async function handler(m) {
  const db = getDatabase()
  const input = m.text?.trim()
  const current = db.setting('customPaymentText') || ''

  if (!input) {
    return m.reply(
      `📝 *TEXTO DE PAGO PERSONALIZADO*\n\n` +
      `Texto actual:\n${current || '_(aún no configurado, usa el predeterminado)_'}\n\n` +
      `*PLACEHOLDERS DISPONIBLES:*\n` +
      `• \`{botname}\` — Nombre del bot\n` +
      `• \`{owner}\` — Nombre del owner\n` +
      `• \`{methods}\` — Lista de e-wallets\n` +
      `• \`{banks}\` — Lista de bancos\n` +
      `• \`{qris}\` — Estado de QRIS\n\n` +
      `*EJEMPLO:*\n` +
      `> \`${m.prefix}custompayment ¡Hola! Paga a {methods}\`\n\n` +
      `> \`${m.prefix}custompayment reset\` — Restaurar el predeterminado`
    )
  }

  if (input.toLowerCase() === 'reset') {
    db.setting('customPaymentText', '')
    return m.reply('✅ El texto de pago personalizado se reinició al predeterminado.')
  }

  db.setting('customPaymentText', input)
  return m.reply(`✅ ¡Texto de pago personalizado guardado!\n\nVista previa:\n${input}`)
}

export { pluginConfig as config, handler }
