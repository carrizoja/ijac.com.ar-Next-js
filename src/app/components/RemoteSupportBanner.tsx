import { PrimaryButton } from "./ui/PrimaryButton";
import { remoteSupportContent } from "@/i18n/home/remote-support";
import type { Locale } from "@/i18n/routing";
import { getWhatsAppUrl } from "@/i18n/whatsapp";

export function RemoteSupportBanner({ locale = "es" }: { locale?: Locale }) {
  const content = remoteSupportContent[locale];
  return (
    <section
      aria-labelledby="remote-support-title"
      className="relative isolate overflow-hidden bg-black px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_45%,rgba(14,142,233,0.24),transparent_34%),linear-gradient(135deg,#050505_0%,#07111c_58%,#030303_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_right,transparent,black_40%,black)]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 overflow-hidden rounded-3xl border border-sky-400/25 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,119,204,0.16)] backdrop-blur-sm sm:p-9 lg:grid-cols-[1.15fr_0.85fr] lg:p-12">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-sky-300/30 bg-sky-400/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-sky-200">
            {content.eyebrow}
          </p>
          <h2
            id="remote-support-title"
            className="max-w-3xl font-heading text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl"
          >
            {content.heading}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-200 sm:text-lg">
            {content.description}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base">
            {content.coordination}
          </p>
          {content.disclaimer ? <p className="mt-3 max-w-2xl text-xs leading-6 text-neutral-500">{content.disclaimer}</p> : null}

          <PrimaryButton
            text={content.cta}
            href={getWhatsAppUrl(locale)}
            target="_blank"
            rel="noopener noreferrer"
            colorVariant="cyan"
            className="mt-8 justify-start"
          />
        </div>

        <div aria-hidden="true" className="relative mx-auto w-full max-w-md py-6">
          <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/20 bg-sky-500/10 shadow-[0_0_80px_rgba(14,142,233,0.35)]" />
          <div className="relative mx-auto w-[82%] rounded-xl border border-white/20 bg-gradient-to-b from-slate-800 to-slate-950 p-2 shadow-2xl">
            <div className="grid aspect-[16/10] place-items-center overflow-hidden rounded-lg border border-sky-400/20 bg-[radial-gradient(circle_at_center,rgba(14,142,233,0.28),#020617_68%)]">
              <div className="grid h-20 w-20 place-items-center rounded-2xl border border-sky-200/40 bg-sky-500 shadow-[0_0_35px_rgba(56,189,248,0.5)]">
                <svg viewBox="0 0 48 48" className="h-11 w-11 text-white" fill="none">
                  <path d="M8 24h32M8 24l7-7M8 24l7 7M40 24l-7-7M40 24l-7 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative mx-auto h-3 w-[96%] rounded-b-xl border-x border-b border-white/15 bg-gradient-to-b from-slate-600 to-slate-900" />
          <div className="relative mx-auto h-1.5 w-[38%] rounded-b-full bg-slate-700" />
          <div className="mt-7 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {content.status}
          </div>
        </div>
      </div>
    </section>
  );
}
