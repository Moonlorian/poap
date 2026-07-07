export const formatDateTime = (timestampMs) => {
  if (!timestampMs) return '-';
  const date = new Date(timestampMs);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

export const formatDate = (timestampMs) => {
  if (!timestampMs) return '-';
  const date = new Date(timestampMs);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const parseDateTimeLocal = (value) => {
  if (!value) return null;
  return new Date(value).getTime();
};

export const encodePem = (pem) => btoa(unescape(encodeURIComponent(pem.trim())));

export const decodePem = (encoded) => {
  if (!encoded) return '';
  return decodeURIComponent(escape(atob(encoded)));
};

export const buildClaimUrl = (origin, organizer, pem) => {
  const base = origin.replace(/\/$/, '');
  const params = new URLSearchParams({
    o: organizer,
    k: encodePem(pem)
  });
  return `${base}/poap/alumne/reclamar?${params.toString()}`;
};

export const parseClaimParams = (searchParams) => ({
  organizer: searchParams.get('o') ?? '',
  pem: decodePem(searchParams.get('k') ?? '')
});
