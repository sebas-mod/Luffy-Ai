import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import config from '../../config.js';
import { getDatabase } from '../../src/lib/ourin-database.js';
import te from '../../src/lib/ourin-error.js';
import { prepareWAMessageMedia, generateWAMessageFromContent, generateWAMessage, jidNormalizedUser } from 'ourin';

const pluginConfig = {
    name: 'srt',
    alias: ['shufflereplythumb', 'shufflereply'],
    category: 'owner',
    description: 'Sistema SRT para respuestas interactivas con imágenes aleatorias',
    usage: '.srt on',
    example: '.srt on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
};

if (!global.srtSession) {
    global.srtSession = {};
}

const SHUFFLE_DIR = path.join(process.cwd(), 'assets', 'image', 'shuffle');

function countShuffleImages() {
    if (!fs.existsSync(SHUFFLE_DIR)) return 0;
    const files = fs.readdirSync(SHUFFLE_DIR);
    return files.filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg')).length;
}

async function handler(m, { sock, args }) {
    try {
        const db = getDatabase();
        const action = args[0]?.toLowerCase();

        if (!action) {
            return m.reply(`🛠️ *SISTEM SHUFFLE REPLY THUMB (SRT)*\n\nBienvenido al menú de gestión de imágenes de respuesta automática. Este sistema permite al bot responder con imágenes *thumbnail* que se seleccionan automáticamente de la colección que has guardado.\n\nLo siguiente es la lista de comandos disponibles:\n- *.srt on* : Activando la función shuffle de forma global.\n- *.srt off* : Desactivando el modo shuffle y volviendo a la configuración inicial.\n- *.srt c* : Abriendo sesión de captura de imagen para agregar nueva colección a la base de datos.\n- *.srt d* : Cerrando sesión de captura de imagen.\n- *.srt list* : Mostrando toda la colección de imágenes guardadas en la base de datos del bot.\n- *.srt del* : Eliminando imagen de database (Usa *.srt list* (Usa *.srt list* primero para mostrar las imágenes, luego responde (*reply*) a una de ellas con este comando).`);
        }

        if (action === 'on') {
            db.setting('srtEnabled', true);
            await m.reply('✅ *FUNCIONALIDAD SRT ACTIVADA*\n\nEl modo esto se ha activado de forma global. Cada respuesta del bot que soporte *thumbnail* ahora mostrará imágenes aleatorias de la carpeta shuffle que has recopilado.');
        } 
        else if (action === 'off') {
            db.setting('srtEnabled', false);
            await m.reply('❌ *FUNCIONALIDAD SRT DESACTIVADA*\n\nEl uso de *thumbnail* aleatorio ha sido desactivado. Todas las respuestas del bot volverán a usar la imagen *predeterminada* del sistema.');
        } 
        else if (action === 'c' || action === 'capture') {
            global.srtSession[m.chat] = { sender: m.sender, count: 0 };
            const totalImages = countShuffleImages();
            await m.reply(`📸 *SESI TANGKAPAN GAMBAR DIMULAI*\n\nPor favor envía las imágenes una por una de forma continua en este chat. El bot irá leyendo cada imagen y la guardará automáticamente en el sistema de *base de datos shuffle*.\n\n- Total de imágenes guardadas actualmente: *${totalImages}*\n- Si ya se terminaron de enviar todas las imágenes, detén la sesión con el comando \`${m.prefix}srt d\`.`);
        } 
        else if (action === 'd' || action === 'done') {
            if (!global.srtSession[m.chat] || global.srtSession[m.chat].sender !== m.sender) {
                return m.reply('❌ No estás dentro de una sesión de captura de imágenes activa actualmente.');
            }
            const count = global.srtSession[m.chat].count;
            delete global.srtSession[m.chat];
            const totalImages = countShuffleImages();
            await m.reply(`✅ *SESI TANGKAPAN GAMBAR SELESAI*\n\nLa sesión ha sido detenida y todas las imágenes han sido procesadas.\n- Total de imágenes nuevas agregadas: *${count}*\n- Total general de imágenes en el sistema: *${totalImages}*`);
        } 
        else if (action === 'list') {
            if (!fs.existsSync(SHUFFLE_DIR)) return m.reply('❌ Aún no hay ninguna imagen guardada en el directorio *shuffle*. Por favor realiza la captura de imágenes primero.');
            const files = fs.readdirSync(SHUFFLE_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
            if (files.length === 0) return m.reply('❌ El directorio *shuffle* está vacío. Por favor usa el comando de captura de imágenes para empezar a agregar.');
            
            await m.reply(`📂 *DAFTAR GAMBAR SHUFFLE*\n\nEl sistema encontró *${files.length}* imágenes guardadas. Está procesando y ensamblando el álbum para mostrarlo, por favor espera un momento.`);
            
            try {
                const opener = generateWAMessageFromContent(
                    m.chat,
                    {
                        messageContextInfo: { messageSecret: crypto.randomBytes(32) },
                        albumMessage: {
                            expectedImageCount: files.length,
                            expectedVideoCount: 0,
                        },
                    },
                    {
                        userJid: jidNormalizedUser(sock.user.id),
                        quoted: m,
                        upload: sock.waUploadToServer,
                    }
                );

                await sock.relayMessage(opener.key.remoteJid, opener.message, {
                    messageId: opener.key.id,
                });

                for (let i = 0; i < files.length; i++) {
                    const imgPath = path.join(SHUFFLE_DIR, files[i]);
                    const imgBuffer = fs.readFileSync(imgPath);

                    const msg = await generateWAMessage(opener.key.remoteJid, { image: imgBuffer }, {
                        upload: sock.waUploadToServer,
                    });

                    msg.message.messageContextInfo = {
                        messageSecret: crypto.randomBytes(32),
                        messageAssociation: {
                            associationType: 1,
                            parentMessageKey: opener.key,
                        },
                    };

                    await sock.relayMessage(msg.key.remoteJid, msg.message, {
                        messageId: msg.key.id,
                    });
                }
            } catch (albumErr) {
                console.error('Album Error:', albumErr);
                return m.reply('❌ Ocurrió un error al crear el álbum de imágenes.');
            }
        } 
        else if (action === 'del' || action === 'delete') {
            const isImage = m.isImage || (m.quoted && m.quoted.isImage);
            if (!isImage) {
                return m.reply('❌ *CARA MENGHAPUS GAMBAR:*\n\n1. Escribe `.srt list` para mostrar toda la colección de imágenes.\n2. Responde (*reply*) a una de las imágenes que aparecen en el álbum con el comando `.srt del`.');
            }
            
            await m.react('🕕');
            let buffer;
            try {
                if (m.quoted && m.quoted.isImage) {
                    buffer = await m.quoted.download();
                } else if (m.isImage) {
                    buffer = await m.download();
                }
            } catch (e) {
                return m.reply('❌ Error al descargar la imagen para eliminarla.');
            }

            if (buffer) {
                const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 10);
                const filename = `srt_${hash}.jpg`;
                const filepath = path.join(SHUFFLE_DIR, filename);

                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                    await m.reply(`✅ *GAMBAR BERHASIL DIHAPUS*\n\nImagen eliminada con éxito de la base de datos shuffle.`);
                } else {
                    await m.reply('❌ *GAMBAR TIDAK DITEMUKAN*\n\nEsta imagen no coincide con las que hay en la base de datos shuffle (o ya fue eliminada anteriormente).');
                }
            }
            await m.react('✅');
        }
        else {
            await m.reply(`❌ Comando lanjutan "${action}" no puede ser procesado por el sistema.`);
        }
        
    } catch (error) {
        console.error('SRT List Error:', error);
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

async function srtAnswerHandler(m, sock) {
    if (!global.srtSession) return false;
    const session = global.srtSession[m.chat];
    if (!session || session.sender !== m.sender) return false;

    if (m.isCommand) return false;

    const isImage = m.isImage || (m.quoted && m.quoted.isImage);
    if (!isImage) return false;

    try {
        await m.react('🕕');
        let buffer;
        if (m.quoted && m.quoted.isImage) {
            buffer = await m.quoted.download();
        } else if (m.isImage) {
            buffer = await m.download();
        }

        if (buffer) {
            if (!fs.existsSync(SHUFFLE_DIR)) fs.mkdirSync(SHUFFLE_DIR, { recursive: true });
            
            const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 10);
            const ext = '.jpg';
            const filename = `srt_${hash}${ext}`;
            const filepath = path.join(SHUFFLE_DIR, filename);

            if (fs.existsSync(filepath)) {
                await m.reply('⚠️ Se detectó que una imagen igual ya está guardada en la base de datos.');
            } else {
                fs.writeFileSync(filepath, buffer);
                session.count++;
                await m.reply(`✅ *GAMBAR BERHASIL DISIMPAN*\n\nLa imagen ha sido guardada en el almacenamiento local del bot.\n- Total de imágenes agregadas en esta sesión: *${session.count}*`);
            }
        }
        await m.react('✅');
        return true;
    } catch (e) {
        await m.react('❌');
        await m.reply('❌ Ocurrió un error fatal al intentar descargar y guardar la imagen.');
        return true;
    }
}

export { pluginConfig as config, handler, srtAnswerHandler };
