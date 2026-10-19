import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ContactSelect, type ContactForm } from './ContactSelect';

const messages = {
  Checkout: {
    'first-name': 'First name',
    'last-name': 'Last name',
    'middle-name': 'Middle name',
    'phone-number': 'Phone',
    'required-field': 'Required',
    save: 'Save',
    contact: 'Contact',
    'contact-information-form': 'Contact form',
    'enter-contact-details': 'Enter your details',
    'full-name': 'Full name',
  },
};

const saved: ContactForm = {
  firstName: 'Olena',
  lastName: 'Koval',
  middleName: 'Ivanivna',
  phone: '+380501112233',
};

const view = (data: ContactForm, onSubmit: (dto: ContactForm) => Promise<void>) => (
  <NextIntlClientProvider locale="en" messages={messages} onError={() => {}}>
    <ContactSelect title="Contact" data={data} onSubmit={onSubmit} />
  </NextIntlClientProvider>
);

describe('ContactSelect', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  });

  it('SC-2e9l: an answer of the server keeps the name being typed and the drawer open', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { rerender } = render(view(saved, onSubmit));
    fireEvent.click(screen.getByRole('button', { name: /Olena/ }));
    fireEvent.change(await screen.findByLabelText('First name'), { target: { value: 'Oksana' } });

    // The answer to an earlier save comes back with another last name.
    rerender(view({ ...saved, lastName: 'Kovalenko' }, onSubmit));
    await act(async () => undefined);

    expect(screen.getByLabelText('First name')).toHaveValue('Oksana');
    expect(screen.getByLabelText('Last name')).toHaveValue('Kovalenko');
    expect(screen.getByRole('form', { name: 'Contact form' })).toBeInTheDocument();
  });

  it('closes the drawer only after the contact is saved', async () => {
    let fail!: (error: unknown) => void;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((_, reject) => {
          fail = reject;
        })
    );
    render(view(saved, onSubmit));
    fireEvent.click(screen.getByRole('button', { name: /Olena/ }));
    fireEvent.change(await screen.findByLabelText('First name'), { target: { value: 'Oksana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await act(async () => undefined);
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Oksana' }));

    await act(async () => fail(new Error('Failed to fetch')));
    expect(screen.getByLabelText('First name')).toHaveValue('Oksana');
    expect(screen.getByRole('form', { name: 'Contact form' })).toBeInTheDocument();
  });
});
