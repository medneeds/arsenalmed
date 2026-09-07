import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatCpf } from "@/lib/cpf";

const BUCKET = "downloads";

export type ArsenalFileKind = "manual" | "catalogo";

const FILES: Record<ArsenalFileKind, { masterPath: string; outputName: string }> = {
  manual: {
    masterPath: "arsenal-med-3.pdf",
    outputName: "arsenal-med-3",
  },
  catalogo: {
    masterPath: "arsenal-med-catalogo.pdf",
    outputName: "arsenal-med-catalogo",
  },
};

/**
 * Personaliza um dos volumes pagos com e-mail + CPF no rodapé de todas as páginas.
 * Retorna o caminho privado da cópia individual ou null quando o mestre ainda não
 * estiver disponível. O chamador decide se deve usar o mestre como fallback.
 */
export async function generatePersonalizedPdf(params: {
  compraId: string;
  email: string;
  cpf: string | null;
  kind: ArsenalFileKind;
}): Promise<string | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const fileConfig = FILES[params.kind];

    const { data: file, error: downloadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .download(fileConfig.masterPath);
    if (downloadError || !file) {
      console.error(`PDF mestre ${params.kind} indisponível para personalização:`, downloadError);
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
    const path = `personalizados/${params.compraId}/${fileConfig.outputName}.pdf`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: "application/pdf", upsert: true });
    if (uploadError) {
      console.error(`falha ao gravar PDF personalizado ${params.kind}:`, uploadError);
      return null;
    }

    return path;
  } catch (error) {
    console.error(`falha ao personalizar PDF ${params.kind}:`, error);
    return null;
  }
}
