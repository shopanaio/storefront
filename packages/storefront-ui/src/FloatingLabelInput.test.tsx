import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { FloatingLabelInput } from './FloatingLabelInput';
import { FloatingLabelPassword } from './FloatingLabelPassword';

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
