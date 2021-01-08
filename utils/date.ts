export function getMsSinceEpoch(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getDateString(msSinceEpoch) {
  return new Date(msSinceEpoch).toISOString().slice(0, 10);
}

export function getDateFromMsSinceEpoch(msSinceEpoch) {
  return new Date(msSinceEpoch);
}
