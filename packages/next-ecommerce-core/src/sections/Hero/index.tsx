'use client';

import type { SectionProps } from '../../core/types';
import type { HomePageData } from '../../sdk/types';

interface HeroSettings {
  title: string;
  subtitle?: string;
  ctaText?: string;
  backgroundImage?: string;
}

export default function Hero({ id, settings, data }: SectionProps<HeroSettings, HomePageData>) {
  return (
    <section id={id} style={{
      padding: '4rem 1.5rem',
      background: settings.backgroundImage
        ? `url(${settings.backgroundImage}) center/cover`
        : 'linear-gradient(135deg, #111, #333)',
      color: 'white',
      textAlign: 'center',
    }}>
      <p style={{ textTransform: 'uppercase', letterSpacing: '0.15em', color: '#aaa' }}>
        Featured products: {data.featuredProducts.length}
      </p>
      <h1 style={{ fontSize: '3rem', margin: '1rem 0' }}>{settings.title}</h1>
      {settings.subtitle && (
        <p style={{ fontSize: '1.25rem', maxWidth: 640, margin: '0 auto 2rem', color: '#ddd' }}>
          {settings.subtitle}
        </p>
      )}
      {settings.ctaText && (
        <button
          style={{
            padding: '0.85rem 1.5rem',
            borderRadius: '999px',
            border: 'none',
            fontWeight: 600,
            backgroundColor: '#fff',
            color: '#111',
            cursor: 'pointer',
          }}
        >
          {settings.ctaText}
        </button>
      )}
    </section>
  );
}
