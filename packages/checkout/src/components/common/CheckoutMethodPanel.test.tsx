import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CheckoutMethodPanel } from './CheckoutMethodPanel';

const renderPanel = (isActive: boolean, onActive: () => void) =>
  render(
    <CheckoutMethodPanel
      title="Branch"
      description={null}
      isActive={isActive}
      onActive={onActive}
      component={null}
    />
  );

describe('CheckoutMethodPanel', () => {
  it('SC-83ef: a click on the active method sends nothing', () => {
    const onActive = vi.fn();
    renderPanel(true, onActive);
    fireEvent.click(screen.getByText('Branch'));
    expect(onActive).not.toHaveBeenCalled();
  });

  it('selects a method that is not active', () => {
    const onActive = vi.fn();
    renderPanel(false, onActive);
    fireEvent.click(screen.getByText('Branch'));
    expect(onActive).toHaveBeenCalledTimes(1);
  });
});
