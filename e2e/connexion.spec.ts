import { expect, test } from "@playwright/test";
import { admin, member, sessionCookie } from "./utils/session";

// La vraie connexion passe par Discord : on ne peut pas automatiser cet aller-retour dans les
// tests, donc on injecte directement un cookie de session signé (même format que celui posé par
// src/lib/session.ts après un vrai retour de Discord) pour tester ce que la session autorise.

test.describe("Connexion", () => {
  test("visiteur non connecté : le backoffice renvoie vers la connexion", async ({
    page,
    baseURL,
  }) => {
    await page.goto("/backoffice");
    await expect(page).toHaveURL(`${baseURL}/connexion`);
    await expect(page.getByRole("link", { name: /se connecter avec discord/i })).toBeVisible();
  });

  test("le message d'erreur Discord s'affiche depuis l'URL", async ({ page }) => {
    await page.goto("/connexion?error=not_member");
    // getByRole("alert") accroche aussi l'annonceur de route de Next (role="alert" caché) :
    // on cherche directement le texte du message.
    await expect(page.getByText("n'est pas membre du serveur")).toBeVisible();
  });

  test("membre non-admin : connecté mais pas d'accès au backoffice", async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([sessionCookie(member, baseURL!)]);

    await page.goto("/");
    await expect(page.getByText(member.name)).toBeVisible();
    await expect(page.getByRole("button", { name: "Se déconnecter" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Backoffice" })).toHaveCount(0);

    // Pas admin : écarté vers l'accueil plutôt que vers la connexion.
    await page.goto("/backoffice");
    await expect(page).toHaveURL(`${baseURL}/`);

    // Déjà connecté : la page de connexion elle-même redirige.
    await page.goto("/connexion");
    await expect(page).toHaveURL(`${baseURL}/`);
  });

  test("administrateur : accès au backoffice, puis déconnexion", async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([sessionCookie(admin, baseURL!)]);

    await page.goto("/");
    const backofficeLink = page.getByRole("link", { name: "Backoffice" });
    await expect(backofficeLink).toBeVisible();

    await backofficeLink.click();
    await expect(page).toHaveURL(`${baseURL}/backoffice`);
    await expect(page.getByRole("heading", { name: "Gérer les événements" })).toBeVisible();

    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(`${baseURL}/`);
    // "Connexion" apparaît aussi dans un bloc d'appel à l'action de l'accueil : on vérifie le
    // lien du bandeau, celui qui reflète l'état de la session.
    await expect(page.getByRole("banner").getByRole("link", { name: "Connexion" })).toBeVisible();

    // La déconnexion a bien retiré l'accès.
    await page.goto("/backoffice");
    await expect(page).toHaveURL(`${baseURL}/connexion`);
  });
});
