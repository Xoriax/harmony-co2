import { NextResponse, type NextRequest } from "next/server";
import { getBilanById, signedFileUrl } from "@/lib/bilans";
import { bilanCategoriesToCsv } from "@/lib/csv";
import { getSession } from "@/lib/session";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Équivalent, côté backoffice, de /historique/fichier/[id] : réservé aux administrateurs, sans
// filtre de propriétaire (tous les bilans, y compris ceux générés sans connexion).
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/connexion", request.url));
  if (!session.admin) return NextResponse.redirect(new URL("/", request.url));

  const { id } = await params;
  const formatParam = request.nextUrl.searchParams.get("format");
  const format = formatParam === "xlsx" || formatParam === "csv" ? formatParam : "pdf";
  const back = (notice: string) =>
    NextResponse.redirect(new URL(`/backoffice/historique?notice=${notice}`, request.url));
  if (!UUID.test(id)) return back("missing");

  const bilan = await getBilanById(id);
  if (!bilan) return back("missing");

  const day = bilan.created_at.slice(0, 10);
  // Nom de fichier fixe (comme /historique) : le nom de l'association est saisi librement et ne
  // doit pas se retrouver tel quel dans un en-tête HTTP.
  const fileName = (ext: string) => `bilan-carbone-harmony-${day}-${bilan.id.slice(0, 8)}.${ext}`;

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
        "Content-Disposition": `attachment; filename="${fileName("csv")}"`,
      },
    });
  }

  const url = await signedFileUrl(
    format === "xlsx" ? bilan.xlsx_path : bilan.pdf_path,
    fileName(format),
  );
  if (!url) return back("unavailable");

  return NextResponse.redirect(url);
}
