const STORAGE_KEY = 'poap:emblemDates';

const readStore = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
};

export const recordEmblemDate = (identifier, timestampMs = Date.now()) => {
  if (!identifier) return;
  try {
    const store = readStore();
    store[identifier] = timestampMs;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {

  }
};

export const getEmblemDate = (identifier) => {
  if (!identifier) return null;
  return readStore()[identifier] ?? null;
};

export const buildNftIdentifier = (collectionId, nonce) => {
  let hex = BigInt(nonce).toString(16);
  if (hex.length % 2 !== 0) hex = `0${hex}`;
  return `${collectionId}-${hex}`;
};