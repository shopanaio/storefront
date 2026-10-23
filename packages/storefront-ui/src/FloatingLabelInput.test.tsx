import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { FloatingLabelInput } from './FloatingLabelInput';
import { FloatingLabelPassword } from './FloatingLabelPassword';
import { StorefrontUIProvider } from './StorefrontUIProvider';

afterEach(cleanup);

it('reserves space for the floating label and preserves field height while editing', () => {
  render(<FloatingLabelInput label="Email" />);
  const input = screen.getByLabelText('Email');
  expect(input).toHaveStyle({
    height: '50px',
    paddingTop: '12px',
    lineHeight: '1',
  });
  expect(input.closest('.ant-input-affix-wrapper')).toHaveStyle({
    height: '50px',
    paddingTop: '0',
    paddingBottom: '0',
  });
  const label = screen.getByText('Email');
  const initialClass = label.className;
  fireEvent.focus(input);
  expect(label.className).not.toBe(initialClass);
  fireEvent.change(input, { target: { value: 'buyer@example.com' } });
  fireEvent.blur(input);
  expect(label.className).not.toBe(initialClass);
});

it('describes the field by its error and marks it invalid', () => {
  render(
    <FloatingLabelInput
      label="Email"
      error="Enter a valid email"
      aria-describedby="hint"
    />
  );
  const input = screen.getByLabelText('Email');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  const error = screen.getByText('Enter a valid email');
  expect(input.getAttribute('aria-describedby')?.split(' ')).toEqual([
    'hint',
    error.id,
  ]);
});

it('puts className and style on the root and the parts by name', () => {
  render(
    <FloatingLabelInput
      label="Email"
      className="root"
      classNames={{ field: 'field', input: 'input', label: 'label' }}
    />
  );
  const input = screen.getByLabelText('Email');
  expect(input).toHaveClass('input');
  expect(input.closest('.field')).not.toBeNull();
  expect(input.closest('.root')).not.toBeNull();
  expect(screen.getByText('Email')).toHaveClass('label');
});

it('shows and hides the password', () => {
  render(
    <FloatingLabelPassword
      label="Password"
      toggleLabels={{ show: 'Show', hide: 'Hide' }}
    />
  );
  const input = screen.getByLabelText('Password');
  expect(input).toHaveAttribute('type', 'password');
  fireEvent.click(screen.getByRole('button', { name: 'Show' }));
  expect(input).toHaveAttribute('type', 'text');
  expect(screen.getByRole('button', { name: 'Hide' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
});

it('keeps a suffix of its own next to the reveal button, named by the provider', () => {
  render(
    <StorefrontUIProvider texts={{ showPassword: 'Показати пароль' }}>
      <FloatingLabelPassword label="Password" suffix={<span>caps</span>} />
    </StorefrontUIProvider>
  );
  expect(screen.getByText('caps')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Показати пароль' })
  ).toBeInTheDocument();
});
