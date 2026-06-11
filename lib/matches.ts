export type Media =
  | "Tigo Sports"
  | "FOX"
  | "Canal 11 Guatemala"
  | "Canal 7 Guatemala"
  | "Canal 13 Guatemala"
  | "Canal 3 Guatemala"
  | "Canal 4 El Salvador"
  | "Teletica Canal 7";

export type Match = {
  id: string;
  round: "Fecha 1" | "Fecha 2" | "Fecha 3";
  group?: string;
  date: string; // YYYY-MM-DD
  dayLabel: string;
  time: string; // HH:mm, hora Guatemala/El Salvador
  home: string;
  away: string;
  media: Media[];
};

export const MEDIA_OPTIONS: Media[] = [
  "Tigo Sports",
  "FOX",
  "Canal 11 Guatemala",
  "Canal 7 Guatemala",
  "Canal 13 Guatemala",
  "Canal 3 Guatemala",
  "Canal 4 El Salvador",
  "Teletica Canal 7"
];

export const matches: Match[] = [
  // FECHA 1
  { id: "m001", round: "Fecha 1", group: "A", date: "2026-06-11", dayLabel: "Jue 11/06", time: "13:00", home: "México", away: "Sudáfrica", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala", "Canal 4 El Salvador", "Teletica Canal 7"] },
  { id: "m002", round: "Fecha 1", group: "A", date: "2026-06-11", dayLabel: "Jue 11/06", time: "20:00", home: "Corea del Sur", away: "Chequia", media: ["Tigo Sports"] },
  { id: "m003", round: "Fecha 1", group: "B", date: "2026-06-12", dayLabel: "Vie 12/06", time: "13:00", home: "Canadá", away: "Bosnia", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala", "Canal 4 El Salvador"] },
  { id: "m004", round: "Fecha 1", group: "D", date: "2026-06-12", dayLabel: "Vie 12/06", time: "19:00", home: "Estados Unidos", away: "Paraguay", media: ["Tigo Sports", "Teletica Canal 7"] },
  { id: "m005", round: "Fecha 1", group: "B", date: "2026-06-13", dayLabel: "Sáb 13/06", time: "13:00", home: "Qatar", away: "Suiza", media: ["Tigo Sports", "FOX", "Canal 7 Guatemala", "Canal 4 El Salvador"] },
  { id: "m006", round: "Fecha 1", group: "C", date: "2026-06-13", dayLabel: "Sáb 13/06", time: "16:00", home: "Brasil", away: "Marruecos", media: ["Tigo Sports"] },
  { id: "m007", round: "Fecha 1", group: "C", date: "2026-06-13", dayLabel: "Sáb 13/06", time: "19:00", home: "Haití", away: "Escocia", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m008", round: "Fecha 1", group: "D", date: "2026-06-13", dayLabel: "Sáb 13/06", time: "22:00", home: "Australia", away: "Turquía", media: ["Tigo Sports", "FOX", "Canal 7 Guatemala"] },
  { id: "m009", round: "Fecha 1", group: "E", date: "2026-06-14", dayLabel: "Dom 14/06", time: "11:00", home: "Alemania", away: "Curazao", media: ["Tigo Sports"] },
  { id: "m010", round: "Fecha 1", group: "F", date: "2026-06-14", dayLabel: "Dom 14/06", time: "14:00", home: "Países Bajos", away: "Japón", media: ["Tigo Sports", "Canal 4 El Salvador", "Teletica Canal 7"] },
  { id: "m011", round: "Fecha 1", group: "E", date: "2026-06-14", dayLabel: "Dom 14/06", time: "17:00", home: "Costa de Marfil", away: "Ecuador", media: ["Tigo Sports", "FOX", "Canal 7 Guatemala", "Canal 4 El Salvador"] },
  { id: "m012", round: "Fecha 1", group: "F", date: "2026-06-14", dayLabel: "Dom 14/06", time: "20:00", home: "Suecia", away: "Túnez", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m013", round: "Fecha 1", group: "H", date: "2026-06-15", dayLabel: "Lun 15/06", time: "10:00", home: "España", away: "Cabo Verde", media: ["Tigo Sports", "Canal 4 El Salvador"] },
  { id: "m014", round: "Fecha 1", group: "G", date: "2026-06-15", dayLabel: "Lun 15/06", time: "13:00", home: "Bélgica", away: "Egipto", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala", "Canal 4 El Salvador"] },
  { id: "m015", round: "Fecha 1", group: "H", date: "2026-06-15", dayLabel: "Lun 15/06", time: "16:00", home: "Arabia Saudita", away: "Uruguay", media: ["Tigo Sports", "Canal 11 Guatemala", "Teletica Canal 7"] },
  { id: "m016", round: "Fecha 1", group: "G", date: "2026-06-15", dayLabel: "Lun 15/06", time: "19:00", home: "Irán", away: "Nueva Zelanda", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m017", round: "Fecha 1", group: "I", date: "2026-06-16", dayLabel: "Mar 16/06", time: "13:00", home: "Francia", away: "Senegal", media: ["Tigo Sports", "Canal 4 El Salvador", "Teletica Canal 7"] },
  { id: "m018", round: "Fecha 1", group: "I", date: "2026-06-16", dayLabel: "Mar 16/06", time: "16:00", home: "Irak", away: "Noruega", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m019", round: "Fecha 1", group: "J", date: "2026-06-16", dayLabel: "Mar 16/06", time: "19:00", home: "Argentina", away: "Argelia", media: ["Tigo Sports"] },
  { id: "m020", round: "Fecha 1", group: "J", date: "2026-06-16", dayLabel: "Mar 16/06", time: "22:00", home: "Austria", away: "Jordania", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m021", round: "Fecha 1", group: "K", date: "2026-06-17", dayLabel: "Mié 17/06", time: "11:00", home: "Portugal", away: "RD Congo", media: ["Tigo Sports"] },
  { id: "m022", round: "Fecha 1", group: "L", date: "2026-06-17", dayLabel: "Mié 17/06", time: "14:00", home: "Inglaterra", away: "Croacia", media: ["Tigo Sports", "Canal 4 El Salvador", "Teletica Canal 7"] },
  { id: "m023", round: "Fecha 1", group: "L", date: "2026-06-17", dayLabel: "Mié 17/06", time: "17:00", home: "Ghana", away: "Panamá", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m024", round: "Fecha 1", group: "K", date: "2026-06-17", dayLabel: "Mié 17/06", time: "20:00", home: "Uzbekistán", away: "Colombia", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },

  // FECHA 2
  { id: "m025", round: "Fecha 2", group: "A", date: "2026-06-18", dayLabel: "Jue 18/06", time: "10:00", home: "Chequia", away: "Sudáfrica", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m026", round: "Fecha 2", group: "B", date: "2026-06-18", dayLabel: "Jue 18/06", time: "13:00", home: "Suiza", away: "Bosnia", media: ["Tigo Sports"] },
  { id: "m027", round: "Fecha 2", group: "B", date: "2026-06-18", dayLabel: "Jue 18/06", time: "16:00", home: "Canadá", away: "Qatar", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m028", round: "Fecha 2", group: "A", date: "2026-06-18", dayLabel: "Jue 18/06", time: "19:00", home: "México", away: "Corea del Sur", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala", "Canal 4 El Salvador"] },
  { id: "m029", round: "Fecha 2", group: "D", date: "2026-06-19", dayLabel: "Vie 19/06", time: "13:00", home: "Estados Unidos", away: "Australia", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m030", round: "Fecha 2", group: "C", date: "2026-06-19", dayLabel: "Vie 19/06", time: "16:00", home: "Escocia", away: "Marruecos", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala", "Canal 4 El Salvador"] },
  { id: "m031", round: "Fecha 2", group: "C", date: "2026-06-19", dayLabel: "Vie 19/06", time: "18:30", home: "Brasil", away: "Haití", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala", "Teletica Canal 7"] },
  { id: "m032", round: "Fecha 2", group: "D", date: "2026-06-19", dayLabel: "Vie 19/06", time: "21:00", home: "Turquía", away: "Paraguay", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m033", round: "Fecha 2", group: "F", date: "2026-06-20", dayLabel: "Sáb 20/06", time: "11:00", home: "Países Bajos", away: "Suecia", media: ["Tigo Sports", "Teletica Canal 7"] },
  { id: "m034", round: "Fecha 2", group: "E", date: "2026-06-20", dayLabel: "Sáb 20/06", time: "14:00", home: "Alemania", away: "Costa de Marfil", media: ["Tigo Sports", "FOX", "Canal 7 Guatemala", "Canal 4 El Salvador"] },
  { id: "m035", round: "Fecha 2", group: "E", date: "2026-06-20", dayLabel: "Sáb 20/06", time: "18:00", home: "Ecuador", away: "Curazao", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m036", round: "Fecha 2", group: "F", date: "2026-06-20", dayLabel: "Sáb 20/06", time: "22:00", home: "Túnez", away: "Japón", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m037", round: "Fecha 2", group: "H", date: "2026-06-21", dayLabel: "Dom 21/06", time: "10:00", home: "España", away: "Arabia Saudita", media: ["Tigo Sports", "Teletica Canal 7"] },
  { id: "m038", round: "Fecha 2", group: "G", date: "2026-06-21", dayLabel: "Dom 21/06", time: "13:00", home: "Bélgica", away: "Egipto", media: ["Tigo Sports", "FOX", "Canal 7 Guatemala", "Canal 4 El Salvador"] },
  { id: "m039", round: "Fecha 2", group: "H", date: "2026-06-21", dayLabel: "Dom 21/06", time: "16:00", home: "Uruguay", away: "Cabo Verde", media: ["Tigo Sports"] },
  { id: "m040", round: "Fecha 2", group: "G", date: "2026-06-21", dayLabel: "Dom 21/06", time: "19:00", home: "Nueva Zelanda", away: "Egipto", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m041", round: "Fecha 2", group: "J", date: "2026-06-22", dayLabel: "Lun 22/06", time: "11:00", home: "Argentina", away: "Austria", media: ["Tigo Sports", "Canal 4 El Salvador", "Teletica Canal 7"] },
  { id: "m042", round: "Fecha 2", group: "I", date: "2026-06-22", dayLabel: "Lun 22/06", time: "15:00", home: "Francia", away: "Irak", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m043", round: "Fecha 2", group: "I", date: "2026-06-22", dayLabel: "Lun 22/06", time: "18:00", home: "Noruega", away: "Senegal", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m044", round: "Fecha 2", group: "J", date: "2026-06-22", dayLabel: "Lun 22/06", time: "21:00", home: "Jordania", away: "Argelia", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m045", round: "Fecha 2", group: "K", date: "2026-06-23", dayLabel: "Mar 23/06", time: "11:00", home: "Portugal", away: "Uzbekistán", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m046", round: "Fecha 2", group: "L", date: "2026-06-23", dayLabel: "Mar 23/06", time: "14:00", home: "Inglaterra", away: "Ghana", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala", "Canal 4 El Salvador"] },
  { id: "m047", round: "Fecha 2", group: "L", date: "2026-06-23", dayLabel: "Mar 23/06", time: "17:00", home: "Panamá", away: "Croacia", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m048", round: "Fecha 2", group: "K", date: "2026-06-23", dayLabel: "Mar 23/06", time: "20:00", home: "Colombia", away: "RD Congo", media: ["Tigo Sports", "Canal 4 El Salvador", "Teletica Canal 7"] },

  // FECHA 3
  { id: "m049", round: "Fecha 3", group: "B", date: "2026-06-24", dayLabel: "Mié 24/06", time: "13:00", home: "Suiza", away: "Canadá", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m050", round: "Fecha 3", group: "B", date: "2026-06-24", dayLabel: "Mié 24/06", time: "13:00", home: "Bosnia", away: "Qatar", media: ["Tigo Sports", "Canal 13 Guatemala"] },
  { id: "m051", round: "Fecha 3", group: "C", date: "2026-06-24", dayLabel: "Mié 24/06", time: "16:00", home: "Escocia", away: "Brasil", media: ["Tigo Sports", "Canal 4 El Salvador"] },
  { id: "m052", round: "Fecha 3", group: "C", date: "2026-06-24", dayLabel: "Mié 24/06", time: "16:00", home: "Marruecos", away: "Haití", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m053", round: "Fecha 3", group: "A", date: "2026-06-24", dayLabel: "Mié 24/06", time: "19:00", home: "Chequia", away: "México", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala", "Teletica Canal 7"] },
  { id: "m054", round: "Fecha 3", group: "A", date: "2026-06-24", dayLabel: "Mié 24/06", time: "19:00", home: "Sudáfrica", away: "Corea del Sur", media: ["Tigo Sports", "Canal 13 Guatemala"] },
  { id: "m055", round: "Fecha 3", group: "E", date: "2026-06-25", dayLabel: "Jue 25/06", time: "14:00", home: "Ecuador", away: "Alemania", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala", "Teletica Canal 7"] },
  { id: "m056", round: "Fecha 3", group: "E", date: "2026-06-25", dayLabel: "Jue 25/06", time: "14:00", home: "Curazao", away: "Costa de Marfil", media: ["Tigo Sports", "Canal 13 Guatemala"] },
  { id: "m057", round: "Fecha 3", group: "F", date: "2026-06-25", dayLabel: "Jue 25/06", time: "17:00", home: "Túnez", away: "Países Bajos", media: ["Tigo Sports", "Canal 11 Guatemala", "Canal 4 El Salvador"] },
  { id: "m058", round: "Fecha 3", group: "F", date: "2026-06-25", dayLabel: "Jue 25/06", time: "17:00", home: "Japón", away: "Suecia", media: ["Tigo Sports", "Canal 13 Guatemala"] },
  { id: "m059", round: "Fecha 3", group: "D", date: "2026-06-25", dayLabel: "Jue 25/06", time: "20:00", home: "Turquía", away: "Estados Unidos", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala", "Canal 4 El Salvador"] },
  { id: "m060", round: "Fecha 3", group: "D", date: "2026-06-25", dayLabel: "Jue 25/06", time: "20:00", home: "Paraguay", away: "Australia", media: ["Tigo Sports", "FOX", "Canal 3 Guatemala"] },
  { id: "m061", round: "Fecha 3", group: "I", date: "2026-06-26", dayLabel: "Vie 26/06", time: "13:00", home: "Noruega", away: "Francia", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala", "Canal 4 El Salvador", "Teletica Canal 7"] },
  { id: "m062", round: "Fecha 3", group: "I", date: "2026-06-26", dayLabel: "Vie 26/06", time: "13:00", home: "Senegal", away: "Irak", media: ["Tigo Sports", "FOX", "Canal 13 Guatemala"] },
  { id: "m063", round: "Fecha 3", group: "H", date: "2026-06-26", dayLabel: "Vie 26/06", time: "18:00", home: "Uruguay", away: "España", media: ["Tigo Sports", "Canal 4 El Salvador", "Teletica Canal 7"] },
  { id: "m064", round: "Fecha 3", group: "H", date: "2026-06-26", dayLabel: "Vie 26/06", time: "18:00", home: "Cabo Verde", away: "Arabia Saudita", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m065", round: "Fecha 3", group: "G", date: "2026-06-26", dayLabel: "Vie 26/06", time: "21:00", home: "Nueva Zelanda", away: "Bélgica", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m066", round: "Fecha 3", group: "G", date: "2026-06-26", dayLabel: "Vie 26/06", time: "21:00", home: "Egipto", away: "Irán", media: ["Tigo Sports", "FOX", "Canal 3 Guatemala"] },
  { id: "m067", round: "Fecha 3", group: "L", date: "2026-06-27", dayLabel: "Sáb 27/06", time: "15:00", home: "Panamá", away: "Inglaterra", media: ["Tigo Sports", "FOX", "Canal 7 Guatemala", "Teletica Canal 7"] },
  { id: "m068", round: "Fecha 3", group: "L", date: "2026-06-27", dayLabel: "Sáb 27/06", time: "15:00", home: "Croacia", away: "Ghana", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala"] },
  { id: "m069", round: "Fecha 3", group: "K", date: "2026-06-27", dayLabel: "Sáb 27/06", time: "17:30", home: "Colombia", away: "Portugal", media: ["Tigo Sports", "Canal 4 El Salvador", "Teletica Canal 7"] },
  { id: "m070", round: "Fecha 3", group: "K", date: "2026-06-27", dayLabel: "Sáb 27/06", time: "17:30", home: "RD Congo", away: "Uzbekistán", media: ["Tigo Sports", "FOX", "Canal 7 Guatemala"] },
  { id: "m071", round: "Fecha 3", group: "J", date: "2026-06-27", dayLabel: "Sáb 27/06", time: "20:00", home: "Jordania", away: "Argentina", media: ["Tigo Sports", "FOX", "Canal 11 Guatemala", "Canal 4 El Salvador"] },
  { id: "m072", round: "Fecha 3", group: "J", date: "2026-06-27", dayLabel: "Sáb 27/06", time: "20:00", home: "Argelia", away: "Austria", media: ["Tigo Sports", "FOX", "Canal 13 Guatemala"] }
];

export function getUniqueDates() {
  return Array.from(new Set(matches.map((match) => match.date)));
}
