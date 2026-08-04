import type { Metadata } from "next";
import { SimplePage, Prose, H, P } from "@/components/shared/simple-page";

export const metadata: Metadata = {
  title: "Privacy — soph.ia",
  description: "Política de privacidad de soph.ia.",
};

export default function PrivacyPage() {
  return (
    <SimplePage eyebrow="Privacy" title="Tu conocimiento es tuyo." updated="3 de agosto, 2026">
      <Prose>
        <div>
          <H>1. Qué recopilamos</H>
          <div className="mt-2">
            <P>
              Datos de cuenta (email, nombre, organización) y metadatos de uso
              necesarios para operar la plataforma. El conocimiento que construyes
              en soph.ia es tuyo y no se utiliza para entrenar modelos.
            </P>
          </div>
        </div>
        <div>
          <H>2. Qué nunca hacemos</H>
          <div className="mt-2">
            <P>
              No vendemos data. No entrenamos modelos con tu contenido. No
              compartimos nodos entre organizaciones. No exponemos tus claves de
              modelo a terceros.
            </P>
          </div>
        </div>
        <div>
          <H>3. Retención</H>
          <div className="mt-2">
            <P>
              Conservamos los datos mientras la cuenta esté activa. Al cancelar,
              puedes exportar tu grafo completo y eliminar todo tu contenido de
              forma definitiva.
            </P>
          </div>
        </div>
        <div>
          <H>4. Contacto</H>
          <div className="mt-2">
            <P>
              Para ejercer tus derechos de acceso, rectificación o supresión,
              escribe a privacy@soph.ia. Respondemos en un máximo de 30 días.
            </P>
          </div>
        </div>
      </Prose>
    </SimplePage>
  );
}