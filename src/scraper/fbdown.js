import axios from 'axios';

async function fbdown(url) {
  try {
    const res = await axios.get(`https://api.azbry.com/api/download/facebook?url=${encodeURIComponent(url)}`);
    if (res.data && res.data.status) {
      return res.data;
    }
    return { status: false, message: "Error al obtener datos de la API" };
  } catch (err) {
    return { status: false, message: err.message };
  }
}

export { fbdown };
