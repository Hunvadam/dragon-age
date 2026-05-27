const PREFIX = "DRAGON-AGE |";
export const debugEnabled = Boolean(globalThis.DRAGON_AGE_DEBUG);

function buildMessage(args) {
  return [PREFIX, ...args];
}

export function log(...args) {
  console.log(...buildMessage(args));
}

export function info(...args) {
  console.info(...buildMessage(args));
}

export function warn(...args) {
  console.warn(...buildMessage(args));
}

export function error(...args) {
  console.error(...buildMessage(args));
}

export function debug(...args) {
  if (!debugEnabled) return;
  console.debug(...buildMessage(args));
}

export function trace(...args) {
  if (!debugEnabled) return;
  console.trace(...buildMessage(args));
}

export function group(...args) {
  if (!debugEnabled) return;
  console.group(...buildMessage(args));
}

export function groupEnd() {
  if (!debugEnabled) return;
  console.groupEnd();
}
