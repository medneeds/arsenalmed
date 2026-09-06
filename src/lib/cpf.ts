export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function isValidCpf(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;

  const digits = d.split("").map(Number) as number[];
  for (const len of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += (digits[i] as number) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    const check = rest === 10 || rest === 11 ? 0 : rest;
    if (check !== digits[len]) return false;
  }
  return true;
}
