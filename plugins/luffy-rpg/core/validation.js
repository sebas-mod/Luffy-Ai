export function esNumeroValido(valor) {
  return (
    /^\d+$/.test(String(valor || "")) &&
    Number(valor) > 0 &&
    Number(valor) <= Number.MAX_SAFE_INTEGER
  );
}

export function parseCantidad(arg) {
  if (arg === undefined || arg === null) return 1;
  if (!/^\d+$/.test(String(arg))) return NaN;
  const n = Number(arg);
  return n > 0 && n <= 1000000 ? n : NaN;
}

export function nombreDeUsuario(m, user) {
  return (
    user?.nombre ||
    m?.pushName ||
    (m?.sender ? m.sender.split("@")[0] : "Usuario")
  );
}

export function validarIniciado(m, user) {
  if (!user) {
    m.reply(
      `⛵ *No tienes un registro pirata*\n\n` +
        `¡Embárcate en la aventura primero!\n\n` +
        `> Escribe: *${m.prefix}iniciar*`,
    );
    return false;
  }
  return true;
}
