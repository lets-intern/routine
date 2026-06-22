// 날짜/ID 헬퍼

export function uid(): string {
  return (
    (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
    Math.random().toString(36).slice(2)
  );
}

export function ymd(d: Date): string {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
