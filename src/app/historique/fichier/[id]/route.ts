import { NextResponse, type NextRequest } from "next/server";
import { getBilan, signedFileUrl } from "@/lib/bilans";
import { getSession } from "@/lib/session";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Télécharge un fichier de l'historique : réservé à son propriétaire, via une URL signée de 60 s.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/connexion", request.url));

  const { id } = await params;
  const format = request.nextUrl.searchParams.get("format") === "xlsx" ? "xlsx" : "pdf";
  // Un lien invalide ou le bilan de quelqu'un d'autre : retour à l'historique avec un message.
  const back = (notice: string) =>
    NextResponse.redirect(new URL(`/historique?notice=${notice}`, request.url));
  if (!UUID.test(id)) return back("missing");

  const bilan = await getBilan(id, session.id);
  if (!bilan) return back("missing");

  const day = bilan.created_at.slice(0, 10);
  const url = await signedFileUrl(
    format === "xlsx" ? bilan.xlsx_path : bilan.pdf_path,
    `bilan-carbone-harmony-${day}.${format}`,
  );
  if (!url) return back("unavailable");

  return NextResponse.redirect(url);
}
