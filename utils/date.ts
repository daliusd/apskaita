export function getDateNumber(date) {
  return (
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  );
}

export function getDateString(dateNumber) {
  return `${Math.floor(dateNumber / 10000)}-${(
    Math.floor(dateNumber / 100) % 100
  )
    .toString()
    .padStart(2, '0')}-${(dateNumber % 100).toString().padStart(2, '0')}`;
}

export function getDateFromDateNumber(dateNumber) {
  return new Date(
    Math.floor(dateNumber / 10000),
    (Math.floor(dateNumber / 100) % 100) - 1,
    dateNumber % 100,
  );
}
