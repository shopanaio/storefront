'use client';

import { useEffect, useState } from 'react';

/**
 * Возвращает фокус на элемент, из которого открыли модалку стека, после её удаления.
 *
 * antd Modal не возвращает фокус сам (`focusTriggerAfterClose={false}`): иначе после закрытия
 * анимации он перебивал бы фокус, который открывший код уже перенёс (например, пикер фильтра после
 * подтверждения переводит фокус в поле ввода). Поэтому фокус восстанавливается, только если он
 * потерян: после удаления модалки остался на `body`. Модалки, восстановленные из URL, открываются
 * без элемента в фокусе и фокус не возвращают; удалённый из DOM триггер тоже пропускается.
 */
export function useRestoreFocus() {
  const [returnTarget] = useState(() =>
    typeof document === 'undefined' ? null : document.activeElement
  );

  useEffect(
    () => () => {
      if (
        !(returnTarget instanceof HTMLElement) ||
        returnTarget === document.body
      ) {
        return;
      }
      // Содержимое модалки удаляется вместе с порталом; фокус проверяется после этого.
      requestAnimationFrame(() => {
        const active = document.activeElement;
        const lost = !active || active === document.body;
        if (lost && returnTarget.isConnected) {
          returnTarget.focus({ preventScroll: true });
        }
      });
    },
    [returnTarget]
  );
}
