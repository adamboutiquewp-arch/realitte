import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const TZ = "Europe/Paris";

function parisDateStr(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", { timeZone: TZ });
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const dateStr = parisDateStr(d);
  const todayStr = parisDateStr(new Date());
  const yesterdayStr = parisDateStr(new Date(Date.now() - 86_400_000));

  if (dateStr === todayStr) {
    return d.toLocaleTimeString("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
  }
  if (dateStr === yesterdayStr) return "Hier";
  return d.toLocaleDateString("fr-FR", { timeZone: TZ, day: "numeric", month: "long", year: "numeric" });
}

export function formatDateRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

export function formatHeure(date: Date | string): string {
  return new Date(date).toLocaleTimeString("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
}

export function formatDateFull(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", { timeZone: TZ, day: "numeric", month: "long", year: "numeric" });
}

export function tempsLectureLabel(minutes: number | null): string {
  if (!minutes) return "";
  return `${minutes} min de lecture`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "…";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
