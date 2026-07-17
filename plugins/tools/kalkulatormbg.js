const pluginConfig = {
  name: "kalkulatormbg",
  alias: ["kkmbg"],
  category: "tools",
  description: "Calcular duración y comparación de fondos de Comida Nutritiva Gratis (MBG)",
  usage: ".kkmbg <cantidad_dinero>",
  example: ".kkmbg 1000000000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

function hitungMBG(uang) {
  const pengeluaranPerHari = 319600000000;
  const hargaPorsi = 15000;

  const hariFloat = uang / pengeluaranPerHari;

  const tahun = Math.floor(hariFloat / 365);
  const bulan = Math.floor((hariFloat % 365) / 30);
  const hari = Math.floor(hariFloat % 30);

  const jam = Math.floor((hariFloat % 1) * 24);
  const menit = Math.floor(((hariFloat * 24) % 1) * 60);
  const detik = (((hariFloat * 24 * 60) % 1) * 60);

  const porsi = Math.floor(uang / hargaPorsi);

  const umrDKI = 5400000;
  const umrJateng = 2040000;
  const guruHonorer = 300000;

  const persenDKI = ((uang / umrDKI) * 100).toFixed(1);
  const persenJateng = ((uang / umrJateng) * 100).toFixed(1);
  const kaliGuru = (uang / guruHonorer).toFixed(1);

  const pemain = [
    { nama: "Cristiano Ronaldo (Al Nassr)", gaji: 4500000000000 },
    { nama: "Lionel Messi (Inter Miami)", gaji: 2100000000000 },
    { nama: "Karim Benzema (Al-Ittihad)", gaji: 1700000000000 },
    { nama: "Kylian Mbappé (Real Madrid)", gaji: 1500000000000 },
    { nama: "Erling Haaland (Man City)", gaji: 1300000000000 },
    { nama: "Vinícius Jr. (Real Madrid)", gaji: 960000000000 },
    { nama: "Mohamed Salah (Liverpool)", gaji: 880000000000 },
    { nama: "Sadio Mané (Al Nassr)", gaji: 864000000000 },
    { nama: "Jude Bellingham (Real Madrid)", gaji: 704000000000 },
    { nama: "Lamine Yamal (Barcelona)", gaji: 688000000000 }
  ];

  const perbandinganPemain = pemain.map(p => {
    const persen = ((uang / p.gaji) * 100);
    return {
      nama: p.nama,
      gaji: p.gaji,
      persen: persen < 0.0001 ? "0%" : persen.toFixed(4) + "%"
    };
  });

  return {
    durasi: {
      tahun,
      bulan,
      hari,
      jam,
      menit,
      detik: detik.toFixed(2)
    },
    pengeluaran: pengeluaranPerHari,
    porsi,
    gajiIndonesia: {
      dki: persenDKI + "%",
      jateng: persenJateng + "%",
      guru: kaliGuru + "x"
    },
    pemain: perbandinganPemain
  };
}

function formatRupiah(angka) {
  const formatted = angka.toLocaleString('es-ES');
  return angka < 1000 ? `${formatted} centavos` : `Belly ${formatted}`;
}

async function handler(m, { args }) {
  if (!args[0]) {
    let txt = `🧮 *CALCULADORA MBG (Comida Nutritiva Gratis)* 🧮\n\n`;
    txt += `¡Hola! ¿Cuánto tiempo puede abastecer tu dinero al programa de Comida Nutritiva Gratis a nivel nacional?\n\n`;
    txt += `*Cómo Usar:*\n`;
    txt += `👉 \`${m.prefix}kkmbg <cantidad de dinero>\`\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `\`${m.prefix}kkmbg 1000000000\``;
    return m.reply(txt);
  }

  await m.react("🧮");

  try {
    const uang = Number(args[0].replace(/[^0-9]/g, ''));
    if (isNaN(uang) || uang <= 0) {
      return m.reply("❌ ¡Por favor ingresa una cantidad de dinero válida! (Solo números, por ejemplo 500000)");
    }

    const data = hitungMBG(uang);

    let contentTxt = `💰 *Fondos :* ${formatRupiah(uang)}\n\n`;
    contentTxt += `⏳ *Durasi MBG:*\n`;
    contentTxt += `${data.durasi.tahun} AÑOS, ${data.durasi.bulan} MESES, ${data.durasi.hari} DÍAS\n`;
    contentTxt += `${data.durasi.jam} HORAS, ${data.durasi.menit} MINUTOS, ${data.durasi.detik} SEGUNDOS\n`;
    contentTxt += `_(Basado en gasto ~Belly ${(data.pengeluaran / 1000000000).toFixed(1)} Mil millones/día)_\n\n`;
    
    contentTxt += `🍱 *Porciones Equivalentes:*\n`;
    contentTxt += `${data.porsi.toLocaleString('es-ES')} porciones (@ Belly 15.000/porción)\n\n`;

    contentTxt += `📊 *Comparación de Salario Indonesia:*\n`;
    contentTxt += `🏢 UMR DKI Jakarta (Belly 5,4 Jt/mes): ${data.gajiIndonesia.dki}\n`;
    contentTxt += `🏭 UMR Jawa Tengah (Belly 2,04 Jt/mes): ${data.gajiIndonesia.jateng}\n`;
    contentTxt += `👨‍🏫 Salario Profesor Honorario (Belly 300rb/mes): ${data.gajiIndonesia.guru}\n\n`;

    contentTxt += `⚽ *Comparación de Salario de Futbolistas:*\n`;
    for (let p of data.pemain) {
      contentTxt += `🏆 ${p.nama}\n`;
      contentTxt += `💵 ${formatRupiah(p.gaji)}/año\n`;
      contentTxt += `📈 Porcentaje: ${p.persen}\n\n`;
    }

    let txt = `🍽️ *RESULTADO CALCULADORA MBG* 🍽️\n\n`;
    txt += contentTxt.trim().split("\n").map(line => line.trim() ? `${line}` : ``).join("\n");

    await m.reply(txt);
    await m.react("✅");
  } catch (e) {
    m.reply(`❌ Lo siento, ocurrió un error al calcular! 😭\nError: ${e.message}`);
  }
}

export { pluginConfig as config, handler };
