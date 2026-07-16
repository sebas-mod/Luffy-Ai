import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
  name: 'custompayment',
  alias: ['setpayment', 'setpaytext'],
  category: 'owner',
  description: 'Configura el texto personalizado de .payment con variables',
  usage: '.custompayment <texto> / .custompayment reset',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true
}

async function handler(m) {
  const db = getDatabase()
  const input = m.text?.trim()
  const current = db.setting('customPaymentText') || ''

  if (!input) {
    return m.reply(
      `📝 *CUSTOM PAYMENT TEXT*\n\n` +
      `Texto actualmente:\n${current || '_(no configurado, usando predeterminado)_'}\n\n` +
      `*PLACEHOLDER YANG TERSEDIA:*\n` +
      `• \`{botname}\` — Nombre bot\n` +
      `• \`{owner}\` — Nombre owner\n` +
      `• \`{methods}\` — Lista e-wallet\n` +
      `• \`{banks}\` — Lista bank\n` +
      `• \`{qris}\` — Status QRIS\n\n` +
      `*CONTOH:*\n` +
      `> \`${m.prefix}custompayment Halo! Bayar a {methods}\`\n\n` +
      `> \`${m.prefix}custompayment reset\` — Ambalikan a default`
    )
  }

  if (input.toLowerCase() === 'reset') {
    db.setting('customPaymentText', '')
    return m.reply('✅ El texto de pago personalizado ha sido restaurado al predeterminado.')
  }

  db.setting('customPaymentText', input)
  return m.reply(`✅ ¡El texto de pago personalizado ha sido guardado!\n\nPreview:\n${input}`)
}

export { pluginConfig as config, handler }
