// Types et constantes partagés entre le serveur et les composants client.
export const TEAMS = [
  { value: "rse", label: "Responsable RSE" },
  { value: "bureau", label: "Bureau restreint" },
] as const;

export type Team = (typeof TEAMS)[number]["value"];

export type MemberRow = {
  id: string;
  name: string;
  role: string;
  team: Team;
  photo_url: string | null;
  email: string;
  discord: string;
  show_photo: boolean;
  show_email: boolean;
  show_discord: boolean;
  position: number;
};

export const isTeam = (value: string): value is Team => TEAMS.some((t) => t.value === value);
