import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description:
    "La página que buscas no existe o fue movida. Volvé al inicio de iJac IT Solutions.",
};

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-[78svh] items-center overflow-hidden bg-black px-4 pb-16 pt-28 text-white sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_22%,rgba(14,165,233,0.16),transparent_34%),radial-gradient(circle_at_82%_70%,rgba(6,182,212,0.1),transparent_30%),linear-gradient(to_bottom,#050505,#000)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />

      <section
        aria-labelledby="not-found-title"
        className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-950/80 shadow-[0_32px_120px_rgba(0,0,0,0.65)] backdrop-blur-sm lg:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="relative flex min-h-64 items-center justify-center overflow-hidden border-b border-white/10 p-8 sm:min-h-80 lg:min-h-[30rem] lg:border-b-0 lg:border-r">
          <div
            aria-hidden="true"
            className="absolute left-6 top-6 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-cyan-300/70"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.8)]" />
            Error de ruta
          </div>

          <p
            aria-hidden="true"
            className="font-heading text-[clamp(7rem,28vw,16rem)] font-bold leading-none tracking-[-0.09em] text-transparent [-webkit-text-stroke:1px_rgba(103,232,249,0.45)]"
          >
            404
          </p>

          <div
            aria-hidden="true"
            className="absolute bottom-6 left-6 right-6 flex items-center gap-3"
          >
            <span className="h-px flex-1 bg-gradient-to-r from-cyan-300/70 to-transparent" />
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-neutral-500">
              Código 404
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.28em] text-cyan-300">
            Destino no disponible
          </p>
          <h1
            id="not-found-title"
            className="max-w-xl font-heading text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Esta página salió del mapa.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-neutral-300 sm:text-lg">
            La dirección que ingresaste no existe o fue movida. Podés volver al
            inicio y seguir explorando nuestras soluciones.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link
              href="/"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-cyan-300/40 bg-cyan-300 px-6 py-3 font-semibold text-neutral-950 shadow-[0_0_32px_rgba(103,232,249,0.16)] transition-[background-color,border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:shadow-[0_0_40px_rgba(255,255,255,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-4 focus-visible:ring-offset-black motion-reduce:transform-none motion-reduce:transition-none"
            >
              Volver al inicio
              <svg
                aria-hidden="true"
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14m-6-6 6 6-6 6"
                />
              </svg>
            </Link>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
              ijac.com.ar
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
