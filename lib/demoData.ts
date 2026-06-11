import { matches as staticMatches, MEDIA_OPTIONS } from "./matches";
import { AppMatch, DbMedia } from "./types";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const demoMedia: DbMedia[] = MEDIA_OPTIONS.map((name) => ({
  id: slugify(name),
  name,
  country: name.includes("El Salvador") ? "El Salvador" : name.includes("Guatemala") ? "Guatemala" : null,
  url: name.includes("Tigo Sports")
    ? "https://www.tigosports.com.gt"
    : name.includes("FOX")
      ? "https://www.foxsports.com"
      : "https://www.google.com"
}));

export const demoMatches: AppMatch[] = staticMatches.map((match) => ({
  id: match.id,
  round: match.round,
  group_code: match.group || null,
  match_date: match.date,
  day_label: match.dayLabel,
  match_time: `${match.time}:00`,
  home_team: match.home,
  away_team: match.away,
  status: "scheduled",
  external_fixture_id: null,
  media: match.media.map((mediaName) => demoMedia.find((item) => item.name === mediaName)!).filter(Boolean),
  result: null
}));
