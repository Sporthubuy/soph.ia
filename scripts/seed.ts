#!/usr/bin/env npx tsx
/**
 * Seed script para SOPH.IA — SportHub
 * Crea organizacion, dominios, KUs, dependencias, y agente de prueba.
 *
 * Uso: npx tsx scripts/seed.ts
 *
 * Requiere .env.local con SUPABASE_SERVICE_ROLE_KEY y NEXT_PUBLIC_SUPABASE_URL.
 * El usuario hola@sporthub.com.uy debe existir en Supabase Auth.
 */

import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import * as dotenv from "dotenv";
import { resolve } from "node:path";

// Load .env.local
const envPath = resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const hash = (title: string, content: string): string =>
  createHash("sha256").update(`${title}\n${content}`).digest("hex").slice(0, 12);

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const MAIN_EMAIL = "hola@sporthub.com.uy";

async function main() {
  console.log("🌱 Sembrando datos de SportHub para SOPH.IA...\n");

  // ─── 1. Find user ──────────────────────────────────────
  const { data: profiles, error: profileErr } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", MAIN_EMAIL)
    .limit(1);

  if (profileErr || !profiles || profiles.length === 0) {
    console.error(`❌ No se encontro el perfil para ${MAIN_EMAIL}. ¿Ya te registraste?`);
    process.exit(1);
  }

  const userId = profiles[0].id;
  console.log(`✅ Usuario encontrado: ${profiles[0].email} (${userId.slice(0, 8)}...)`);

  // ─── 2. Create organization ────────────────────────────
  const { data: existingOrg } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", "sporthub")
    .limit(1);

  let orgId: string;
  if (existingOrg && existingOrg.length > 0) {
    orgId = existingOrg[0].id;
    console.log("ℹ️  Organizacion SportHub ya existe, usando existente.");
  } else {
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .insert({ name: "SportHub", slug: "sporthub" })
      .select()
      .single();

    if (orgErr) {
      console.error("❌ Error creando organizacion:", orgErr.message);
      process.exit(1);
    }
    orgId = org.id;
    console.log("✅ Organizacion SportHub creada.");
  }

  // ─── 3. Create membership ──────────────────────────────
  const { data: existingMembership } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", userId)
    .eq("organization_id", orgId)
    .limit(1);

  if (!existingMembership || existingMembership.length === 0) {
    const { error: memberErr } = await supabase.from("memberships").insert({
      user_id: userId,
      organization_id: orgId,
      role: "owner",
    });
    if (memberErr) {
      console.error("❌ Error creando membresia:", memberErr.message);
      process.exit(1);
    }
    console.log("✅ Membresia owner creada.");
  } else {
    console.log("ℹ️  Membresia ya existe.");
  }

  // ─── 4. Create domains ─────────────────────────────────
  const domainDefs = [
    { name: "General", ownerId: userId },
    { name: "Marketing", ownerId: userId, parentName: null },
    { name: "Ventas", ownerId: userId },
    { name: "Legal", ownerId: userId },
    { name: "Operaciones", ownerId: userId },
    { name: "Producto", ownerId: userId },
  ];

  const domainIds: Record<string, string> = {};
  for (const d of domainDefs) {
    const { data: existing } = await supabase
      .from("domains")
      .select("id")
      .eq("organization_id", orgId)
      .eq("name", d.name)
      .limit(1);

    if (existing && existing.length > 0) {
      domainIds[d.name] = existing[0].id;
    } else {
      const { data: domain, error: dErr } = await supabase
        .from("domains")
        .insert({
          organization_id: orgId,
          name: d.name,
          owner_id: d.ownerId,
        })
        .select()
        .single();
      if (dErr) {
        console.error(`❌ Error creando dominio ${d.name}:`, dErr.message);
      } else {
        domainIds[d.name] = domain.id;
      }
    }
  }
  console.log(`✅ ${Object.keys(domainIds).length} dominios listos.`);

  // ─── 5. Create Knowledge Units ─────────────────────────
  const kus = [
    {
      title: "Politica de devoluciones",
      domain: "Legal",
      status: "approved",
      trust_score: 92,
      content: `# Politica de Devoluciones

## Plazo
Los clientes tienen **30 dias** desde la fecha de compra para solicitar una devolucion.

## Condiciones
- El producto debe estar en su empaque original.
- No se aceptan devoluciones de productos personalizados.
- Se requiere comprobante de compra.

## Proceso
1. El cliente inicia la solicitud via email o formulario web.
2. El equipo de soporte evalua en un plazo maximo de 48h.
3. Si se aprueba, se genera una etiqueta de envio prepaga.
4. El reembolso se procesa en 5 dias habiles tras recibir el producto.

## Excepciones
- Productos de higiene personal
- Gift cards
- Articulos en promocion final`,
    },
    {
      title: "Guia de tono de marca",
      domain: "Marketing",
      status: "approved",
      trust_score: 85,
      content: `# Guia de Tono de Marca — SportHub

## Personalidad
Cercana, motivadora, inclusiva. Somos el amigo que te impulsa a moverte.

## Pilares
1. **Empoderamiento** — Nunca decimos "tenes que", decimos "podes".
2. **Inclusion** — Todos los cuerpos, todas las edades, todos los niveles.
3. **Precision** — Datos reales, no humo.

## Palabras clave
Activarse, comunidad, movimiento, bienestar, constancia, disfrute.

## Lo que NUNCA decimos
- Terminos negativos sobre el cuerpo
- Comparaciones con otras personas
- Promesas milagrosas`,
    },
    {
      title: "Proceso de onboarding de clientes",
      domain: "Operaciones",
      status: "approved",
      trust_score: 78,
      content: `# Onboarding de Clientes

## Fase 1 — Bienvenida (Dia 0)
- Email automatico con guia de primeros pasos.
- Acceso a la plataforma sin restricciones por 7 dias (trial).

## Fase 2 — Primer contacto (Dia 1)
- Llamada de bienvenida de un coach asignado.
- Definir objetivo principal del cliente.

## Fase 3 — Seguimiento (Dia 3 y Dia 7)
- Check-in por chat.
- Propuesta de rutina personalizada.

## Fase 4 — Conversion (Dia 6)
- Email con oferta especial para membresia premium.
- Descuento del 20% si activa antes del dia 7.`,
    },
    {
      title: "Precios y planes 2026",
      domain: "Ventas",
      status: "approved",
      trust_score: 90,
      content: `# Planes y Precios 2026

| Plan | Precio/mes | Sesiones | Features |
|------|-----------|----------|----------|
| Free | $0 | 3 | Acceso basico, 1 disciplina |
| Starter | $19 | 8 | 3 disciplinas, metricas basicas |
| Pro | $39 | Ilimitado | Todas las disciplinas, coach asignado, reportes |
| Enterprise | $99 | Ilimitado | Multi-sede, API, dashboard admin, branding |

## Politica de aumentos
- Se notifica con 30 dias de anticipacion.
- Los clientes activos mantienen su precio por 12 meses desde la contratacion.`,
    },
    {
      title: "Checklist de seguridad informatica",
      domain: "Operaciones",
      status: "draft",
      trust_score: 60,
      content: `# Checklist de Seguridad

## Diario
- [ ] Monitorear logs de acceso
- [ ] Verificar backups automaticos

## Semanal
- [ ] Rotar claves de API internas
- [ ] Revisar intentos fallidos de login

## Mensual
- [ ] Auditoria de permisos de usuarios
- [ ] Scan de vulnerabilidades
- [ ] Capacitacion al equipo`,
    },
    {
      title: "Terminos y condiciones de uso",
      domain: "Legal",
      status: "approved",
      trust_score: 95,
      content: `# Terminos y Condiciones de Uso

## 1. Aceptacion
Al usar SportHub, aceptas estos terminos en su totalidad.

## 2. Cuentas
Eres responsable de la seguridad de tu cuenta y contrasena.

## 3. Privacidad
Tus datos personales se rigen por nuestra Politica de Privacidad.

## 4. Uso aceptable
No utilizar la plataforma para:
- Actividades ilegales
- Spam o acoso
- Violacion de derechos de propiedad intelectual

## 5. Cancelacion
Puedes cancelar en cualquier momento. Los cargos ya facturados no son reembolsables (ver Politica de Devoluciones para excepciones).

## 6. Jurisdiccion
Legislacion aplicable de Uruguay.`,
    },
    {
      title: "Estrategia de contenidos Q3 2026",
      domain: "Marketing",
      status: "draft",
      trust_score: 55,
      content: `# Estrategia de Contenidos Q3 2026

## Canales
- Instagram (3 posts/semana)
- TikTok (5 videos/semana)
- YouTube (1 video/semana)
- Blog (2 articulos/semana)
- Newsletter (1 envio/semana)

## Temas del trimestre
- Julio: Nutricion deportiva basica
- Agosto: Entrenamiento en casa
- Septiembre: Preparacion para maratones

## KPIs
- Engagement rate > 4%
- CTR newsletter > 12%
- Crecimiento seguidores > 8% mensual`,
    },
    {
      title: "Protocolo de atencion al cliente",
      domain: "Operaciones",
      status: "approved",
      trust_score: 82,
      content: `# Protocolo de Atencion al Cliente

## Tiempos de respuesta
- Chat en vivo: < 3 minutos
- Email: < 4 horas habiles
- Telefono: atencion inmediata en horario 9-18

## Escalado
1. Agente de primera linea
2. Supervisor de turno
3. Gerente de operaciones
4. CEO (solo casos criticos)

## Quejas formales
- Se registran en el sistema de tickets.
- El cliente recibe un numero de seguimiento.
- Respuesta inicial en < 24h.
- Cierre definitivo en < 5 dias habiles.

## Politica de compensacion
- Error nuestro: 1 mes gratis.
- Inconveniente grave: descuento 50% por 3 meses.`,
    },
    {
      title: "Guia de contratacion de coaches",
      domain: "Producto",
      status: "proposed",
      trust_score: 65,
      content: `# Guia de Contratacion de Coaches

## Perfil buscado
- Certificacion profesional en educacion fisica, nutricion o afines.
- Experiencia minima de 3 años dando clases.
- Disponibilidad minima de 10h semanales.
- Excelente comunicacion verbal y escrita.

## Proceso de seleccion
1. Screening de CV (RRHH, 3 dias)
2. Entrevista tecnica con Head Coach
3. Clase demo evaluada por panel
4. Entrevista cultural con CEO
5. Oferta

## Compensacion
- Clase individual: $500/h
- Clase grupal (hasta 15): $800/h
- Clase grupal (15+): $1200/h
- Bonus trimestral por retention > 80%

### Cambios propuestos para 2026 Q4 (pendiente de aprobacion)
- Aumentar piso de $500/h a $600/h para coaches con >2 años de antiguedad.
- Agregar beneficio de capacitacion paga (hasta $2000/año).`,
    },
    {
      title: "Politica de privacidad de datos",
      domain: "Legal",
      status: "approved",
      trust_score: 93,
      content: `# Politica de Privacidad

## Datos que recolectamos
- Nombre, email, fecha de nacimiento
- Metricas de actividad fisica (opcional)
- Datos de pago (procesados por Stripe, no almacenados)

## Uso de datos
- Personalizar rutinas y recomendaciones
- Mejorar la plataforma
- Comunicaciones de marketing (con consentimiento)

## Comparticion
- Nunca vendemos datos personales.
- Compartimos datos anonimizados con fines estadisticos.
- Datos de pago nunca se comparten.

## Derechos del usuario
- Acceso a sus datos
- Rectificacion
- Eliminacion (derecho al olvido)
- Portabilidad`,
    },
    {
      title: "Roadmap de producto 2026-2027",
      domain: "Producto",
      status: "draft",
      trust_score: 50,
      content: `# Roadmap de Producto

## Q3 2026
- [x] App movil con tracking GPS
- [x] Dashboard de progreso personal
- [ ] Integracion con Apple Health y Google Fit
- [ ] Planes de nutricion personalizados (IA)

## Q4 2026
- [ ] Clases en vivo con chat
- [ ] Comunidad (foros, desafios grupales)
- [ ] E-commerce de equipamiento deportivo

## Q1 2027
- [ ] Analisis de video con IA (correccion de postura)
- [ ] Wearables integration (relojes, bandas)
- [ ] API publica para integraciones enterprise`,
    },
    {
      title: "Manual de identidad visual",
      domain: "Marketing",
      status: "proposed",
      trust_score: 70,
      content: `# Manual de Identidad Visual — SportHub

## Colores primarios
- **Naranja SportHub**: #FF6B35
- **Negro**: #1A1A1A
- **Blanco**: #FFFFFF

## Colores secundarios
- Verde menta: #00B4A6
- Gris claro: #F5F5F5
- Amarillo energia: #FFD23F

## Tipografia
- **Titulos**: Montserrat Bold
- **Cuerpo**: Inter Regular
- **Datos**: JetBrains Mono

## Logo
- Uso preferente: full color sobre fondo blanco.
- Version monocromatica disponible para fondos oscuros.
- Area de respeto: minimo 2x la altura de la "S" alrededor del logo.

## NO hacer
- Estirar, rotar ni deformar el logo
- Cambiar los colores del logo
- Usar versiones de baja resolucion

### Propuesta de actualizacion (pendiente)
- Agregar version animada del logo para web y app.
- Nuevo sistema de iconos personalizados.`,
    },
  ];

  const kuIds: Record<string, string> = {};
  for (const ku of kus) {
    const domainId = domainIds[ku.domain];
    if (!domainId) {
      console.warn(`⚠️  Dominio "${ku.domain}" no encontrado, saltando KU: ${ku.title}`);
      continue;
    }

    const kuHash = hash(ku.title, ku.content);

    // Check if it already exists
    const { data: existing } = await supabase
      .from("knowledge_units")
      .select("id")
      .eq("title", ku.title)
      .eq("organization_id", orgId)
      .limit(1);

    let kuId: string;
    if (existing && existing.length > 0) {
      kuId = existing[0].id;
      console.log(`ℹ️  KU "${ku.title}" ya existe.`);
    } else {
      const { data: newKu, error: kuErr } = await supabase
        .from("knowledge_units")
        .insert({
          hash: kuHash,
          version: 1,
          domain_id: domainId,
          owner_id: userId,
          organization_id: orgId,
          title: ku.title,
          content: ku.content,
          trust_score: ku.trust_score,
          status: ku.status,
        })
        .select()
        .single();

      if (kuErr) {
        console.error(`❌ Error creando KU "${ku.title}":`, kuErr.message);
        continue;
      }
      kuId = newKu.id;

      // Create initial version
      await supabase.from("ku_versions").insert({
        ku_id: kuId,
        version: 1,
        hash: kuHash,
        title: ku.title,
        content: ku.content,
        changed_by: userId,
        change_message: "Creacion inicial",
      });
    }

    kuIds[ku.title] = kuId;
  }
  console.log(`✅ ${Object.keys(kuIds).length} Knowledge Units listas.`);

  // ─── 6. Create dependencies ────────────────────────────
  const dependencyPairs: [string, string][] = [
    ["Politica de devoluciones", "Precios y planes 2026"],
    ["Terminos y condiciones de uso", "Politica de devoluciones"],
    ["Terminos y condiciones de uso", "Politica de privacidad de datos"],
    ["Protocolo de atencion al cliente", "Politica de devoluciones"],
    ["Guia de contratacion de coaches", "Precios y planes 2026"],
    ["Manual de identidad visual", "Guia de tono de marca"],
    ["Estrategia de contenidos Q3 2026", "Guia de tono de marca"],
    ["Roadmap de producto 2026-2027", "Precios y planes 2026"],
    ["Proceso de onboarding de clientes", "Protocolo de atencion al cliente"],
    ["Guia de tono de marca", "Manual de identidad visual"],
  ];

  let depCount = 0;
  for (const [source, target] of dependencyPairs) {
    const sourceId = kuIds[source];
    const targetId = kuIds[target];
    if (!sourceId || !targetId) continue;

    const { error: depErr } = await supabase.from("ku_dependencies").upsert(
      { source_ku_id: sourceId, target_ku_id: targetId },
      { onConflict: "source_ku_id, target_ku_id", ignoreDuplicates: true }
    );

    if (!depErr) depCount++;
  }
  console.log(`✅ ${depCount} dependencias creadas.`);

  // ─── 7. Approve certain KUs (update status/approved_by) ──
  const allKuIds = Object.values(kuIds);
  const approvedKuIds = kus
    .filter((k) => k.status === "approved")
    .map((k) => kuIds[k.title])
    .filter(Boolean);

  // ─── 8. Create a deployed agent ────────────────────────
  const { data: existingAgent } = await supabase
    .from("agents")
    .select("id")
    .eq("organization_id", orgId)
    .eq("name", "Asistente de Soporte SportHub")
    .limit(1);

  let agentId: string;
  if (existingAgent && existingAgent.length > 0) {
    agentId = existingAgent[0].id;
    console.log("ℹ️  Agente 'Asistente de Soporte SportHub' ya existe.");
  } else {
    const { data: agent, error: agentErr } = await supabase
      .from("agents")
      .insert({
        organization_id: orgId,
        name: "Asistente de Soporte SportHub",
        description:
          "Agente entrenado con politicas de devoluciones, terminos y condiciones, atencion al cliente y precios. Responde consultas frecuentes de clientes.",
        system_prompt:
          "Eres el asistente de soporte de SportHub, una plataforma de bienestar y actividad fisica. Responde consultas de clientes usando las politicas oficiales. Cita el nombre de la politica cuando corresponda. Si no tenes informacion, deriva al equipo humano.",
        provider: "anthropic",
        model: "claude-3-5-sonnet-latest",
        temperature: 0.4,
        selected_ku_ids: approvedKuIds,
        status: "deployed",
        visibility: "public",
        tags: ["soporte", "politicas", "faq"],
        created_by: userId,
      })
      .select()
      .single();

    if (agentErr) {
      console.error("❌ Error creando agente:", agentErr.message);
    } else {
      agentId = agent.id;
      console.log("✅ Agente 'Asistente de Soporte SportHub' creado y desplegado.");
    }
  }

  // ─── 9. Mark some KUs as proposed for review testing ───
  const proposedTitles = ["Guia de contratacion de coaches", "Manual de identidad visual"];
  for (const title of proposedTitles) {
    const kuId = kuIds[title];
    if (kuId) {
      await supabase
        .from("knowledge_units")
        .update({ status: "proposed" })
        .eq("id", kuId);
    }
  }

  console.log("\n🎉 Seed completo!");
  console.log(`   Organizacion:  SportHub (${orgId.slice(0, 8)}...)`);
  console.log(`   KUs:           ${Object.keys(kuIds).length}`);
  console.log(`   Dominios:      ${Object.keys(domainIds).length}`);
  console.log(`   Dependencias:  ${depCount}`);
  console.log(`   Agente:        Asistente de Soporte SportHub`);
  console.log(`   KUs pendientes: ${proposedTitles.length} (para probar Review Center)`);
  console.log(`\n👉 Anda a http://localhost:3000/graph para ver todo.`);
}

main().catch(console.error);
