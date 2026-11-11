import { NextResponse } from "next/server";
import { notion, DB_TAREAS, hoyCaracas } from "../../../lib/notion";

export const dynamic = "force-dynamic";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// Tareas recurrentes. Lo llama GitHub Actions el día 2 de cada mes (y es seguro llamarlo más veces: no duplica).
// Factura mensual de servicios a Adelanta: se crea el día 2, vence el día 9, prioridad Alta y fijada arriba.
export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const hoy = hoyCaracas(); // YYYY-MM-DD
    const [y, m, d] = hoy.split("-").map(Number);
    if (d < 2) return NextResponse.json({ ok: true, creada: false, motivo: "Todavía no es día 2" });

    const clave = `recurrente:factura-adelanta:${y}-${String(m).padStart(2, "0")}`;
    const existe = await notion(`/databases/${DB_TAREAS}/query`, {
      method: "POST",
      body: { filter: { property: "ID origen", rich_text: { equals: clave } }, page_size: 1 },
    });
    if (existe.results.length) return NextResponse.json({ ok: true, creada: false, motivo: "Ya existe" });

    // La factura es por el mes anterior de servicios.
    const mesServicio = m === 1 ? 12 : m - 1;
    const anioServicio = m === 1 ? y - 1 : y;
    const nombreMes = MESES[mesServicio - 1];
    const vence = `${y}-${String(m).padStart(2, "0")}-09`;

    const paso = (texto) => ({ object: "block", type: "to_do", to_do: { rich_text: [{ text: { content: texto } }], checked: false } });

    const page = await notion("/pages", {
      method: "POST",
      body: {
        parent: { database_id: DB_TAREAS },
        icon: { type: "emoji", emoji: "🧾" },
        properties: {
          Tarea: { title: [{ text: { content: `Hacer y enviar la factura de servicios a Adelanta (${nombreMes} ${anioServicio})` } }] },
          Estado: { status: { name: "Por hacer" } },
          Fuente: { select: { name: "Manual" } },
          Prioridad: { select: { name: "Alta" } },
          "Mi fecha de entrega": { date: { start: vence } },
          Recordatorios: { checkbox: true },
          Fijada: { checkbox: true },
          Orden: { number: 0 },
          "Pasos totales": { number: 3 },
          "Pasos hechos": { number: 0 },
          "ID origen": { rich_text: [{ text: { content: clave } }] },
          "Nota de Claude": { rich_text: [{ text: { content: `Tarea recurrente mensual (día 2). Factura por los servicios de ${nombreMes} ${anioServicio}; vence el 9.` } }] },
        },
        children: [
          paso(`Preparar la factura de ${nombreMes} ${anioServicio}`),
          paso("Revisar montos y datos fiscales"),
          paso("Enviar la factura a Adelanta"),
        ],
      },
    });
    return NextResponse.json({ ok: true, creada: true, id: page.id });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
