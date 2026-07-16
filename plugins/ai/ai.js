import gemini from '../../src/scraper/gemini.js';
import { AIRich } from '../../src/lib/ourin-builder.js';
import te from '../../src/lib/ourin-error.js';

const pluginConfig = {
    name: 'ai',
    alias: ['ai4chat', 'gemini'],
    category: 'ai',
    description: 'Chat inteligente con AI (soporta tablas, código, etc vía AIRich)',
    usage: '.ai <pregunta>',
    example: '.ai crea una tabla comparativa de vue y react',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
};

const sessions = {};

const systemPrompt = `Eres un asistente AI inteligente y avanzado (Ourin AI).
Usa formato markdown estrictamente:
1. Si creas una lista de comparación o un conjunto de datos, SIEMPRE usa formato de tabla markdown (comenzando y terminando con '|').
2. Si proporcionas código de programación, SIEMPRE envuélvelo en un bloque de código markdown (\`\`\`lenguaje ... \`\`\`).
3. Usa formato de texto en negrita (*texto*) para enfatizar algo, o hashtag (#) para títulos / explicaciones grandes.
Asegúrate de que todas las respuestas estén bien estructuradas para que el sistema AIRich pueda renderizarlas correctamente.`;

async function handler(m, { sock }) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(
            `🤖 *AI*\n\n` +
            `> ¡Hola! Soy un asistente inteligente\n\n` +
            `*Forma de uso:*\n` +
            `> \`${m.prefix}ai <pregunta>\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`${m.prefix}ai crea una tabla de turnos\``
        );
    }

    await m.react('🕕');

    const userJid = m.sender;
    const sessionId = sessions[userJid] || null;

    try {
        const result = await gemini({
            message: text,
            instruction: systemPrompt,
            sessionId: sessionId
        });

        if (result && result.sessionId) {
            sessions[userJid] = result.sessionId;
        }

        const replyText = result.text || '';

        const aiRich = new AIRich(sock);

        const lines = replyText.split('\n');
        let currentTable = [];
        let currentCode = [];
        let inCode = false;
        let codeLang = '';
        let textBuffer = [];

        const flushText = () => {
            if (textBuffer.length > 0) {
                aiRich.addText(textBuffer.join('\n').trim());
                textBuffer = [];
            }
        };

        const flushTable = () => {
            if (currentTable.length > 0) {
                const tableData = currentTable.map(line => {
                    return line.split('|').map(c => c.trim()).filter((_, i, arr) => i !== 0 && i !== arr.length - 1);
                });
                const filteredTableData = tableData.filter(row => !row.every(c => /^[-:]+$/.test(c)));

                if (filteredTableData.length > 0 && filteredTableData.every(row => row.length > 0)) {
                    aiRich.addTable(filteredTableData);
                } else {
                    aiRich.addText(currentTable.join('\n'));
                }
                currentTable = [];
            }
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.trim().startsWith('```')) {
                if (!inCode) {
                    flushText();
                    flushTable();
                    inCode = true;
                    codeLang = line.trim().substring(3).trim() || 'text';
                } else {
                    inCode = false;
                    aiRich.addCode(codeLang, currentCode.join('\n'));
                    currentCode = [];
                }
                continue;
            }

            if (inCode) {
                currentCode.push(line);
                continue;
            }

            if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
                flushText();
                currentTable.push(line.trim());
                continue;
            }

            flushTable();
            textBuffer.push(line);
        }

        flushText();
        flushTable();

        await aiRich.send(m.chat, { quoted: m });

        await m.react('✅');
    } catch (error) {
        console.error('[AI Error]', error);
        await m.react('☢');
        return m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler };