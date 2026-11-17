import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Table2,
  UserPlus,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { ProductMock } from "@/components/landing/product-mock";
import { Reveal } from "@/components/landing/reveal";
import { PLAN_LIST } from "@/lib/plans";

const steps = [
  {
    icon: UserPlus,
    title: "Registra al cliente",
    text: "Nombre, servicio, teléfono y fecha de vencimiento. Listo en segundos.",
  },
  {
    icon: Table2,
    title: "Ve quién debe",
    text: "Tabla clara con estados: debe, por vencer o al día.",
  },
  {
    icon: Bell,
    title: "Alertas para ti",
    text: "Entras y sabes al instante a quién te falta cobrar.",
  },
  {
    icon: MessageCircle,
    title: "Avisa por WhatsApp",
    text: "Un toque abre el chat con el mensaje de cobro ya escrito.",
  },
];

const pains = [
  {
    title: "No sabes quién debe",
    text: "La lista vive en notas, Excel o la cabeza. Se pierde plata.",
  },
  {
    title: "Se te olvidan los vencimientos",
    text: "Pasa el día y nadie avisa. El cliente tampoco recuerda.",
  },
  {
    title: "Dar seguimiento es un caos",
    text: "Escribir uno por uno cansa. Sin control, no cobras a tiempo.",
  },
];

const features = [
  {
    title: "Dashboard de control",
    text: "En 5 segundos ves vencidos, urgentes y pendientes de avisar.",
  },
  {
    title: "Estados que se entienden",
    text: "Rojo debe, ámbar por vencer, teal al día. Sin adivinar.",
  },
  {
    title: "WhatsApp en 1 toque",
    text: "Salda arma el mensaje; tú solo confirmas el envío.",
  },
  {
    title: "Hecho para Venezuela",
    text: "Para negocios chicos y particulares con lista de deudores.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-mesh" />
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="grain pointer-events-none absolute inset-0" />

      <Navbar />

      <main className="relative">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-28 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:pb-28 lg:pt-32">
          <div>
            <p className="animate-rise mb-5 inline-flex items-center gap-2 rounded-full border border-card-border bg-card/70 px-3 py-1 text-xs font-medium text-muted backdrop-blur">
              <Zap className="h-3.5 w-3.5 text-accent" />
              Cobranza simple para negocios pequeños
            </p>
            <h1 className="animate-rise-delay-1 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Cobra por WhatsApp,{" "}
              <span className="text-accent">sin olvidos</span>
            </h1>
            <p className="animate-rise-delay-2 mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Salda organiza a tus clientes, te muestra quién debe y avisa por
              WhatsApp. Cobranza simple desde $3/mes o cuentas compartidas (streaming) desde $5/mes.
            </p>
            <div className="animate-rise-delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/registro"
                className="btn-shimmer inline-flex items-center justify-center rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-fg shadow-[0_12px_40px_-16px_var(--glow)] transition hover:brightness-110"
              >
                Empezar desde $3/mes
              </Link>
              <a
                href="#producto"
                className="inline-flex items-center justify-center rounded-full border border-card-border bg-card/50 px-6 py-3.5 text-sm font-medium transition hover:border-accent/40"
              >
                Ver cómo se ve
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Sin API cara al inicio
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Listo en el celular y en PC
              </span>
            </div>
          </div>

          <div className="animate-rise-delay-2">
            <ProductMock />
          </div>
        </section>

        {/* Problem */}
        <section id="problema" className="scroll-mt-24 border-y border-card-border bg-surface/40 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
                El problema
              </p>
              <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Si no tienes control, dejas plata en la mesa
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {pains.map((pain, i) => (
                <Reveal key={pain.title} delay={i * 0.08}>
                  <article className="h-full rounded-3xl border border-card-border bg-card p-6">
                    <div className="mb-4 h-1.5 w-10 rounded-full bg-accent" />
                    <h3 className="font-display text-xl font-semibold">{pain.title}</h3>
                    <p className="mt-2 text-muted leading-relaxed">{pain.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="como" className="scroll-mt-24 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
                Cómo funciona
              </p>
              <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Cuatro pasos. Sin drama.
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <Reveal key={step.title} delay={i * 0.06}>
                  <article className="relative h-full rounded-3xl border border-card-border bg-card/80 p-5">
                    <span className="font-display text-4xl font-semibold text-accent/25">
                      0{i + 1}
                    </span>
                    <step.icon className="mt-4 h-5 w-5 text-accent" />
                    <h3 className="mt-3 font-display text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Product tour */}
        <section id="producto" className="scroll-mt-24 border-y border-card-border bg-surface/40 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <Reveal>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
                  El producto
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Control profesional de cobros, sin pagar de más
                </h2>
                <p className="mt-4 text-muted leading-relaxed">
                  Diseñada para el comercio que vive en WhatsApp: ves tu cartera,
                  priorizas cobros y avisas sin reescribir el mismo mensaje veinte veces.
                </p>
                <ul className="mt-6 space-y-3">
                  {features.map((feature) => (
                    <li key={feature.title} className="flex gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                      <div>
                        <p className="font-medium">{feature.title}</p>
                        <p className="text-sm text-muted">{feature.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="rounded-[2rem] border border-card-border bg-card p-4 sm:p-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { k: "Vencidos", v: "8", c: "text-danger" },
                      { k: "Sin avisar", v: "5", c: "text-warning" },
                      { k: "Cobrados este mes", v: "34", c: "text-success" },
                      { k: "Desde", v: "$3", c: "text-accent" },
                    ].map((stat) => (
                      <div
                        key={stat.k}
                        className="rounded-2xl border border-card-border bg-background/50 p-4"
                      >
                        <p className="text-xs uppercase tracking-wider text-muted">{stat.k}</p>
                        <p className={`mt-1 font-display text-3xl font-semibold ${stat.c}`}>
                          {stat.v}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl border border-dashed border-accent/40 bg-accent-soft p-4">
                    <p className="text-sm font-medium">Mensaje listo para WhatsApp</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      “Hola María, te recordamos tu pago de $12 por Streaming,
                      vencido hoy. ¿Me confirmas cuando puedas?”
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Modes */}
        <section className="border-y border-card-border bg-surface/40 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
                Dos modos
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Simple o Streaming: elige cómo cobras
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <Reveal>
                <article className="h-full rounded-3xl border border-card-border bg-card p-6">
                  <p className="text-sm font-medium text-accent">Simple · $3/mes</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold">Cobranza clásica</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">
                    Clientes, vencimientos y avisos WhatsApp. Ideal si no manejas cuentas compartidas.
                  </p>
                </article>
              </Reveal>
              <Reveal delay={0.08}>
                <article className="h-full rounded-3xl border border-accent/40 bg-card p-6">
                  <p className="text-sm font-medium text-accent">Streaming · $5/mes</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold">Cuentas compartidas</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">
                    Una cuenta Netflix/Spotify para varias personas. Si alguien no paga, cambias la clave
                    y avisas solo a los que están al día.
                  </p>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="precio" className="scroll-mt-24 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
                Precio
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Dos planes. Topes claros de WhatsApp.
              </h2>
              <p className="mt-3 text-muted">
                Así no se come el margen si un comercio manda demasiados avisos.
              </p>
            </Reveal>

            <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
              {PLAN_LIST.map((plan, i) => (
                <Reveal key={plan.id} delay={i * 0.08}>
                  <div
                    className={`relative h-full overflow-hidden rounded-[2rem] border bg-card p-7 ${
                      plan.highlighted
                        ? "border-accent/50 shadow-[0_30px_80px_-48px_var(--glow)]"
                        : "border-card-border"
                    }`}
                  >
                    {plan.highlighted ? (
                      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
                    ) : null}
                    <div className="relative">
                      <p className="text-sm font-medium text-accent">{plan.tagline}</p>
                      <h3 className="mt-2 font-display text-2xl font-semibold">{plan.name}</h3>
                      <div className="mt-3 flex items-end gap-1">
                        <span className="font-display text-5xl font-semibold">
                          ${plan.price}
                        </span>
                        <span className="mb-1.5 text-muted">/ mes</span>
                      </div>
                      <p className="mt-2 text-sm text-muted">{plan.description}</p>
                      <ul className="mt-6 space-y-3 text-sm">
                        {plan.features.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/registro?plan=${plan.id}`}
                        className="btn-shimmer mt-8 inline-flex w-full items-center justify-center rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-fg transition hover:brightness-110"
                      >
                        Elegir {plan.name}
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <div className="overflow-hidden rounded-[2rem] border border-card-border bg-primary px-6 py-12 text-primary-fg sm:px-10">
                <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                  <div>
                    <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                      Empieza a saldar lo pendiente
                    </h2>
                    <p className="mt-3 max-w-xl text-primary-fg/75">
                      Registra tus deudores hoy y cobra con orden. WhatsApp ya lo
                      usan todos: Salda te ayuda a usarlo para cobrar.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                    <Link
                      href="/registro"
                      className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-fg"
                    >
                      Empezar ahora
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center rounded-full border border-primary-fg/20 px-6 py-3.5 text-sm font-medium"
                    >
                      Ya tengo cuenta
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-card-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            <span className="font-display font-semibold text-foreground">Salda</span>
            {" — "}Cobra por WhatsApp, sin olvidos.
          </p>
          <p>Hecho para comercios pequeños en Venezuela.</p>
        </div>
      </footer>
    </div>
  );
}
