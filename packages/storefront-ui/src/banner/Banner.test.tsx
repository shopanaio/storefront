import { fireEvent, render, screen } from '@testing-library/react';
import { StorefrontUIProvider } from '../StorefrontUIProvider';
import { Banner } from './Banner';

describe('Banner', () => {
  it('shows the title, the text under it and one action as a text link', () => {
    const onClick = vi.fn();
    render(
      <Banner
        tone="action"
        title="Оберіть доставку ще раз"
        description="Відділення тимчасово не працює."
        action={{ label: 'Обрати', onClick }}
      />
    );

    expect(screen.getByRole('status')).toHaveAttribute('data-tone', 'action');
    expect(
      screen.getByText('Відділення тимчасово не працює.')
    ).toBeInTheDocument();
    const action = screen.getByRole('button', { name: 'Обрати' });
    // Inside the checkout form, the action never submits it.
    expect(action).toHaveAttribute('type', 'button');
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalled();
  });

  it('a critical banner is an alert and cannot be closed', () => {
    render(
      <Banner
        tone="critical"
        title="Оплата не пройшла"
        onDismiss={vi.fn()}
        dismissLabel="Закрити"
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Закрити' })).toBeNull();
  });

  it('other banners can be closed', () => {
    const onDismiss = vi.fn();
    render(
      <Banner
        tone="success"
        title="Промокод застосовано"
        onDismiss={onDismiss}
        dismissLabel="Закрити"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Закрити' }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('the close button is named by the texts of the provider by default', () => {
    render(
      <StorefrontUIProvider texts={{ dismiss: 'Сховати' }}>
        <Banner tone="warning" title="Ціна змінилась" onDismiss={vi.fn()} />
      </StorefrontUIProvider>
    );

    expect(screen.getByRole('button', { name: 'Сховати' })).toBeInTheDocument();
  });

  it('the action gets the click event, and a control of its own renders as is', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Banner
        tone="action"
        title="Оберіть доставку"
        action={{ label: 'Обрати', onClick }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Обрати' }));
    expect(onClick.mock.calls[0][0]).toHaveProperty('type', 'click');

    rerender(
      <Banner
        tone="action"
        title="Оберіть доставку"
        action={<a href="/delivery">Доставка</a>}
      />
    );
    expect(screen.getByRole('link', { name: 'Доставка' })).toHaveAttribute(
      'href',
      '/delivery'
    );
  });

  it('a running action waits and cannot be pressed again', () => {
    render(
      <Banner
        tone="warning"
        title="Зберігаємо"
        action={{ label: 'Ще раз', loading: true }}
      />
    );
    const action = screen.getByRole('button', { name: 'Ще раз' });
    expect(action).toBeDisabled();
    expect(action).toHaveAttribute('aria-busy', 'true');
  });

  it('forwards the ref, the id and the data attributes to the root', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Banner
        ref={ref}
        id="notice"
        data-testid="notice"
        tone="success"
        title="Готово"
      />
    );
    expect(ref.current).toBe(screen.getByTestId('notice'));
    expect(ref.current).toHaveAttribute('id', 'notice');
  });

  it('the compact banner keeps to the title', () => {
    render(
      <Banner
        tone="warning"
        title="Ми змінили 2 товари"
        description="Перевірте суму."
        compact
      />
    );

    expect(screen.queryByText('Перевірте суму.')).toBeNull();
  });

  it('an action with an address is a link', () => {
    render(
      <Banner
        tone="action"
        title="Оплату не завершено."
        action={{ label: 'Продовжити оплату', href: 'https://pay.example/1' }}
      />
    );

    expect(
      screen.getByRole('link', { name: 'Продовжити оплату' })
    ).toHaveAttribute('href', 'https://pay.example/1');
  });
});
