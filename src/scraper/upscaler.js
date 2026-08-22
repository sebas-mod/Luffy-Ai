import axios from "axios";
import fs from "fs";
import CryptoJS from "crypto-js";

const AES_KEY = CryptoJS.enc.Utf8.parse("ai-enhancer-web__aes-key");
const AES_IV = CryptoJS.enc.Utf8.parse("aienhancer-aesiv");

function enc(str) {
  return CryptoJS.AES.encrypt(str, AES_KEY, {
    iv: AES_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
}

async function upscaler(path) {
  try {
    const img = fs.readFileSync(path).toString("base64");

    const headers = {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
      "Content-Type": "application/json",
      origin: "https://aienhancer.ai",
      referer: "https://aienhancer.ai/ai-image-upscaler",
    };

    const create = await axios.post(
      "https://aienhancer.ai/api/v1/r/image-enhance/create",
      {
        model: 3,
        image: [`data:image/jpeg;base64,${img}`],
        function: enc("enhancer-hd-upscale"),
        settings: enc(JSON.stringify({ version: "v1.4", scale: 6 })),
      },
      { headers },
    );

    if (create.data?.code && create.data.code !== 200) {
      return { status: "error", msg: create.data.message || "create falló" };
    }

    const id = create.data.data.id;

    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 2500));

      const result = await axios.post(
        "https://aienhancer.ai/api/v1/r/image-enhance/result",
        { task_id: id },
        { headers },
      );

      const data = result.data.data;

      if (data && data.output) {
        return {
          id,
          output: data.output,
          input: data.input,
        };
      }
    }
  } catch (e) {
    return { status: "error", msg: e.message };
  }
}

export default upscaler;
