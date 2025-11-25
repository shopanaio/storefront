'use client';

import type { SectionProps } from '@shopana/storefront-sdk/core/types';

interface HeroSectionSettings {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function HeroSection({
  id,
  settings,
}: SectionProps<HeroSectionSettings>) {
  const eyebrow = settings.eyebrow ?? 'Featured collections';
  const title =
    settings.title ?? 'Build composable storefront experiences in code';
  const subtitle =
    settings.subtitle ??
    'Use the Shopana Storefront SDK to assemble data-driven pages with Relay and Next.js.';
  const ctaLabel = settings.ctaLabel ?? 'Explore catalog';
  const ctaHref = settings.ctaHref ?? '#catalog';

  return (
    <section id={id} className="py-16">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">{subtitle}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          >
            {ctaLabel}
          </a>
          <span className="text-sm text-gray-500">
            Powered by Builder templates &amp; Relay data
          </span>
        </div>
      </div>
    </section>
  );
}
