export type Winner = "home" | "draw" | "away" | "";

export type DbMatch = {
  id: string;
  round: string;
  group_code: string | null;
  match_date: string;
  day_label: string;
  match_time: string;
  home_team: string;
  away_team: string;
  status: string;
  external_fixture_id: string | null;
};

export type DbMedia = {
  id: string;
  name: string;
  country: string | null;
};

export type DbTransmission = {
  id?: number;
  match_id: string;
  media_id: string;
};

export type DbResult = {
  match_id: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  source: string | null;
  updated_at?: string;
};

export type Prediction = {
  match_id: string;
  winner: Winner;
  home_score: string;
  away_score: string;
};

export type MediaSelection = {
  match_id: string;
  media_id: string;
};

export type Profile = {
  id: string;
  email: string | null;
  role: "viewer" | "admin";
};

export type AppMatch = DbMatch & {
  media: DbMedia[];
  result?: DbResult | null;
};
