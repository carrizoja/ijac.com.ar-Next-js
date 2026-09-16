import Image from "next/image";
import { PrimaryButton } from "./ui/PrimaryButton";
import { remoteSupportContent } from "@/i18n/home/remote-support";
import type { Locale } from "@/i18n/routing";
import { getWhatsAppUrl } from "@/i18n/whatsapp";

/** Static export disables the next/image optimizer, so Cloudinary does the resizing. */
const TEAMVIEWER_ILLUSTRATION =
  "https://res.cloudinary.com/dovghglgj/image/upload/f_auto,q_auto,w_960/v1789576479/ijac/teamviewer_jnywg9.png";

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
          <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 shadow-[0_0_80px_rgba(14,142,233,0.35)]" />
          {/* The illustration ships on its own near-black ground; the radial mask fades its
              edges into the banner so no rectangle shows against the gradient. */}
          <Image
            src={TEAMVIEWER_ILLUSTRATION}
            alt=""
            width={1672}
            height={941}
            unoptimized
            className="relative h-auto w-full [mask-image:radial-gradient(closest-side,black_45%,transparent)]"
          />
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {content.status}
          </div>
        </div>
      </div>
    </section>
  );
}
