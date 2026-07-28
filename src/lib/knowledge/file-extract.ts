"use server";

/**
 * Extrae texto plano de un archivo subido para precargar el contenido Markdown
 * de una Knowledge Unit. No se persiste el binario original (v1): solo el
 * texto extraido, que el usuario puede editar antes de guardar.
 */
export interface ExtractedFile {
  filename: string;
  text: string;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function extractTextFromFile(
  formData: FormData
): Promise<{ success: true; data: ExtractedFile } | { success: false; error: string }> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { success: false, error: "No se recibio ningun archivo." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "El archivo supera el limite de 15MB." };
  }

  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (name.endsWith(".pdf")) {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        return { success: true, data: { filename: file.name, text: result.text.trim() } };
      } finally {
        await parser.destroy();
      }
    }

    if (name.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return { success: true, data: { filename: file.name, text: result.value.trim() } };
    }

    if (name.endsWith(".doc")) {
      return {
        success: false,
        error:
          "El formato .doc antiguo no se puede leer automaticamente. Guarda el archivo como .docx e intenta de nuevo.",
      };
    }

    if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".markdown")) {
      return { success: true, data: { filename: file.name, text: buffer.toString("utf-8").trim() } };
    }

    if (name.endsWith(".csv")) {
      return { success: true, data: { filename: file.name, text: buffer.toString("utf-8").trim() } };
    }

    return {
      success: false,
      error: "Formato no soportado. Usa PDF, DOCX, TXT, Markdown o CSV.",
    };
  } catch (error) {
    console.error("Error extrayendo texto de archivo:", error);
    return {
      success: false,
      error: "No se pudo leer el archivo. Puede estar corrupto o protegido.",
    };
  }
}
