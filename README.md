# Salda

Cobra por WhatsApp, sin olvidos.

App web para comercios pequeños en Venezuela: organiza deudores, ve quién debe y envía avisos por WhatsApp.

**Planes**
- **Simple — $3/mes** · cobranza clásica · 100 avisos WA/mes
- **Streaming — $5/mes** · cuentas compartidas · 250 avisos WA/mes

## Desarrollo

```bash
npm install
cp .env.example .env.local
# Edita DATABASE_URL con tu Postgres
npm run db:push
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Base de datos (PostgreSQL)

Prisma guarda:
- Negocios (auth + plan)
- Deudores (plan Simple)
- Cuentas compartidas + miembros (plan Streaming)
- Cupo de WhatsApp por mes

En Vercel agrega `DATABASE_URL`, `AUTH_SECRET` y `CREDENTIALS_SECRET`.

## WhatsApp (demo → producción)

En desarrollo usamos **Green API** para envío automático. En producción se cambiará a **Meta Cloud API** sin reescribir el flujo de avisos.

1. Crea cuenta en [console.green-api.com](https://console.green-api.com/)
2. Crea una instancia y escanea el QR con WhatsApp
3. Copia `apiUrl`, `idInstance` y `apiTokenInstance` a `.env.local` (local) o a **Vercel → Settings → Environment Variables**

```env
WHATSAPP_PROVIDER=green-api
GREEN_API_URL=https://api.green-api.com
GREEN_API_INSTANCE_ID=...
GREEN_API_TOKEN=...
```

Sin credenciales, el botón **Enviar auto** cae a `wa.me` (manual) para no romper el demo.

Para producción futura:

```env
WHATSAPP_PROVIDER=meta
```

## Stack

- Next.js + Tailwind CSS
- Tema oscuro/claro (`next-themes`)
- Animaciones con Framer Motion
- WhatsApp: Green API (demo) / Meta (stub listo)

## Rutas

- `/` — Landing
- `/login`, `/registro` — Auth (UI)
- `/app` — Dashboard demo
- `/app/deudores`, `/app/avisos`, `/app/cuenta` — App MVP
- `POST /api/whatsapp/send` — Envío de avisos
