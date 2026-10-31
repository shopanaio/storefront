// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { useRestoreFocus } from './use-restore-focus';

function Modal() {
  useRestoreFocus();
  return <input data-testid="modal-input" />;
}

let host: HTMLDivElement;
let root: Root;
let trigger: HTMLButtonElement;
let other: HTMLInputElement;

beforeAll(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame'] });
  trigger = document.createElement('button');
  other = document.createElement('input');
  host = document.createElement('div');
  document.body.append(trigger, other, host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  document.body.innerHTML = '';
  vi.useRealTimers();
});

/** Открывает модалку из `trigger`, переводит фокус внутрь и закрывает её. */
function openAndClose(beforeClose?: () => void) {
  trigger.focus();
  act(() => root.render(<Modal />));
  host.querySelector<HTMLInputElement>('[data-testid="modal-input"]')!.focus();
  beforeClose?.();
  act(() => root.render(null));
  vi.runAllTimers();
}

describe('useRestoreFocus', () => {
  it('returns focus to the trigger when the modal closes without a choice', () => {
    openAndClose();
    expect(document.activeElement).toBe(trigger);
  });

  it('keeps focus that the opener moved elsewhere', () => {
    openAndClose(() => other.focus());
    expect(document.activeElement).toBe(other);
  });

  it('skips a trigger removed while the modal was open', () => {
    openAndClose(() => trigger.remove());
    expect(document.activeElement).toBe(document.body);
  });

  it('does not move focus for a modal opened without a focused element', () => {
    act(() => root.render(<Modal />));
    act(() => root.render(null));
    vi.runAllTimers();
    expect(document.activeElement).toBe(document.body);
  });
});
