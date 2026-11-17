# Salda

Cobra por WhatsApp, sin olvidos.

App web para comercios pequeños en Venezuela: organiza deudores, ve quién debe y avisa por WhatsApp con un toque (`wa.me`). Membresía **$5/mes**.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js + Tailwind CSS
- Tema oscuro/claro (`next-themes`)
- Animaciones con Framer Motion

## Rutas

- `/` — Landing
- `/login`, `/registro` — Auth (UI)
- `/app` — Dashboard demo
- `/app/deudores`, `/app/avisos`, `/app/cuenta` — App MVP (UI + datos demo)
