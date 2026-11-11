# Mis tareas · dashboard de Isa

Dashboard personal que lee y escribe directo en Notion (página privada **Mi centro de tareas**). Funciona sin Claude: Claude solo agrega prioridades, pasos, briefings y cambios propuestos en sus revisiones programadas.

## Qué hace
- Lista de tareas priorizada (entregas cercanas primero), agrupable por prioridad, área o estado.
- Pasos por tarea con casillas y anillo de avance; avance general arriba.
- Fecha de entrega propia (opcional) y recordatorios por tarea.
- Bandeja de cambios propuestos por Claude con botones de aprobar / rechazar.
- Último briefing de Claude y cambios aplicados.
- Crear tareas manuales.
- Tareas fijadas (📌) siempre arriba.
- Tarea recurrente: el día 2 de cada mes se crea «Hacer y enviar la factura de servicios a Adelanta», prioridad Alta, vence el 9, fijada (GitHub Actions → /api/recurrentes).
- Recordatorios por correo (Resend, vía GitHub Actions) cuando una entrega está cerca y no hay avance.

## Variables de entorno (Vercel → Settings → Environment Variables)
Ver `.env.example`: `NOTION_TOKEN`, `DASHBOARD_PASSWORD`, `CRON_SECRET`, `RESEND_API_KEY`, `NOTIFY_EMAIL`, `DASHBOARD_URL`.

## Secrets de GitHub (repo → Settings → Secrets and variables → Actions)
`CRON_SECRET` (el mismo de Vercel) y `DASHBOARD_URL` (la URL de Vercel, sin barra final).

## Reglas
- El dashboard escribe en las bases privadas **Mis tareas** y **Bandeja de Claude**. Única excepción: al cambiar el estado de una tarea que viene de **Tasks** del equipo (Hecha / En curso / Por hacer), refleja ese Status allá (requiere que la integración tenga acceso a Tasks). Si la tarea es compartida (más de un Assignee), no la pone en Done: solo deja un comentario de que Isa terminó su parte.
- Aprobar un cambio no lo ejecuta al instante: Claude lo aplica en su siguiente revisión (8:30 am, 1 pm y 10 pm).
