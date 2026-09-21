import { validateCover } from "./covers";
import { isTeam } from "./mandat-format";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Lit et valide le formulaire d'un membre du mandat (backoffice). Fonction pure, testable seule.
// `position` vaut null quand le champ est vide (le serveur choisit alors la dernière place du groupe).
export function parseMemberForm(formData: FormData) {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const flag = (key: string) => (formData.get(key) ? "on" : "");
  const values = {
    name: text("name"),
    role: text("role"),
    team: text("team"),
    email: text("email"),
    discord: text("discord"),
    position: text("position"),
    show_photo: flag("show_photo"),
    show_email: flag("show_email"),
    show_discord: flag("show_discord"),
  };

  const file = formData.get("photo");
  const photo = file instanceof File && file.size > 0 ? file : null;
  const removePhoto = Boolean(formData.get("remove_photo"));
  const position = values.position === "" ? null : Number(values.position);

  let error: string | null = null;
  if (!values.name) error = "Le nom est obligatoire.";
  else if (values.name.length > 80) error = "Le nom ne doit pas dépasser 80 caractères.";
  else if (!values.role) error = "Le poste est obligatoire.";
  else if (values.role.length > 80) error = "Le poste ne doit pas dépasser 80 caractères.";
  else if (!isTeam(values.team)) error = "Choisis un groupe.";
  else if (values.email && (values.email.length > 120 || !EMAIL_RE.test(values.email)))
    error = "L'adresse e-mail est invalide.";
  else if (values.discord.length > 60) error = "Le Discord ne doit pas dépasser 60 caractères.";
  else if (position !== null && (!Number.isInteger(position) || position < 0 || position > 9999))
    error = "L'ordre doit être un nombre entier positif.";
  else if (photo) error = validateCover(photo);

  const row = {
    name: values.name,
    role: values.role,
    team: values.team,
    email: values.email,
    discord: values.discord,
    show_photo: Boolean(values.show_photo),
    show_email: Boolean(values.show_email),
    show_discord: Boolean(values.show_discord),
  };
  return { values, row, position, photo, removePhoto, error };
}
