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
 * A identificação é obrigatória: qualquer falha lança erro para que a entrega
 * nunca aconteça com o arquivo genérico.
 */
export async function generatePersonalizedPdf(params: {
  compraId: string;
  email: string;
  cpf: string;
  kind: ArsenalFileKind;
}): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const fileConfig = FILES[params.kind];

  if (!params.cpf || params.cpf.replace(/\D/g, "").length !== 11) {
    throw new Error(`CPF ausente ou inválido na compra ${params.compraId}: personalização bloqueada.`);
  }

  try {
    const { data: file, error: downloadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .download(fileConfig.masterPath);
    if (downloadError || !file) {
      throw new Error(`PDF mestre ${params.kind} indisponível para personalização.`);
    }

    const pdf = await PDFDocument.load(await file.arrayBuffer());
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    const identidade = `Licenca pessoal e intransferivel  ·  ${params.email}  ·  CPF ${formatCpf(params.cpf)}`;

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
      throw new Error(`falha ao gravar PDF personalizado ${params.kind}: ${uploadError.message}`);
    }

    return path;
  } catch (error) {
    console.error(`falha ao personalizar PDF ${params.kind}:`, error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}
