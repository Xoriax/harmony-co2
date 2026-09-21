import { validateCover } from "./covers";

const DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

// Lit et valide le formulaire d'un événement (backoffice). Fonction pure : elle ne touche ni la base
// ni le stockage, ce qui permet de la tester seule. `error` vaut null quand tout est valide.
export function parseEventForm(formData: FormData) {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const values = {
    title: text("title"),
    description: text("description"),
    location: text("location"),
    starts_at: text("starts_at"),
    ends_at: text("ends_at"),
    published: formData.get("published") ? "on" : "",
  };

  const file = formData.get("cover");
  const cover = file instanceof File && file.size > 0 ? file : null;
  const removeCoverRequested = Boolean(formData.get("remove_cover"));

  let error: string | null = null;
  if (!values.title) error = "Le titre est obligatoire.";
  else if (values.title.length > 120) error = "Le titre ne doit pas dépasser 120 caractères.";
  else if (values.location.length > 120) error = "Le lieu ne doit pas dépasser 120 caractères.";
  else if (values.description.length > 2000)
    error = "La description ne doit pas dépasser 2000 caractères.";
  else if (!DATE_RE.test(values.starts_at)) error = "La date de début est obligatoire.";
  else if (!values.ends_at) error = "La date de fin est obligatoire.";
  else if (!DATE_RE.test(values.ends_at)) error = "La date de fin est invalide.";
  else if (values.ends_at <= values.starts_at) error = "La fin doit être après le début.";
  else if (cover) error = validateCover(cover);

  const row = {
    title: values.title,
    description: values.description,
    location: values.location,
    starts_at: `${values.starts_at}:00`,
    ends_at: `${values.ends_at}:00`,
    published: Boolean(values.published),
  };
  return { values, row, cover, removeCoverRequested, error };
}
