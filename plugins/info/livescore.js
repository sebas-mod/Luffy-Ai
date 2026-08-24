import axios from 'axios';

const pluginConfig = {
    name: 'livescore',
    alias: ['marcador', 'marcadores'],
    category: 'info',
    description: 'Muestra el marcador en vivo de partidos de fútbol de Goal.com',
    usage: '.livescore',
    example: '.livescore',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 2,
    isEnabled: true
};

const _header = {
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
};

async function obtenerMarcador(edisi = 'id') {
  try {
    const url = edisi === 'id' ? 'https://www.goal.com/id/livescore' : `https://www.goal.com/${edisi}/live-scores`;
    const res = await axios.get(url, { headers: _header, timeout: 15000 });
    const coincidencia = res.data.match(/__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
    if (!coincidencia) throw new Error('No se pudo encontrar el marcador');
    const json = JSON.parse(coincidencia[1]);
    const liveScores = json?.props?.pageProps?.content?.liveScores;
    if (!liveScores) throw new Error('Datos de liveScores vacíos');
    return liveScores;
  } catch (error) {
    throw new Error(error.message);
  }
}

function _estadoIndo(status) {
  const map = {
    FIXTURE: 'Sin empezar',
    LIVE: 'En curso',
    FINISHED: 'Finalizado',
    POSTPONED: 'Aplazado',
    CANCELLED: 'Cancelado',
    HALF_TIME: 'Descanso'
  };
  return map[status] || status;
}

function _formatearPartidos(datosCrudos) {
  return datosCrudos.map(grupo => ({
    competicion: grupo.competition?.name || '-',
    partidos: (grupo.matches || []).map(m => ({
      status: _estadoIndo(m.status),
      hora: m.startDate,
      local: m.teamA?.name,
      visitante: m.teamB?.name,
      marcadorLocal: (typeof m.score?.teamA === 'object' && m.score?.teamA !== null) ? (m.score.teamA.current ?? m.score.teamA.normalTime ?? m.score.teamA.score ?? '-') : (m.score?.teamA ?? '-'),
      marcadorVisitante: (typeof m.score?.teamB === 'object' && m.score?.teamB !== null) ? (m.score.teamB.current ?? m.score.teamB.normalTime ?? m.score.teamB.score ?? '-') : (m.score?.teamB ?? '-'),
      tarjetaRojaLocal: m.redCards?.teamA ?? 0,
      tarjetaRojaVisitante: m.redCards?.teamB ?? 0,
      periode: (typeof m.period === 'object' && m.period !== null) ? (m.period.name ?? m.period.short ?? m.period.long ?? '-') : (m.period || '')
    }))
  }));
}

async function handler(m, { text }) {
    try {
        await m.react('🕕');
        const data = await obtenerMarcador('id');
        const formateado = _formatearPartidos(data);
        
        if (!formateado || formateado.length === 0) {
            await m.react('❌');
            return m.reply(`╭━━━〔 ⚽ LIVESCORE 〕━━━╮\n\n⚽ No hay partidos en curso ni programados.\n\n╰━━━━━━━━━━━━╯`);
        }
        
        let caption = `╭━━━〔 ⚽ LIVESCORE 〕━━━╮\n\n⚽ *MARCADOR EN VIVO DE HOY* ⚽\n\n`;
        
        let count = 0;
        for (const grupo of formateado) {
            if (count >= 15) break; 
            if (grupo.partidos.length === 0) continue;
            
            caption += `🏆 *${grupo.competicion.toUpperCase()}*\n`;
            
            for (const p of grupo.partidos) {
                const marcadorA = p.marcadorLocal;
                const marcadorB = p.marcadorVisitante;
                
                let kmA = p.tarjetaRojaLocal > 0 ? ` 🟥${p.tarjetaRojaLocal}` : '';
                let kmB = p.tarjetaRojaVisitante > 0 ? ` 🟥${p.tarjetaRojaVisitante}` : '';
                
                caption += `▪️ ${p.local}${kmA} *[ ${marcadorA} - ${marcadorB} ]* ${p.visitante}${kmB}\n`;
                caption += `   └ ⏳ _Estado: ${p.status}_`;
                if (p.periode) caption += ` | ⏱️ _${p.periode}_`;
                caption += `\n`;
            }
            caption += `\n`;
            count++;
        }
        
        caption += `✦────────✦\n⚽ _Fuente: Goal.com_`;
        
        await m.reply(caption.trim());
        await m.react('✅');
    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply(`❌ *ERROR AL OBTENER EL MARCADOR*\n\nLo siento, el sistema no pudo obtener el marcador en vivo. Error: _${e.message}_`);
    }
}

export { pluginConfig as config, handler };
