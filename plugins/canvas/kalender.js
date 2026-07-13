import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import fs from "fs";
import path from "path";
import https from "https";

const pluginConfig = {
    name: 'kalender',
    alias: ['calendar', 'tanggalan'],
    category: 'canvas',
    description: 'Muestra el calendario completo de 2026 o de un mes.',
    usage: '.kalender [mes/año]',
    example: '.kalender enero',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true
};

const TAHUN = 2026;

const NAMA_BULAN = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const NAMA_HARI = ["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"];

const LIBUR = {
  "1-1":  { nama: "Año Nuevo", tipe: "nasional" },
  "1-16": { nama: "Isra y Mi'raj del profeta Mahoma", tipe: "keagamaan" },
  "2-16": { nama: "Día puente por el Año Nuevo chino", tipe: "cuti" },
  "2-17": { nama: "Año Nuevo chino 2577 Kongzili", tipe: "budaya" },
  "3-18": { nama: "Día puente por Nyepi", tipe: "cuti" },
  "3-19": { nama: "Nyepi (Año Nuevo saka 1948)", tipe: "keagamaan" },
  "3-20": { nama: "Día puente por Eid al-Fitr", tipe: "cuti" },
  "3-21": { nama: "Eid al-Fitr 1447 H", tipe: "keagamaan" },
  "3-22": { nama: "Eid al-Fitr 1447 H", tipe: "keagamaan" },
  "3-23": { nama: "Día puente por Eid al-Fitr", tipe: "cuti" },
  "3-24": { nama: "Día puente por Eid al-Fitr", tipe: "cuti" },
  "4-3":  { nama: "Muerte de Jesucristo (Viernes Santo)", tipe: "keagamaan" },
  "4-5":  { nama: "Resurrección de Jesucristo (Pascua)", tipe: "keagamaan" },
  "5-1":  { nama: "Día Internacional de los Trabajadores", tipe: "nasional" },
  "5-14": { nama: "Ascensión de Jesucristo", tipe: "keagamaan" },
  "5-15": { nama: "Día puente por la Ascensión", tipe: "cuti" },
  "5-27": { nama: "Eid al-Adha 1447 H", tipe: "keagamaan" },
  "5-28": { nama: "Día puente por Eid al-Adha", tipe: "cuti" },
  "5-31": { nama: "Vesak 2570 BE", tipe: "keagamaan" },
  "6-1":  { nama: "Día del nacimiento de Pancasila", tipe: "nasional" },
  "6-16": { nama: "Año Nuevo islámico 1448 H", tipe: "keagamaan" },
  "8-17": { nama: "Día de la Independencia de Indonesia", tipe: "nasional" },
  "8-25": { nama: "Nacimiento del profeta Mahoma", tipe: "keagamaan" },
  "12-24": { nama: "Día puente por Navidad", tipe: "cuti" },
  "12-25": { nama: "Navidad", tipe: "keagamaan" },
};

const WARNA = {
  merah: "#A6192E",
  merahTua: "#7A0F20",
  krem: "#FBF6EC",
  kremKartu: "#FFFDF9",
  tinta: "#221A17",
  emas: "#B7862C",
  emasLembut: "#EFDFB8",
  batik: "#C89B4A",
  garis: "#E7DCC6",
  abu: "#8A8078",
  minggu: "#B5473E",
  tipe: {
    nasional: "#A6192E",
    keagamaan: "#B7862C",
    budaya: "#5B7A6B",
    cuti: "#2E6E7E",
  },
  tipeTeks: {
    nasional: "#FFFFFF",
    keagamaan: "#3A2A05",
    budaya: "#FFFFFF",
    cuti: "#FFFFFF",
  },
};

function jumlahHariDiBulan(bulanNum) {
  return new Date(TAHUN, bulanNum, 0).getDate();
}

function offsetHariPertama(bulanNum) {
  const pertama = new Date(TAHUN, bulanNum - 1, 1);
  return (pertama.getDay() + 6) % 7;
}

function liburDiBulan(bulanNum) {
  return Object.keys(LIBUR)
    .filter((k) => parseInt(k.split("-")[0], 10) === bulanNum)
    .map((k) => ({ tgl: parseInt(k.split("-")[1], 10), ...LIBUR[k] }))
    .sort((a, b) => a.tgl - b.tgl);
}

function unduhFile(url, tujuan) {
  const opsi = {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "*/*",
    },
  };
  return new Promise((resolve, reject) => {
    https.get(url, opsi, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return unduhFile(res.headers.location, tujuan).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`Gagal unduh ${url}: ${res.statusCode}`));
      const file = fs.createWriteStream(tujuan);
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", reject);
  });
}

async function pastikanFontTersedia() {
  const dir = path.join(process.cwd(), "assets", "fonts", "kalender");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const daftarFont = [
    { file: "Inter-Regular.woff2", url: "https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-Regular.woff2" },
    { file: "Inter-Medium.woff2", url: "https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-Medium.woff2" },
    { file: "Inter-SemiBold.woff2", url: "https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-SemiBold.woff2" },
    { file: "Inter-Bold.woff2", url: "https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-Bold.woff2" },
    { file: "Inter-ExtraBold.woff2", url: "https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-ExtraBold.woff2" },
    { file: "Manrope-Bold.ttf", url: "https://cdn.jsdelivr.net/npm/@expo-google-fonts/manrope@0.4.0/700Bold/Manrope_700Bold.ttf" },
    { file: "Manrope-ExtraBold.ttf", url: "https://cdn.jsdelivr.net/npm/@expo-google-fonts/manrope@0.4.0/800ExtraBold/Manrope_800ExtraBold.ttf" },
  ];

  for (const f of daftarFont) {
    const tujuan = path.join(dir, f.file);
    if (fs.existsSync(tujuan)) continue;
    try {
      await unduhFile(f.url, tujuan);
    } catch (e) {
      console.warn(`Tidak bisa mengunduh font ${f.file} (${e.message}), memakai font default sistem.`);
    }
  }
}

function daftarkanFont() {
  const dir = path.join(process.cwd(), "assets", "fonts", "kalender");
  if (!fs.existsSync(dir)) return;

  const petaFamily = {
    "Inter-Regular.woff2": "Inter",
    "Inter-Medium.woff2": "Inter Medium",
    "Inter-SemiBold.woff2": "Inter SemiBold",
    "Inter-Bold.woff2": "Inter Bold",
    "Inter-ExtraBold.woff2": "Inter ExtraBold",
    "Manrope-Bold.ttf": "Manrope Bold",
    "Manrope-ExtraBold.ttf": "Manrope ExtraBold",
  };

  fs.readdirSync(dir).forEach((f) => {
    if (!f.endsWith(".ttf") && !f.endsWith(".otf") && !f.endsWith(".woff2")) return;
    const tujuan = path.join(dir, f);
    if (petaFamily[f]) {
      GlobalFonts.registerFromPath(tujuan, petaFamily[f]);
    } else {
      GlobalFonts.registerFromPath(tujuan);
    }
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function gambarMotifBatik(ctx, x, y, w, h, opacity) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = WARNA.batik;
  ctx.lineWidth = 2;
  const langkah = 34;
  for (let d = -h; d < w + h; d += langkah) {
    ctx.beginPath();
    ctx.moveTo(x + d, y);
    ctx.lineTo(x + d + h, y + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + d, y + h);
    ctx.lineTo(x + d + h, y);
    ctx.stroke();
  }
  ctx.fillStyle = WARNA.batik;
  for (let yy = y + 17; yy < y + h; yy += 34) {
    for (let xx = x + 17; xx < x + w; xx += 34) {
      ctx.beginPath();
      ctx.arc(xx, yy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function gambarHeader(ctx, x, y, w, opts) {
  const tinggi = opts.tinggi;
  const grad = ctx.createLinearGradient(0, y, 0, y + tinggi);
  grad.addColorStop(0, WARNA.merahTua);
  grad.addColorStop(0.7, WARNA.merah);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, tinggi);

  gambarMotifBatik(ctx, x, y, w, tinggi, 0.16);

  const tengah = x + w / 2;

  ctx.save();
  const eyebrow = "TAHUN 1948 SAKA  \u00b7  1447\u20131448 HIJRIAH";
  ctx.fillStyle = "#EFDFB8";
  ctx.textAlign = "left";
  ctx.font = "13px 'Inter Bold', sans-serif";
  const spasiEyebrow = eyebrow.split("").join(" ");
  const lebarEyebrow = ctx.measureText(spasiEyebrow).width;
  ctx.fillText(spasiEyebrow, tengah - lebarEyebrow / 2, y + 56);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = "#FBF6EC";
  ctx.font = "64px 'Manrope ExtraBold', sans-serif";
  ctx.fillText(opts.judul, tengah, y + 128);

  if (opts.subjudulBaris && opts.subjudulBaris.length) {
    ctx.fillStyle = "#F3D9D4";
    ctx.font = "17px 'Inter Bold', sans-serif";
    let sy = y + 168;
    opts.subjudulBaris.forEach((baris) => {
      ctx.fillText(baris, tengah, sy);
      sy += 26;
    });
  }

  if (opts.statistik) {
    const gapAntarStat = 130;
    const totalLebar = (opts.statistik.length - 1) * gapAntarStat;
    let sx = tengah - totalLebar / 2;
    opts.statistik.forEach((s) => {
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "32px 'Manrope ExtraBold', sans-serif";
      ctx.fillText(s.angka, sx, y + tinggi - 62);
      ctx.fillStyle = "#F3D9D4";
      ctx.font = "11px 'Inter Bold', sans-serif";
      ctx.fillText(s.label.toUpperCase(), sx, y + tinggi - 40);
      sx += gapAntarStat;
    });
  }
}

function gambarLegenda(ctx, x, y, w, h) {
  roundRect(ctx, x, y, w, h, 16);
  ctx.fillStyle = WARNA.kremKartu;
  ctx.fill();
  ctx.strokeStyle = WARNA.garis;
  ctx.lineWidth = 1;
  ctx.stroke();

  const item = [
    { label: "Festivo nacional", warna: WARNA.tipe.nasional },
    { label: "Festividad religiosa", warna: WARNA.tipe.keagamaan },
    { label: "Festividad cultural", warna: WARNA.tipe.budaya },
    { label: "Día puente", warna: WARNA.tipe.cuti },
  ];

  ctx.font = "15px 'Inter SemiBold', sans-serif";
  ctx.textBaseline = "middle";
  const lebarTiap = item.map((it) => 14 + 10 + ctx.measureText(it.label).width);
  const gap = 40;
  const totalLebar = lebarTiap.reduce((a, b) => a + b, 0) + gap * (item.length - 1);
  let cx = x + (w - totalLebar) / 2;
  const cy = y + h / 2;

  item.forEach((it, i) => {
    ctx.beginPath();
    ctx.arc(cx + 7, cy, 7, 0, Math.PI * 2);
    ctx.fillStyle = it.warna;
    ctx.fill();
    ctx.fillStyle = WARNA.tinta;
    ctx.textAlign = "left";
    ctx.fillText(it.label, cx + 24, cy + 1);
    cx += lebarTiap[i] + gap;
  });
  ctx.textBaseline = "alphabetic";
}

function hitungTinggiKartuBulan(bulanNum, w, skala) {
  const s = skala || 1;
  const tinggiHead = 58 * s;
  const headerHariY = tinggiHead + 20 * s;
  const offset = offsetHariPertama(bulanNum);
  const totalHari = jumlahHariDiBulan(bulanNum);
  const baris = Math.ceil((offset + totalHari) / 7);
  const tinggiSel = 34 * s;
  const grafikMulaiY = headerHariY + 16 * s;
  const yTabelSelesai = grafikMulaiY + tinggiSel * baris + 8 * s;

  const libur = liburDiBulan(bulanNum);
  const tinggiBarisDaftar = 19 * s;
  const tinggiDaftar = libur.length === 0 ? 12 * s : libur.length * tinggiBarisDaftar;

  const yDaftarMulai = yTabelSelesai + 22 * s;
  const yAkhir = yDaftarMulai + tinggiDaftar;

  return yAkhir + 16 * s;
}

function gambarKartuBulan(ctx, x, y, w, tinggiKartu, bulanNum, namaBulan, skala) {
  const s = skala || 1;
  const h = tinggiKartu;

  roundRect(ctx, x, y, w, h, 18 * s);
  ctx.fillStyle = WARNA.kremKartu;
  ctx.fill();
  ctx.strokeStyle = WARNA.garis;
  ctx.lineWidth = 1;
  ctx.stroke();

  const tinggiHead = 58 * s;
  ctx.save();
  roundRect(ctx, x, y, w, h, 18 * s);
  ctx.clip();
  ctx.fillStyle = WARNA.emasLembut;
  ctx.fillRect(x, y, w, tinggiHead);
  ctx.restore();

  const libur = liburDiBulan(bulanNum);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = WARNA.merahTua;
  ctx.font = `${22 * s}px 'Manrope Bold', sans-serif`;
  ctx.fillText(namaBulan, x + 18 * s, y + 36 * s);

  const labelJumlah = `${libur.length} festivos`;
  ctx.font = `${11 * s}px 'Inter Bold', sans-serif`;
  const lebarLabel = ctx.measureText(labelJumlah).width;
  const padPill = 10 * s;
  const pillW = lebarLabel + padPill * 2;
  const pillH = 22 * s;
  const pillX = x + w - pillW - 16 * s;
  const pillY = y + 18 * s;
  roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.fillStyle = WARNA.emas;
  ctx.textAlign = "center";
  ctx.fillText(labelJumlah, pillX + pillW / 2, pillY + pillH / 2 + 4 * s);

  const kolLebar = w / 7;
  const headerHariY = y + tinggiHead + 20 * s;
  ctx.font = `${11 * s}px 'Inter Bold', sans-serif`;
  ctx.fillStyle = WARNA.abu;
  ctx.textAlign = "center";
  NAMA_HARI.forEach((h2, i) => {
    ctx.fillText(h2, x + kolLebar * i + kolLebar / 2, headerHariY);
  });

  const offset = offsetHariPertama(bulanNum);
  const totalHari = jumlahHariDiBulan(bulanNum);
  const baris = Math.ceil((offset + totalHari) / 7);
  const tinggiSel = 34 * s;
  const grafikMulaiY = headerHariY + 16 * s;

  const liburMap = {};
  libur.forEach((l) => (liburMap[l.tgl] = l));

  for (let i = 0; i < totalHari; i++) {
    const tgl = i + 1;
    const posisi = offset + i;
    const barisI = Math.floor(posisi / 7);
    const kolom = posisi % 7;
    const cx = x + kolLebar * kolom + kolLebar / 2;
    const cy = grafikMulaiY + tinggiSel * barisI + tinggiSel / 2;

    const info = liburMap[tgl];
    if (info) {
      ctx.beginPath();
      ctx.arc(cx, cy, 13 * s, 0, Math.PI * 2);
      ctx.fillStyle = WARNA.tipe[info.tipe];
      ctx.fill();
      ctx.fillStyle = WARNA.tipeTeks[info.tipe];
      ctx.font = `${13 * s}px 'Inter Bold', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(tgl), cx, cy + 1);
      ctx.textBaseline = "alphabetic";
    } else {
      const dow = kolom;
      ctx.fillStyle = dow === 6 ? WARNA.minggu : WARNA.tinta;
      ctx.font = `${13 * s}px 'Inter', sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(String(tgl), cx, cy + 4 * s);
    }
  }

  const yTabelSelesai = grafikMulaiY + tinggiSel * baris + 8 * s;
  ctx.strokeStyle = WARNA.garis;
  ctx.setLineDash([4 * s, 3 * s]);
  ctx.beginPath();
  ctx.moveTo(x + 18 * s, yTabelSelesai);
  ctx.lineTo(x + w - 18 * s, yTabelSelesai);
  ctx.stroke();
  ctx.setLineDash([]);

  let yDaftar = yTabelSelesai + 22 * s;
  ctx.textAlign = "left";
  if (libur.length === 0) {
    ctx.fillStyle = WARNA.abu;
    ctx.font = `italic ${12 * s}px 'Inter', sans-serif`;
    ctx.fillText("No hay festivos este mes.", x + 18 * s, yDaftar);
  } else {
    libur.forEach((l) => {
      ctx.fillStyle = WARNA.merahTua;
      ctx.font = `${12 * s}px 'Inter ExtraBold', sans-serif`;
      ctx.fillText(String(l.tgl), x + 18 * s, yDaftar);
      ctx.fillStyle = "#4B4137";
      ctx.font = `${12 * s}px 'Inter', sans-serif`;
      ctx.fillText(l.nama, x + 44 * s, yDaftar);
      yDaftar += 19 * s;
    });
  }
}

async function renderTahun(outputPath) {
  const lebarKartu = 700;
  const gap = 34;
  const kolom = 3;
  const margin = 40;
  const lebarKanvas = margin * 2 + lebarKartu * kolom + gap * (kolom - 1);
  const skalaKartu = 1.6;

  const tinggiHeader = 360;
  const tinggiLegenda = 74;
  const jumlahBaris = Math.ceil(12 / kolom);

  const tinggiTiapKartu = [];
  for (let b = 1; b <= 12; b++) {
    tinggiTiapKartu.push(hitungTinggiKartuBulan(b, lebarKartu, skalaKartu));
  }

  const tinggiTiapBaris = [];
  for (let brs = 0; brs < jumlahBaris; brs++) {
    const potongan = tinggiTiapKartu.slice(brs * kolom, brs * kolom + kolom);
    tinggiTiapBaris.push(Math.max(...potongan));
  }

  const totalTinggiKartu = tinggiTiapBaris.reduce((a, b) => a + b, 0) + gap * (jumlahBaris - 1);
  const tinggiKanvas = tinggiHeader + 24 + tinggiLegenda + 40 + totalTinggiKartu + 60;

  const canvas = createCanvas(lebarKanvas, tinggiKanvas);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = WARNA.krem;
  ctx.fillRect(0, 0, lebarKanvas, tinggiKanvas);

  gambarHeader(ctx, 0, 0, lebarKanvas, {
    tinggi: tinggiHeader,
    judul: "Calendario de Indonesia 2026",
    subjudulBaris: [
      "Doce meses con festivos nacionales, celebraciones",
      "religiosas, culturales y días puente.",
    ],
    statistik: [
      { angka: "17", label: "Festivos nacionales" },
      { angka: "8", label: "Días puente" },
      { angka: "25", label: "Total de festivos" },
    ],
  });

  const legendaY = tinggiHeader - 26;
  gambarLegenda(ctx, margin, legendaY, lebarKanvas - margin * 2, tinggiLegenda);

  const mulaiY = legendaY + tinggiLegenda + 40;
  let yBaris = mulaiY;

  for (let brs = 0; brs < jumlahBaris; brs++) {
    for (let kol = 0; kol < kolom; kol++) {
      const b = brs * kolom + kol;
      if (b >= 12) continue;
      const x = margin + kol * (lebarKartu + gap);
      gambarKartuBulan(ctx, x, yBaris, lebarKartu, tinggiTiapKartu[b], b + 1, NAMA_BULAN[b], skalaKartu);
    }
    yBaris += tinggiTiapBaris[brs] + gap;
  }

  const pngData = await canvas.encode('png');
  fs.writeFileSync(outputPath, pngData);
  return outputPath;
}

async function renderBulan(bulanNum, outputPath) {
  const margin = 40;
  const lebarKartu = 760;
  const lebarKanvas = margin * 2 + lebarKartu;
  const skalaKartu = 2.1;

  const tinggiHeader = 300;
  const tinggiLegenda = 74;
  const tinggiKartu = hitungTinggiKartuBulan(bulanNum, lebarKartu, skalaKartu);

  const tinggiKanvas = tinggiHeader + 24 + tinggiLegenda + 40 + tinggiKartu + 50;
  const canvas = createCanvas(lebarKanvas, tinggiKanvas);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = WARNA.krem;
  ctx.fillRect(0, 0, lebarKanvas, canvas.height);

  const namaBulan = NAMA_BULAN[bulanNum - 1];
  const libur = liburDiBulan(bulanNum);

  gambarHeader(ctx, 0, 0, lebarKanvas, {
    tinggi: tinggiHeader,
    judul: `${namaBulan} 2026`,
    subjudulBaris: [
      "Calendario de Indonesia con festivos nacionales, celebraciones",
      "religiosas, culturales y días puente.",
    ],
    statistik: [{ angka: String(libur.length), label: "Festivos de este mes" }],
  });

  const legendaY = tinggiHeader - 26;
  gambarLegenda(ctx, margin, legendaY, lebarKanvas - margin * 2, tinggiLegenda);

  const kartuY = legendaY + tinggiLegenda + 40;
  gambarKartuBulan(ctx, margin, kartuY, lebarKartu, tinggiKartu, bulanNum, namaBulan, skalaKartu);

  const pngData = await canvas.encode('png');
  fs.writeFileSync(outputPath, pngData);
  return outputPath;
}

const NAMA_KE_NOMOR = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

async function handler(m, { sock, text }) {
    try {
        let mode = "tahun";
        let nomorBulan = 0;
        let namaBulanStr = "";

        if (text) {
            const input = text.trim().toLowerCase();
            if (NAMA_KE_NOMOR[input]) {
                mode = "bulan";
                nomorBulan = NAMA_KE_NOMOR[input];
                namaBulanStr = input;
            } else if (input === "año" || input === "2026") {
                mode = "tahun";
            } else {
                return m.reply(
                    `❌ *FORMATO DE MES NO VÁLIDO*\n\n` +
                    `Ingresa un mes válido (por ejemplo: *enero*, *febrero*, etc.) o déjalo vacío para ver el calendario anual completo.`
                );
            }
        }

        await m.react('🕕');

        await pastikanFontTersedia();
        daftarkanFont();

        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const outputPath = path.join(tempDir, `kalender_${mode}_${Date.now()}.png`);

        if (mode === "tahun") {
            await renderTahun(outputPath);
            await sock.sendMessage(m.chat, { 
                image: { url: outputPath }, 
                caption: `📅 *CALENDARIO DE INDONESIA 2026*\n\nAquí tienes el calendario completo de 2026, con todos los festivos nacionales y días puente.`
            }, { quoted: m });
        } else {
            await renderBulan(nomorBulan, outputPath);
            const namaBulanProper = namaBulanStr.charAt(0).toUpperCase() + namaBulanStr.slice(1);
            await sock.sendMessage(m.chat, { 
                image: { url: outputPath }, 
                caption: `📅 *CALENDARIO DE ${namaBulanProper.toUpperCase()} DE 2026*\n\nAquí tienes el calendario de ${namaBulanProper} de 2026 con su lista de festivos.`
            }, { quoted: m });
        }

        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        await m.react('✅');

    } catch (error) {
        console.error(error);
        await m.react('❌');
        m.reply(`❌ *NO SE PUDO CREAR EL CALENDARIO*\n\nEl sistema tuvo un problema al crear la imagen. ¡Inténtalo de nuevo más tarde, nakama!`);
    }
}

export { pluginConfig as config, handler };
