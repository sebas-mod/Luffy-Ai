import axios from "axios";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "pddikti",
  alias: ["dikti", "carimahasiswa"],
  category: "search",
  description: "Busca datos de estudiantes, docentes, instituciones y programas de PDDIKTI",
  usage: ".pddikti <mode> <query>",
  example: ".pddikti all Gibran Khalil\n.pddikti detail <id_mahasiswa>",
  cooldown: 15,
  carne: 1,
  isEnabled: true,
};

const CORS_PROXY = "https://cors.rifkyshre.biz.id/";
const API_BASE = "https://api-pddikti.kemdiktisaintek.go.id";
const FRONTEND_ORIGIN = "https://pddikti.kemdiktisaintek.go.id";

async function pddiktiGet(path) {
  const res = await axios.get(`${CORS_PROXY}${API_BASE}${path}`, {
    timeout: 30000,
    validateStatus: () => true,
    headers: {
      Accept: "application/json",
      "X-Cors-Spoof-Origin": FRONTEND_ORIGIN,
    },
  });
  if (res.status !== 200) {
    throw new Error(`PDDIKTI HTTP ${res.status}: ${JSON.stringify(res.data).slice(0, 150)}`);
  }
  return res.data;
}

async function pddikti(input) {
  try {
    const mode = (input?.mode ?? "all").toLowerCase();
    const query = typeof input?.query === "string" ? input.query.trim() : "";

    if (mode === "detail") {
      const mhsId = typeof input?.mahasiswaId === "string" ? input.mahasiswaId.trim() : "";
      if (!mhsId) {
        return { Status: false, Code: 400, Input: input, Result: null,
          Error: "El campo 'mahasiswaId' es obligatorio para el modo 'detail'. Tómalo de los resultados de búsqueda mhs (campo 'id')." };
      }
      const data = await pddiktiGet(`/detail/mhs/${encodeURIComponent(mhsId)}`);
      const message = data?.nama
        ? `🎓 ${data.nama} — ${data.nim} | ${data.prodi} @ ${data.nama_pt}`
        : "🎓 Detalle del estudiante";
      return {
        Status: true, Code: 200, Input: input,
        Result: {
          message,
          nama: data.nama,
          nim: data.nim,
          jenisKelamin: data.jenis_kelamin === "L" ? "Masculino" : data.jenis_kelamin === "P" ? "Femenino" : null,
          jenjang: data.jenjang,
          prodi: data.prodi,
          kodeProdi: data.kode_prodi,
          namaPt: data.nama_pt,
          kodePt: data.kode_pt?.trim(),
          tanggalMasuk: data.tanggal_masuk,
          jenisDaftar: data.jenis_daftar,
          statusSaatIni: data.status_saat_ini,
          idPt: data.id_pt,
          idProdi: data.id_sms,
          raw: data,
        },
      };
    }

    if (!query) {
      return { Status: false, Code: 400, Input: input, Result: null,
        Error: "La palabra clave de búsqueda es obligatoria (nombre, NIM, NIDN, etc.)." };
    }
    if (query.length < 3) {
      return { Status: false, Code: 400, Input: input, Result: null,
        Error: "La consulta es demasiado corta (mín. 3 caracteres)." };
    }

    let path;
    switch (mode) {
      case "all":   path = `/pencarian/all/${encodeURIComponent(query)}`; break;
      case "mhs":
      case "mahasiswa":
        path = `/pencarian/mhs/${encodeURIComponent(query)}`; break;
      case "dosen": path = `/pencarian/dosen/${encodeURIComponent(query)}`; break;
      case "pt":    path = `/pencarian/pt/${encodeURIComponent(query)}`; break;
      case "prodi": path = `/pencarian/prodi/${encodeURIComponent(query)}`; break;
      default:
        return { Status: false, Code: 400, Input: input, Result: null,
          Error: `Modo desconocido '${mode}'. Usa: all | mhs | dosen | pt | prodi | detail` };
    }

    const data = await pddiktiGet(path);

    if (mode === "all" && data && typeof data === "object" && !Array.isArray(data)) {
      const mhs = Array.isArray(data.mahasiswa) ? data.mahasiswa : [];
      const dosen = Array.isArray(data.dosen) ? data.dosen : [];
      const pt = Array.isArray(data.pt) ? data.pt : [];
      const prodi = Array.isArray(data.prodi) ? data.prodi : [];
      const total = mhs.length + dosen.length + pt.length + prodi.length;
      return {
        Status: true, Code: 200, Input: input,
        Result: {
          message: `🔍 ${total} resultados para "${query}" (${mhs.length} mhs, ${dosen.length} dosen, ${pt.length} pt, ${prodi.length} prodi)`,
          query,
          totalCount: total,
          mahasiswa: mhs,
          dosen,
          pt,
          prodi,
        },
      };
    }

    const items = Array.isArray(data) ? data : [];
    return {
      Status: true, Code: 200, Input: input,
      Result: {
        message: items.length > 0
          ? `🔍 ${items.length} resultados ${mode} para "${query}"`
          : `🔍 No hay resultados ${mode} para "${query}"`,
        query,
        mode,
        count: items.length,
        results: items,
      },
    };
  } catch (e) {
    return {
      Status: false,
      Code: e.response?.status ?? 500,
      Input: input,
      Result: null,
      Error: e.message ?? String(e),
    };
  }
}

async function handler(m, { args }) {
  if (args.length === 0) {
    return m.reply(
      `🎓 *BÚSQUEDA PDDIKTI*\n\n` +
      `> Modos de búsqueda:\n` +
      `- \`.pddikti all <query>\`\n` +
      `- \`.pddikti mhs <nombre/NIM>\`\n` +
      `- \`.pddikti dosen <nombre/NIDN>\`\n` +
      `- \`.pddikti pt <nombre_universidad>\`\n` +
      `- \`.pddikti prodi <nombre_programa>\`\n` +
      `- \`.pddikti detail <id_estudiante>\`\n\n` +
      `*Ejemplo:* \`.pddikti mhs Gibran Rakabuming\``
    );
  }

  m.react("🕕");

  try {
    const mode = args[0].toLowerCase();
    
    if (mode === "detail") {
      if (args.length < 2) return m.reply("❌ ¡Ingresa el ID del estudiante!");
      const mhsId = args[1];
      const res = await pddikti({ mode: "detail", mahasiswaId: mhsId });
      
      if (!res.Status) {
        m.react("❌");
        return m.reply(`❌ ${res.Error}`);
      }
      
      const r = res.Result;
      let txt = `🎓 *DETALLE DEL ESTUDIANTE*\n\n`;
      txt += `- 📝 Nombre         : *${r.nama}*\n`;
      txt += `- 🆔 NIM            : *${r.nim}*\n`;
      txt += `- 👤 Género         : *${r.jenisKelamin ?? "-"}*\n`;
      txt += `- 🎓 Nivel          : *${r.jenjang}*\n`;
      txt += `- 📚 Programa       : *${r.prodi}*\n`;
      txt += `- 🏛️ Universidad    : *${r.namaPt}*\n`;
      txt += `- 📅 Fecha Ingreso  : *${r.tanggalMasuk}*\n`;
      txt += `- 📊 Estado         : *${r.statusSaatIni}*\n`;
      txt += `- 💼 Tipo de Registro: *${r.jenisDaftar}*\n`;
      
      m.react("✅");
      return m.reply(txt);
    }
    
    // For other modes
    const query = args.slice(1).join(" ");
    if (!query) return m.reply("❌ ¡Ingresa una palabra clave de búsqueda!");
    
    const res = await pddikti({ mode, query });
    if (!res.Status) {
      m.react("❌");
      return m.reply(`❌ ${res.Error}`);
    }
    
    const r = res.Result;
    let txt = `*${r.message}*\n\n`;
    
    if (mode === "all") {
      const mh = r.mahasiswa.slice(0, 3);
      const ds = r.dosen.slice(0, 3);
      const pt = r.pt.slice(0, 3);
      const pr = r.prodi.slice(0, 3);
      
      if (mh.length) {
        txt += `👨🎓 *ESTUDIANTES (top 3):*\n`;
        for (const m of mh) txt += `- ${m.nama} [${m.nim}] — ${m.nama_prodi}, ${m.nama_pt}\n`;
        txt += `\n`;
      }
      if (ds.length) {
        txt += `👨🏫 *DOCENTES (top 3):*\n`;
        for (const d of ds) txt += `- ${d.nama} [NIDN ${d.nidn}] — ${d.nama_prodi}, ${d.nama_pt}\n`;
        txt += `\n`;
      }
      if (pt.length) {
        txt += `🏛️ *UNIVERSIDADES (top 3):*\n`;
        for (const p of pt) txt += `- ${p.nama} (${p.nama_singkat ?? p.sinkatan_pt ?? "-"})\n`;
        txt += `\n`;
      }
      if (pr.length) {
        txt += `📚 *PROGRAMAS (top 3):*\n`;
        for (const p of pr) txt += `- ${p.nama} @ ${p.nama_pt ?? "-"}\n`;
        txt += `\n`;
      }
    } else {
      const top = r.results.slice(0, 10);
      for (const [i, item] of top.entries()) {
        if (mode === "mhs" || mode === "mahasiswa") {
          txt += `*#${i + 1} ${item.nama} [NIM ${item.nim}]*\n`;
          txt += `- 📚 ${item.nama_prodi} @ ${item.nama_pt} (${item.sinkatan_pt || "-"})\n`;
          txt += `- 🆔 ID: \`${item.id}\`\n\n`;
        } else if (mode === "dosen") {
          txt += `*#${i + 1} ${item.nama} [NIDN ${item.nidn}]*\n`;
          txt += `- 📚 ${item.nama_prodi} @ ${item.nama_pt}\n\n`;
        } else if (mode === "pt") {
          txt += `*#${i + 1} ${item.nama} (${item.nama_singkat ?? "-"})*\n`;
          txt += `- Código: ${item.kode ?? "-"}\n\n`;
        } else if (mode === "prodi") {
          txt += `*#${i + 1} ${item.nama}*\n`;
          txt += `- @ ${item.nama_pt ?? "-"}\n\n`;
        }
      }
      if (r.count > 10) txt += `> ... +${r.count - 10} resultados más.\n`;
    }
    
    m.react("✅");
    return m.reply(txt.trim());
    
  } catch (err) {
    console.error("[PDDIKTI]", err.message);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
