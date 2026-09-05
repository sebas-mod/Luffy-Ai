const runtimeErrors = [];
const MAX_ERRORS = 100;

function recordPluginError({ command, pluginName, error, at = Date.now() }) {
  const message = error?.message || String(error || "Unknown error");
  const stack = error?.stack
    ? String(error.stack).split("\n").slice(0, 4).join("\n")
    : "";

  runtimeErrors.unshift({
    command: command || "unknown",
    pluginName: pluginName || command || "unknown",
    error: message,
    stack,
    at,
  });

  if (runtimeErrors.length > MAX_ERRORS) {
    runtimeErrors.length = MAX_ERRORS;
  }
}

function getPluginRuntimeErrors(options = {}) {
  let list = runtimeErrors;
  if (options.from) list = list.filter((e) => e.at >= options.from);
  if (options.limit && options.limit > 0) list = list.slice(0, options.limit);
  return list;
}

function clearPluginRuntimeErrors() {
  runtimeErrors.length = 0;
}

function countPluginRuntimeErrors() {
  return runtimeErrors.length;
}

export {
  recordPluginError,
  getPluginRuntimeErrors,
  clearPluginRuntimeErrors,
  countPluginRuntimeErrors,
};