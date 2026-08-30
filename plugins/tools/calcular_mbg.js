const pluginConfig = {
  name: "calcular_mbg",
  alias: ["kkmbg"],
  category: "tools",
  description: "Calcula la duración y la comparación de fondos de Comida Nutritiva Gratuita (MBG)",
  usage: ".calcular_mbg <cantidad_dinero>",
  example: ".calcular_mbg 1000000000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 1,
  isEnabled: true,
};

function calcularMBG(dinero) {
  const gastoDiario = 319600000000;
  const precioPorcion = 15000;

  const diasFloat = dinero / gastoDiario;

  const anios = Math.floor(diasFloat / 365);
  const meses = Math.floor((diasFloat % 365) / 30);
  const dias = Math.floor(diasFloat % 30);

  const horas = Math.floor((diasFloat % 1) * 24);
  const minutos = Math.floor(((diasFloat * 24) % 1) * 60);
  const segundos = (((diasFloat * 24 * 60) % 1) * 60);

  const porciones = Math.floor(dinero / precioPorcion);

  const umrDKI = 5400000;
  const umrJateng = 2040000;
  const salarioGuruHonorario = 300000;

  const porcentajeDKI = ((dinero / umrDKI) * 100).toFixed(1);
  const porcentajeJateng = ((dinero / umrJateng) * 100).toFixed(1);
  const vecesGuru = (dinero / salarioGuruHonorario).toFixed(1);

  const jugadores = [
    { nombre: "Cristiano Ronaldo (Al Nassr)", salario: 4500000000000 },
    { nombre: "Lionel Messi (Inter Miami)", salario: 2100000000000 },
    { nombre: "Karim Benzema (Al-Ittihad)", salario: 1700000000000 },
    { nombre: "Kylian Mbappé (Real Madrid)", salario: 1500000000000 },
    { nombre: "Erling Haaland (Man City)", salario: 1300000000000 },
    { nombre: "Vinícius Jr. (Real Madrid)", salario: 960000000000 },
    { nombre: "Mohamed Salah (Liverpool)", salario: 880000000000 },
    { nombre: "Sadio Mané (Al Nassr)", salario: 864000000000 },
    { nombre: "Jude Bellingham (Real Madrid)", salario: 704000000000 },
    { nombre: "Lamine Yamal (Barcelona)", salario: 688000000000 }
  ];

  const comparacionJugadores = jugadores.map(p => {
    const porcentaje = ((dinero / p.salario) * 100);
    return {
      nombre: p.nombre,
      salario: p.salario,
      porcentaje: porcentaje < 0.0001 ? "0%" : porcentaje.toFixed(4) + "%"
    };
  });

  return {
    duracion: {
      anios,
      meses,
      dias,
      horas,
      minutos,
      segundos: segundos.toFixed(2)
    },
    gasto: gastoDiario,
    porciones,
    salariosIndonesia: {
      dki: porcentajeDKI + "%",
      jateng: porcentajeJateng + "%",
      guru: vecesGuru + "x"
    },
    jugadores: comparacionJugadores
  };
}

function formatoRupias(numero) {
  const formatted = numero.toLocaleString('id-ID');
  return numero < 1000 ? `${formatted} Perak` : `Rp ${formatted}`;
}

async function handler(m, { args }) {
  if (!args[0]) {
    let txt = `☽◯☾ ╭━ ♰ 🧮 CALCULADORA MBG ♰ ━╮ ☽◯☾\n\n`;
    txt += `☽◯☾ ♰ ¡Hola! ¿Tienes curiosidad por saber cuánto tiempo puede financiar tu dinero el programa Makan Bergizi Gratis de Indonesia?\n\n`;
    txt += `✦ *Cómo Usar:*\n`;
    txt += `☽◯☾ ♰ 👉 \`${m.prefix}calcular_mbg <cantidad de dinero>\`\n\n`;
    txt += `✦ *Ejemplo:*\n`;
    txt += `☽◯☾ ♰ \`${m.prefix}calcular_mbg 1000000000\`\n`;
    txt += `╰━ ⊱༺༒༻⊰ ━╯`;
    return m.reply(txt);
  }

  await m.react("🧮");

  try {
    const dinero = Number(args[0].replace(/[^0-9]/g, ''));
    if (isNaN(dinero) || dinero <= 0) {
      return m.reply(`❌ ¡Por favor, ingresa una cantidad de dinero válida!\n──────────\n☽◯☾ ♰ (Solo números, por ejemplo 500000)`);
    }

    const data = calcularMBG(dinero);

    let contentTxt = `💰 *Dinero :* ${formatoRupias(dinero)}\n\n`;
    contentTxt += `⏳ *Duración MBG:*\n`;
    contentTxt += `☽◯☾ ♰ ${data.duracion.anios} AÑOS, ${data.duracion.meses} MESES, ${data.duracion.dias} DÍAS\n`;
    contentTxt += `☽◯☾ ♰ ${data.duracion.horas} HORAS, ${data.duracion.minutos} MINUTOS, ${data.duracion.segundos} SEGUNDOS\n`;
    contentTxt += `_(Según un gasto de ~Rp ${(data.gasto / 1000000000).toFixed(1)} mil millones/día)_\n\n`;
    contentTxt += `──────────\n\n`;

    contentTxt += `🍱 *Equivalente en Porciones de Comida:*\n`;
    contentTxt += `☽◯☾ ♰ ${data.porciones.toLocaleString('id-ID')} porciones (@ Rp 15.000/porción)\n\n`;

    contentTxt += `──────────\n\n`;
    contentTxt += `📊 *Comparación de Salarios en Indonesia:*\n`;
    contentTxt += `☽◯☾ ♰ 🏢 UMR DKI Jakarta (Rp 5,4 Millones/mes): ${data.salariosIndonesia.dki}\n`;
    contentTxt += `☽◯☾ ♰ 🏭 UMR Java Central (Rp 2,04 Millones/mes): ${data.salariosIndonesia.jateng}\n`;
    contentTxt += `☽◯☾ ♰ 👨‍🏫 Salario Maestro Honorario (Rp 300mil/mes): ${data.salariosIndonesia.guru}\n\n`;

    contentTxt += `──────────\n\n`;
    contentTxt += `⚽ *Comparación de Salarios de Futbolistas:*\n`;
    for (let p of data.jugadores) {
      contentTxt += `☽◯☾ ♰ 🏆 ${p.nombre}\n`;
      contentTxt += `☽◯☾ ♰ 💵 ${formatoRupias(p.salario)}/año\n`;
      contentTxt += `☽◯☾ ♰ 📈 Porcentaje: ${p.porcentaje}\n\n`;
    }

    let txt = `☽◯☾ ╭━ ♰ 🍽️ RESULTADO DEL CÁLCULO MBG ♰ ━╮ ☽◯☾\n\n`;
    txt += contentTxt.trim().split("\n").map(line => line.trim() ? `${line}` : ``).join("\n");
    txt += `\n╰━ ⊱༺༒༻⊰ ━╯`;

    await m.reply(txt);
    await m.react("✅");
  } catch (e) {
    m.reply(`☽◯☾ ♰ ❌ Lo siento, ocurrió un error al calcular! 😭\n──────────\nError: ${e.message}`);
  }
}

export { pluginConfig as config, handler };
