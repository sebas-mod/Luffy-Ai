# 📋 Luffy-Ai — Acceso al repo y medidas de imágenes

## 1️⃣ Link para generar el token de acceso (para subir cambios a GitHub)

> **Abrir este link:** https://github.com/settings/personal-access-tokens/new

Pasos:
1. *Token name*: `luffy-push`
2. *Expiration*: la que prefieras (recomendado: 30 días)
3. *Repository access*: **Only select repositories** → `sebas-mod/Luffy-Ai`
4. *Permissions* → *Repository permissions* → **Contents** → **Read and write**
5. Clic en **Generate token** → copiar el token (empieza con `github_pat_...`)
6. Pegar el token en el chat para que se haga el push

Repo: https://github.com/sebas-mod/Luffy-Ai

---

## 2️⃣ Medidas actuales de las imágenes del bot (`assets/`)

### Imágenes principales (usadas en config.js)

| Archivo | Dimensiones | Tamaño | Formato |
|---|---|---|---|
| luffy-daftar.png | 2816 × 1536 | 933 KB | PNG |
| luffy-demote.png | 451 × 188 | 27 KB | PNG |
| luffy-fishit.jpg | 637 × 637 | 67 KB | JPEG |
| luffy-games.jpg | 900 × 900 | 27 KB | JPEG |
| luffy-kertas.jpg | 1024 × 784 | 110 KB | JPEG |
| luffy-landscape.jpg | 736 × 1178 | 150 KB | JPEG |
| luffy-levelup.jpg | 1024 × 1024 | 32 KB | JPEG |
| luffy-minecraft.jpg | 4096 × 4096 | 4753 KB ⚠️ | JPEG |
| luffy-promote.png | 516 × 178 | 34 KB | PNG |
| luffy-rpg.jpg | 420 × 280 | 22 KB | JPEG |
| luffy-rules.jpg | 736 × 414 | 31 KB | JPEG |
| luffy-store.png | 1360 × 768 | 946 KB | PNG |
| luffy-v8.jpg | 1024 × 576 | 167 KB | JPEG |
| luffy-winner.jpg | 1199 × 1207 | 37 KB | JPEG |
| luffy.png | 735 × 456 | 46 KB | JPEG |
| luffy2.jpg | 736 × 736 | 59 KB | JPEG |
| luffy3.jpg | 735 × 503 | 62 KB | JPEG |
| pp-kosong.jpg | 736 × 736 | 8 KB | JPEG |

### Otras carpetas

| Archivo | Dimensiones | Nota |
|---|---|---|
| assets/image/shuffle/srt_33740cf408.jpg | 736 × 736 | imágenes aleatorias |
| assets/image/shuffle/srt_3a8aee4df8.jpg | 736 × 736 | imágenes aleatorias |
| assets/image/shuffle/srt_4bd806e7c8.jpg | 1170 × 1144 | imágenes aleatorias |
| assets/kertas/magernulis1.jpg | 1024 × 784 | fondo "papel" para magernulis |

⚠️ **luffy-minecraft.jpg pesa 4.7 MB** — es muy grande para lo que hace; conviene reducirla.

---

## 3️⃣ ¿Se pueden modificar las medidas? → SÍ ✅

Todas estas imágenes son solo decorativas (portadas de menús, avisos de promote/demote, etc.), así que **se pueden cambiar de medidas sin romper nada**, siempre que:

- **No borres ni renombres el archivo**: el bot las busca por nombre exacto en `config.js` (`assets:` sección).
- **Mantén más o menos la proporción original** (ancho/alto) para que no se vea estirada.
- Formato: puede ser JPG o PNG, pero si cambias la extensión hay que actualizar `config.js`.

### Medidas recomendadas por uso

| Uso | Proporción ideal | Ejemplo |
|---|---|---|
| Portada de menú / banner | 16:9 horizontal | 1280 × 720 |
| Imagen cuadrada (perfil, juegos) | 1:1 | 800 × 800 |
| Promote / Demote (mini banner) | ~2.7:1 | 500 × 185 |
| Vertical (fondo de carta) | 2:3 | 700 × 1050 |

### Cómo cambiarlas luego

1. Reemplazas el archivo con el mismo nombre (ej: nueva `luffy-v8.jpg` de 1280×720).
2. El bot la detecta sola al reiniciar (o con hot-reload si estás en dev).
3. Si quieres, yo puedo redimensionarlas automáticamente desde acá con un script.

---
*Generado el 23/08/2026 — Luffy-Ai v3.3*
