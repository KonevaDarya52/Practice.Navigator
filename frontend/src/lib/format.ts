// «2027-02-01» → «01.02.2027»; пустое значение → «—»
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}.${m}.${y}` : iso;
}

// «ООО «ТехноПлюс»» → «ТЕ»: две первые буквы названия в кавычках (или самого названия)
export function companyInitials(name: string): string {
  const inQuotes = name.match(/«([^»]+)»/)?.[1] ?? name;
  return inQuotes.replace(/[^A-Za-zА-Яа-яЁё]/g, "").slice(0, 2).toUpperCase() || "?";
}

// Склонение: plural(3, "место", "места", "мест") → «места»
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
