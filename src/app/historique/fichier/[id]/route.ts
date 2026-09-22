import { NextResponse, type NextRequest } from "next/server";
import { bilanCategoriesToCsv } from "@/lib/csv";
import { getBilan, signedFileUrl } from "@/lib/bilans";
import { getSession } from "@/lib/session";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Télécharge un fichier de l'historique : réservé à son propriétaire.
// - pdf et xlsx sont déjà stockés : redirection vers une URL signée de 60 s.
// - csv n'est pas stocké (seuls les sous-totaux par catégorie sont enregistrés) : généré à la volée.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/connexion", request.url));

  const { id } = await params;
  const formatParam = request.nextUrl.searchParams.get("format");
  const format = formatParam === "xlsx" || formatParam === "csv" ? formatParam : "pdf";
  // Un lien invalide ou le bilan de quelqu'un d'autre : retour à l'historique avec un message.
  const back = (notice: string) =>
    NextResponse.redirect(new URL(`/historique?notice=${notice}`, request.url));
  if (!UUID.test(id)) return back("missing");

  const bilan = await getBilan(id, session.id);
  if (!bilan) return back("missing");

  const day = bilan.created_at.slice(0, 10);

  if (format === "csv") {
    const csv = bilanCategoriesToCsv(
      bilan.categories.map((c) => ({
        categorie: c.name,
        sousTotal: c.subtotal,
        nombreElements: c.count,
      })),
      bilan.total,
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv;charset=utf-8",
        "Content-Disposition": `attachment; filename="bilan-carbone-harmony-${day}.csv"`,
      },
    });
  }

  const url = await signedFileUrl(
    format === "xlsx" ? bilan.xlsx_path : bilan.pdf_path,
    `bilan-carbone-harmony-${day}.${format}`,
  );
  if (!url) return back("unavailable");

  return NextResponse.redirect(url);
}
