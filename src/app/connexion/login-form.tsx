"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="flex w-full max-w-xs flex-col gap-4">
      <input
        name="user"
        type="text"
        placeholder="Utilisateur"
        autoComplete="username"
        required
        className="h-12 rounded-full border border-black/[.15] bg-transparent px-5 dark:border-white/[.25]"
      />
      <input
        name="password"
        type="password"
        placeholder="Mot de passe"
        autoComplete="current-password"
        required
        className="h-12 rounded-full border border-black/[.15] bg-transparent px-5 dark:border-white/[.25]"
      />
      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full bg-foreground px-5 font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {pending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
