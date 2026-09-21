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

// Ce que la page publique a le droit d'afficher pour un membre. Un élément masqué (ou vide)
// est absent de l'objet : la carte ne peut donc rien laisser fuiter, même par erreur.
export type PublicMember = {
  id: string;
  name: string;
  role: string;
  team: Team;
  /** null : photo masquée (pas de bloc photo) ; { url: null } : photo affichée mais non renseignée. */
  photo: { url: string | null } | null;
  email: string | null;
  discord: string | null;
};

export function toPublicMember(member: MemberRow): PublicMember {
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    team: member.team,
    photo: member.show_photo ? { url: member.photo_url } : null,
    email: member.show_email && member.email ? member.email : null,
    discord: member.show_discord && member.discord ? member.discord : null,
  };
}

// Groupes dans l'ordre d'affichage ; un groupe sans membre est omis.
export function groupByTeam(members: PublicMember[]) {
  return TEAMS.map((team) => ({
    ...team,
    list: members.filter((m) => m.team === team.value),
  })).filter((group) => group.list.length > 0);
}
