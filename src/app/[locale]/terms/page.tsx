import type { Metadata } from "next";
import { SimplePage, Prose, H, P } from "@/components/shared/simple-page";

export const metadata: Metadata = {
  title: "Terms — soph.ia",
  description: "Términos de uso de soph.ia.",
};

export default function TermsPage() {
  return (
    <SimplePage eyebrow="Terms" title="Términos de uso." updated="3 de agosto, 2026">
      <Prose>
        <div>
          <H>1. La cuenta</H>
          <div className="mt-2">
            <P>
              Al crear una cuenta aceptas estos términos. Eres responsable de la
              actividad que ocurra bajo tu cuenta y de mantener tus credenciales
              seguras.
            </P>
          </div>
        </div>
        <div>
          <H>2. Tu contenido</H>
          <div className="mt-2">
            <P>
              El conocimiento que publicas, versionas y compilas te pertenece.
              soph.ia otorga una licencia limitada para operar la plataforma, no
              para apropiarse de tu contenido.
            </P>
          </div>
        </div>
        <div>
          <H>3. Uso aceptable</H>
          <div className="mt-2">
            <P>
              No uses la plataforma para infringir derechos de terceros, para
              distribuir contenido ilícito o para intentar acceder a datos de
              otras organizaciones. El RLS es una garantía técnica, no una
              invitación a probarlo.
            </P>
          </div>
        </div>
        <div>
          <H>4. Planes y cancelación</H>
          <div className="mt-2">
            <P>
              Puedes cancelar en cualquier momento. Los planes pagos se facturan
              por adelantado y no son reembolsables salvo que la ley disponga lo
              contrario. Al cancelar conservas acceso de exportación durante 30
              días.
            </P>
          </div>
        </div>
        <div>
          <H>5. Limitación de responsabilidad</H>
          <div className="mt-2">
            <P>
              soph.ia se ofrece &quot;tal cual&quot;. No garantizamos disponibilidad
              ininterrumpida ni resultados específicos de los agentes compilados.
              La plataforma administra conocimiento; las decisiones son tuyas.
            </P>
          </div>
        </div>
      </Prose>
    </SimplePage>
  );
}