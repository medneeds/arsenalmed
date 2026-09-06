import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatCpf } from "@/lib/cpf";

const BUCKET = "downloads";
const MASTER_PATH = "arsenal-med-3.pdf";

/**
 * Baixa o PDF mestre, estampa e-mail + CPF do comprador no rodapé de todas as
 * páginas e grava a cópia individual no bucket privado.
 * Retorna o caminho do arquivo personalizado, ou null se não for possível gerar
 * (nesse caso o download recai no arquivo mestre).
 */
export async function generatePersonalizedPdf(params: {
  compraId: string;
  email: string;
  cpf: string | null;
}): Promise<string | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: file, error: downloadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .download(MASTER_PATH);
    if (downloadError || !file) {
      console.error("PDF mestre indisponível para personalização:", downloadError);
      return null;
    }

    const pdf = await PDFDocument.load(await file.arrayBuffer());
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    const identidade = params.cpf
      ? `Licenca pessoal e intransferivel  ·  ${params.email}  ·  CPF ${formatCpf(params.cpf)}`
      : `Licenca pessoal e intransferivel  ·  ${params.email}`;

    const size = 7;
    const color = rgb(0.42, 0.45, 0.38);

    for (const page of pdf.getPages()) {
      const { width } = page.getSize();
      const textWidth = font.widthOfTextAtSize(identidade, size);
      page.drawText(identidade, {
        x: Math.max(16, (width - textWidth) / 2),
        y: 14,
        size,
        font,
        color,
      });
    }

    const bytes = await pdf.save();
    const path = `personalizados/${params.compraId}.pdf`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: "application/pdf", upsert: true });
    if (uploadError) {
      console.error("falha ao gravar PDF personalizado:", uploadError);
      return null;
    }

    return path;
  } catch (error) {
    console.error("falha ao personalizar PDF:", error);
    return null;
  }
}
