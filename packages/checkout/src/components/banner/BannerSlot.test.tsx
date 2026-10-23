import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BannerPriority } from '#checkout/state/banners/banners';
import type { BannerItem } from '#checkout/state/banners/banners';
import { BannerSlot } from './BannerSlot';

const banners = vi.hoisted(() => ({ current: [] as BannerItem[] }));

vi.mock('next-intl', () => ({
  useTranslations:
    () => (key: string, values?: Record<string, string | number>) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
}));
vi.mock('./useCheckoutBanners', () => ({
  useCheckoutBanners: () => banners.current,
}));

const banner = (overrides: Partial<BannerItem>): BannerItem => ({
  id: 'b1',
  priority: BannerPriority.Blocking,
  tone: 'action',
  title: 'Оберіть спосіб доставки',
  ...overrides,
});

describe('BannerSlot', () => {
  it('shows the first banner and counts the others', () => {
    banners.current = [
      banner({ id: 'b1' }),
      banner({ id: 'b2', title: 'Ціни змінилися', tone: 'warning' }),
      banner({ id: 'b3', title: 'Не вдалося зберегти', tone: 'critical' }),
    ];
    render(<BannerSlot />);

    expect(screen.getByText('Оберіть спосіб доставки')).toBeInTheDocument();
    expect(screen.queryByText('Ціни змінилися')).toBeNull();

    fireEvent.click(
      screen.getByRole('button', {
        name: `banner-show-all ${JSON.stringify({ count: 3 })}`,
      })
    );
    expect(screen.getByText('Ціни змінилися')).toBeInTheDocument();
    expect(screen.getByText('Не вдалося зберегти')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'banner-collapse' }));
    expect(screen.queryByText('Ціни змінилися')).toBeNull();
  });

  it('opens the text of a single banner with an icon next to its action', () => {
    banners.current = [
      banner({
        title: 'Оплата не пройшла',
        description: 'Гроші не списано.',
        action: { label: 'Ще раз', onClick: vi.fn() },
      }),
    ];
    render(<BannerSlot />);

    expect(screen.queryByText('Гроші не списано.')).toBeNull();
    const details = screen.getByRole('button', { name: 'banner-details' });
    // An icon: a word would leave the title no room on a phone.
    expect(details).not.toHaveTextContent('banner-details');
    fireEvent.click(details);
    expect(screen.getByText('Гроші не списано.')).toBeInTheDocument();
  });

  it('keeps an empty slot on the page, so the button does not move', () => {
    banners.current = [];
    const { container } = render(<BannerSlot />);

    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
