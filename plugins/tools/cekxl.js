import axios from "axios"
import te from "../../src/lib/ourin-error.js"

const pluginConfig = {
    name: "cekxl",
    alias: ["checkxl", "xlcheck", "xlcek"],
    category: "tools",
    description: "Cek informasi paket dan kuota nomor XL/Axis secara detail",
    usage: ".cekxl <nomor>",
    example: ".cekxl 083150850721",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

function cleanNumber(phoneNumber) {
    let num = phoneNumber.replace(/\D/g, "")
    if (num.startsWith("0")) num = "62" + num.substring(1)
    if (!num.startsWith("62")) num = "62" + num
    return num
}

function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return "0 B"
    const units = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + units[i]
}

async function handler(m, { sock }) {
    const input = m.args[0] || m.text?.trim()

    if (!input) {
        return m.reply(
            `📱 *CEK XL/AXIS*\n\n` +
            `Esta función se utiliza para verificar información de paquetes y cuota disponible en tu número XL o Axis de forma completa y detallada\n\n` +
            `*Cómo usar:*\n` +
            `> \`${m.prefix}cekxl <número de teléfono>\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`${m.prefix}cekxl 083150850721\`\n` +
            `> \`${m.prefix}cekxl 6281234567890\`\n\n` +
            `_El formato del número puede usar 08xx, 628xx, o sin prefijo_`
        )
    }

    const cleanNum = cleanNumber(input)

    if (cleanNum.length < 10 || cleanNum.length > 15) {
        return m.reply(`❌ El número que ingresaste no es válido, asegúrate de que sea un número XL o Axis correcto`)
    }

    m.react("🕕")

    try {
        const { data } = await axios.get(
            `https://xl-ku.my.id/end.php?check=package&number=${cleanNum}&version=2`,
            { timeout: 30000 }
        )

        if (!data || data.error || data.status === false) {
            m.react("❌")
            return m.reply(`❌ No se puede verificar el número *${cleanNum}*, asegúrate de que sea un número XL o Axis activo`)
        }

        let txt = `📱 *INFORMASI XL/AXIS*\n\n`
        txt += `📞 Nomor: *${cleanNum}*\n`

        if (data.msisdn) txt += `🆔 MSISDN: *${data.msisdn}*\n`
        if (data.status) txt += `📊 Status: *${data.status}*\n`
        if (data.activeDate) txt += `📅 Activo desde: *${data.activeDate}*\n`
        if (data.expireDate) txt += `⏰ Vigencia: *${data.expireDate}*\n`
        if (data.graceDate) txt += `⚠️ Período de gracia: *${data.graceDate}*\n`

        if (data.packages && Array.isArray(data.packages) && data.packages.length > 0) {
            txt += `\n📦 *LISTA DE PAQUETES ACTIVOS*\n\n`
            for (const pkg of data.packages) {
                txt += `- *${pkg.name || pkg.packageName || "Paquete"}*\n`
                if (pkg.quota || pkg.remainingQuota) txt += `  > Cuota restante: *${pkg.remainingQuota || pkg.quota}*\n`
                if (pkg.totalQuota) txt += `  > Cuota total: *${pkg.totalQuota}*\n`
                if (pkg.expireDate || pkg.validUntil) txt += `  > Válido hasta: *${pkg.expireDate || pkg.validUntil}*\n`
                if (pkg.type) txt += `  > Tipo: *${pkg.type}*\n`
                txt += `\n`
            }
        }

        if (data.balance || data.pulsa) {
            txt += `💰 *SALDO*\n`
            txt += `> Crédito: *${data.balance || data.pulsa}*\n\n`
        }

        if (data.result && typeof data.result === "object") {
            const r = data.result
            if (r.name) txt += `👤 Nombre del paquete: *${r.name}*\n`
            if (r.quota) txt += `📊 Cuota: *${r.quota}*\n`
            if (r.masa_aktif) txt += `📅 Vigencia: *${r.masa_aktif}*\n`
            if (r.status) txt += `📊 Status: *${r.status}*\n`
        }

        if (typeof data === "object" && !data.packages && !data.result) {
            const skipKeys = ["error", "status", "msisdn", "activeDate", "expireDate", "graceDate", "balance", "pulsa"]
            const extraKeys = Object.keys(data).filter(k => !skipKeys.includes(k))
            if (extraKeys.length > 0) {
                txt += `\n📋 *OTROS DETALLES*\n\n`
                for (const key of extraKeys) {
                    const val = data[key]
                    if (typeof val === "string" || typeof val === "number") {
                        txt += `- ${key}: *${val}*\n`
                    }
                }
            }
        }

        m.react("✅")
        await m.reply(txt.trim())

    } catch (error) {
        m.react("☢")
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
