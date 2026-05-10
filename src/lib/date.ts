const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthLong = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatShort(d: Date): string {
  return `${monthShort[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatLong(d: Date): string {
  return `${monthLong[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
