import config from '../../config.js'
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'
const execAsync = promisify(exec);
const pluginConfig = {
    name: 'system',
    alias: ['ram', 'cpu', 'disk', 'ping'],
    category: 'main',
    description: 'Mostrar información del sistema (RAM, CPU, Disco, Latencia)',
    usage: '.ram | .cpu | .disk | .ping',
    isGroup: false,
    isBotAdmin: false,
    isAdmin: false,
    cooldown: 5,
    carne: 1,
    isEnabled: true
};

function formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

async function getDiskUsage() {
    try {
        if (process.platform === 'win32') {
            const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption');
            const lines = stdout.trim().split('\n').slice(1);
            return lines.map(line => {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 3) {
                    const caption = parts[0];
                    const free = parseInt(parts[1]);
                    const size = parseInt(parts[2]);
                    const used = size - free;
                    return `💿 *Unidad ${caption}*\nTotal: ${formatSize(size)}\nUsado: ${formatSize(used)}\nLibre: ${formatSize(free)}\n`;
                }
                return null;
            }).filter(Boolean).join('\n');
        } else {
            const { stdout } = await execAsync('df -h /');
            const lines = stdout.trim().split('\n');
            const parts = lines[1].replace(/\s+/g, ' ').split(' ');
            return `💿 *Uso de Disco*\nTotal: ${parts[1]}\nUsado: ${parts[2]}\nLibre: ${parts[3]}\nUso%: ${parts[4]}`;
        }
    } catch (e) {
        return '❌ Error al obtener la información del disco';
    }
}

async function handler(m, { sock }) {
    const command = m.command.toLowerCase();

    try {
        switch (command) {
            case 'ram': {
                const totalMem = os.totalmem();
                const freeMem = os.freemem();
                const usedMem = totalMem - freeMem;
                
                const text = `💻 *USO DE RAM*\n\n` +
                             `Total: ${formatSize(totalMem)}\n` +
                             `Usado: ${formatSize(usedMem)}\n` +
                             `Libre: ${formatSize(freeMem)}\n` +
                             `Plataforma: ${os.platform()} (${os.arch()})`;
                m.reply(text);
            }
            break;

            case 'cpu': {
                const cpus = os.cpus();
                const model = cpus[0].model;
                const speed = cpus[0].speed;
                const cores = cpus.length;
                
                const text = `🖥️ *INFO DE CPU*\n\n` +
                             `Modelo: ${model}\n` +
                             `Velocidad: ${speed} MHz\n` +
                             `Núcleos: ${cores} Núcleo(s)\n` +
                             `Uptime: ${formatSize(os.uptime())} (Formato incorrecto, segundos crudos)`; 
                const uptime = os.uptime();
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                const seconds = Math.floor(uptime % 60);
                const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;
                m.reply(`🖥️ *INFO DE CPU*\n\nModelo: ${model}\nVelocidad: ${speed} MHz\nNúcleos: ${cores}\nUptime del Servidor: ${uptimeStr}`);
            }
            break;

            case 'disk': {
                const diskInfo = await getDiskUsage();
                m.reply(diskInfo);
            }
            break;

            case 'latency': {
                const timestamp = m.messageTimestamp ? m.messageTimestamp * 1000 : Date.now();
                const now = Date.now();
                const latency = now - timestamp;
                let speed = '';
                if (latency < 100) speed = '🚀 Rápido';
                else if (latency < 500) speed = '⚡ Bueno';
                else if (latency < 1000) speed = '🐢 Aceptable';
                else speed = '🐌 Lento';
                m.reply(`📶 *Pong!*\nLatencia: ${latency}ms\nRespuesta: ${speed}`);
            }
            break;
        }
    } catch (e) {
        console.error('System Plugin Error:', e);
        m.reply('❌ Ocurrió un error al obtener los datos del sistema.');
    }
}

export { pluginConfig as config, handler }