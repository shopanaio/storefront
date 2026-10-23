import { fireEvent, render, screen } from '@testing-library/react';
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
