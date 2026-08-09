import axios from 'axios'
import config from '../../config.js'
import AdmZip from 'adm-zip'

const pluginConfig = {
    name: 'deploy',
    alias: ['vercel'],
    category: 'owner',
    description: 'Despliega HTML o un archivo ZIP en Vercel',
    usage: '.deploy <nombre_del_sitio>',
    example: '.deploy mysite',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const name = m.args[0]

    if (!name || !m.quoted) {
        return m.reply(
            `ℹ️ *INFORMACIÓN DE USO*\n\n` +
            `Esta función se usa para hacer un *deploy* (alojar) código HTML o un proyecto completo (ZIP) directamente en Vercel.\n\n` +
            `*EJEMPLO DE USO:*\n` +
            `• Responde un texto/código HTML con el comando: \`${m.prefix}deploy nombresitio\`\n` +
            `• Responde un archivo \`.html\` o \`.zip\` con el comando: \`${m.prefix}deploy nombresitio\``
        )
    }

    const token = config.vercel?.token
    if (!token) {
        return m.reply(`❌ *TOKEN NO CONFIGURADO*\n\nEl Token de Vercel no está configurado en la configuración del sistema. Configura \`config.vercel.token\` primero.`)
    }

    m.react('🕕')

    let filesPayload = []
    let isZip = false

    try {
        if (m.quoted.mimetype === 'application/zip' || (m.quoted.filename && m.quoted.filename.endsWith('.zip'))) {
            isZip = true
            const buffer = await m.quoted.download()
            const zip = new AdmZip(buffer)
            const zipEntries = zip.getEntries()

            for (const entry of zipEntries) {
                if (entry.isDirectory) continue
                if (entry.entryName.includes('__MACOSX')) continue

                filesPayload.push({
                    file: entry.entryName,
                    data: entry.getData().toString('base64'),
                    encoding: 'base64'
                })
            }

            if (filesPayload.length === 0) {
                m.react('❌')
                return m.reply(`❌ *ARCHIVO ZIP VACÍO*\n\nEl archivo ZIP que subiste no contiene ningún archivo. Asegúrate de que el ZIP contenga un proyecto HTML/Web estático.`)
            }
        } else if (
            m.quoted.mimetype === 'text/html' ||
            (m.quoted.filename && (m.quoted.filename.endsWith('.html') || m.quoted.filename.endsWith('.htm')))
        ) {
            const buffer = await m.quoted.download()
            filesPayload.push({
                file: 'index.html',
                data: buffer.toString('utf-8')
            })
        } else if (m.quoted.text || m.quoted.body) {
            let htmlContent = m.quoted.text || m.quoted.body
            if (!/<html|<!doctype html|<head|<body/i.test(htmlContent)) {
                htmlContent = `<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>${name}</title>\n</head>\n<body>\n${htmlContent}\n</body>\n</html>`
            }

            filesPayload.push({
                file: 'index.html',
                data: htmlContent
            })
        } else {
            m.react('❌')
            return m.reply(
                `❌ *FORMATO NO SOPORTADO*\n\n` +
                `El sistema solo admite el despliegue desde los siguientes formatos:\n` +
                `• Texto de código HTML\n` +
                `• Documento \`.html\`\n` +
                `• Archivo comprimido \`.zip\``
            )
        }

        const payload = {
            name,
            project: name,
            target: 'production',
            files: filesPayload,
            projectSettings: {
                framework: null
            }
        }

        await axios.post(
            'https://api.vercel.com/v13/deployments',
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        )

        let domain = `${name}.vercel.app`

        try {
            const domainsRes = await axios.get(
                `https://api.vercel.com/v9/projects/${name}/domains`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 30000
                }
            )

            const domains = domainsRes.data.domains || []

            domain =
                domains.find(d => !d.name.endsWith('.vercel.app'))?.name ||
                domains.find(d => d.name.endsWith('.vercel.app'))?.name ||
                domain
        } catch {
            // se usa el dominio por defecto si falla al obtener los dominios
        }

        m.react('✅')

        await m.reply(
            `✅ *DEPLOY EXITOSO*\n\n` +
            `Tu proyecto se subió correctamente a Vercel y se está desplegando (building). Puedes acceder a él de inmediato a través del siguiente enlace.\n\n` +
            `*DETALLES DEL DEPLOY:*\n` +
            `• Nombre del Proyecto: *${name}*\n` +
            `• Tipo de Proyecto: *${isZip ? 'Archivo ZIP (Múltiples archivos)' : 'HTML estático (Archivo único)'}*\n` +
            `• Enlace: https://${domain}`
        )

    } catch (error) {
        m.react('❌')

        const err =
            error.response?.data?.error?.message ||
            error.response?.data?.message ||
            error.message

        m.reply(`❌ *DEPLOY FALLIDO*\n\nSe produjo un error al intentar subir el proyecto a Vercel.\n\n*Causa del error:*\n> ${err}`)
    }
}

export { pluginConfig as config, handler }