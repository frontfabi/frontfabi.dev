import { localizedPath, type Locale } from "./site.ts";

export function profileTitle(name: string, role: string) {
  return role.trim() ? `${name} · ${role}` : name;
}

export function metadataDescription(value: string | null | undefined, fallback: string) {
  const description = value?.replace(/\s+/g, " ").trim() || fallback;
  if (description.length <= 160) return description;
  const shortened = description.slice(0, 157);
  return `${shortened.slice(0, shortened.lastIndexOf(" "))}…`;
}

export function staticSitePaths(locales: Locale[]) {
  return locales.flatMap((locale) => [
    localizedPath("/", locale),
    localizedPath("/sobre", locale),
  ]);
}

export function muralPath(pathname: string) {
  const [path, query = ""] = pathname.split("?");
  const params = new URLSearchParams(query);
  params.set("mural", "1");
  return `${path}?${params.toString()}`;
}

export function clearMuralQuery(pathname: string, query: string) {
  const params = new URLSearchParams(query);
  params.delete("mural");
  const remaining = params.toString();
  return remaining ? `${pathname}?${remaining}` : pathname;
}
