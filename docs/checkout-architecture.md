## Архитектура Checkout: секции, провайдеры, Zustand, события

Этот документ описывает целевую архитектуру модуля `checkout` с хореографией взаимодействия секций и провайдеров. Верхний уровень строится на Zustand, для эфемерных сигналов применяется событийный шина (рекомендуется `emittery`). React Hook Form (RHF) используется только локально внутри секций/провайдеров — на уровне `Checkout` не применяется.

### Цели
- **Автономность секций и провайдеров**: каждая секция/провайдер сама хранит и валидирует свои данные, верхний модуль не знает их структуры.
- **Простая агрегация**: общий стор хранит только высокоуровневые статусы и выборы методов; итоговый payload собирается из «unknown»-слепков.
- **Хореография**: взаимодействие через события без прямых вызовов между секциями/провайдерами.
- **Прозрачность**: минимально необходимый набор сущностей, явные правила валидности и сабмита.

### Допущения и ограничения
- **SSR отсутствует** в Checkout: стор и bus инициализируются только на клиенте в client-компонентах.
- **Delivery groups поддерживаются**: доставка может быть разбита на несколько групп; выбор метода и провайдеры — по каждой группе отдельно.
- **Валидация — Yup**: локальные формы секций/провайдеров валидируются через Yup (например, с `@hookform/resolvers/yup`).

### Ключевые программные сущности
- `DeliveryGroupId`: строковый идентификатор группы доставки (например, UUID/код корзины-группы).
- `SectionId` (статические): `contact`, `recipient`, `payment`, опционально `promo`, `comment`.
- `ShippingSectionId` (динамические): шаблон `shipping:${groupId}`.
- `SectionKey = SectionId | ShippingSectionId` — ключ секции в сторе.
- `ProviderType`: `shipping` | `payment`.
- `ProviderId`:
  - для доставки (с группой): `shipping:${vendor}@${groupId}`;
  - для оплаты (без группы): `payment:${vendor}`.
- `ValidationStatus`: `idle` | `valid` | `invalid`.
- `CheckoutPayload`: итоговая структура верхнего уровня с учётом групп доставки.

Короткая форма типа payload:
```ts
type CheckoutPayload = {
  contact?: unknown;
  recipient?: unknown;
  deliveries?: Array<{ groupId: string; methodCode: string; data: unknown }>;
  payment?: { methodCode: string; data: unknown };
  promo?: unknown;
  comment?: string;
};
```

### Файловая структура (новые и изменяемые файлы)
- `src/modules/checkout/state/checkoutStore.ts` — Zustand-стор: состояние, действия, селекторы.
- `src/modules/checkout/state/checkoutBus.ts` — событийная шина (на `emittery`).
- `src/modules/checkout/state/selectors.ts` — производные селекторы (`canSubmit`, `missingRequiredSections`, `activeProvider`, ...).
- `src/modules/checkout/state/hooks/useSectionController.ts` — контроллер секции.
- `src/modules/checkout/state/hooks/useProviderController.ts` — контроллер провайдера.
- `src/modules/checkout/state/hooks/useMethodSelection.ts` — выбор shipping/payment метода.
- `src/modules/checkout/state/hooks/useGlobalValidation.ts` — обёртка над глобальными селекторами для UI.
- `src/modules/checkout/components/Checkout.tsx` — верхний компонент (убрать RHF, перейти на Zustand + события).
- `src/modules/checkout/sections/**` — секции используют локально RHF и контроллер секции.
- `src/modules/checkout/vendors/*/**` — провайдеры используют локально RHF и контроллер провайдера.
- `src/modules/checkout/infra/loaders/ProviderRenderer.tsx` — активация/деактивация провайдеров по выбранному методу.

### Состояние (Zustand) на верхнем уровне
Стор хранит только агрегаты:
- `sections[sectionKey] = { data: unknown|null, status: ValidationStatus, errors?: Record<string,string>, required: boolean }`
- `providers[providerId] = { data: unknown|null, status: ValidationStatus, errors?: Record<string,string>, type: ProviderType, active: boolean }`
- `selectedShippingMethodByGroup[groupId]: { code: string } | null`
- `selectedPaymentMethod?: { code: string } | null`

Базовые действия (actions):
- `registerSection(sectionKey, required)` / `unregisterSection(sectionKey)`
- `sectionValid(sectionKey, data)` / `sectionInvalid(sectionKey, errors?)` / `resetSection(sectionKey)`
- `registerProvider(providerId, type)` / `unregisterProvider(providerId)`
- `activateProvider(providerId)` / `deactivateProvider(providerId)`
- `providerValid(providerId, data)` / `providerInvalid(providerId, errors?)` / `resetProvider(providerId)`
- `selectShippingMethod(groupId: string, code: string|null)`
- `selectPaymentMethod(code: string|null)`
- `requestSubmit()` — проверка валидности и сборка `CheckoutPayload`

Производные селекторы:
- `isSectionValid(sectionKey)`
- `activeShippingProvider(groupId)` / `activePaymentProvider()`
- `missingRequiredSections` (учитывает группы доставки)
- `canSubmit`

### Событийная шина (emittery)
Файл: `src/modules/checkout/state/checkoutBus.ts`

- События не хранятся в Zustand, чтобы не вызывать лишние перерендеры.
- Источники событий: экшены стора (`selectMethod`, `requestSubmit`, публикация валидности секций/провайдеров).
- Подписчики: UI (кнопка сабмита, глобальные нотификации), провайдеры (реакция на активацию/деактивацию), секции (при необходимости).

Список событий (направление и полезная нагрузка):
- `section/registered` `{ sectionId, required }`
- `section/valid` `{ sectionId, data }`
- `section/invalid` `{ sectionId, errors? }`
- `section/reset` `{ sectionId }`
- `provider/registered` `{ providerId, providerType }`
- `provider/activated` `{ providerId }`
- `provider/deactivated` `{ providerId }`
- `provider/valid` `{ providerId, data }`
- `provider/invalid` `{ providerId, errors? }`
- `method/shipping-selected` `{ groupId: string, code: string|null }`
- `method/payment-selected` `{ code: string|null }`
- `submit/requested` `{}`
- `submit/blocked` `{ missing: SectionId[], errors?: Record<SectionId, string[]> }`
- `submit/ready` `{ payload: CheckoutPayload }`

Рекомендованная зависимость: `emittery` (установка: `yarn add emittery`).

### Контроллеры (hooks) и их ответственность
- `useSectionController(sectionId: SectionId, options: { required: boolean })`
  - Регистрирует секцию на mount/unmount.
  - Возвращает методы: `publishValid(data: unknown)`, `publishInvalid(errors?: Record<string,string>)`, `reset()`.
  - Секция локально (через RHF) управляет полями/валидацией и вызывает эти методы.

- `useProviderController(providerId: ProviderId, type: ProviderType)`
  - Регистрирует провайдера, следит за `active` (через селектор стора).
  - Возвращает: `publishValid(data)`, `publishInvalid(errors?)`, `reset()`.
  - При `active=false` провайдер должен сбрасывать локальное состояние (RHF reset) и `publish reset`.

- `useMethodSelection(scope: 'shipping'|'payment')`
  - Отдаёт `selected`, метод `select(code|null)`.
  - При `select` стор активирует соответствующий провайдер заданного `type`, деактивирует остальные, публикует события `provider/activated|deactivated` и `method/selected`.

- `useGlobalValidation()`
  - Обёртка над селекторами: `canSubmit`, `missingRequiredSections` и т.п.

### Правила валидности и агрегации
- `contact`, `recipient`, `promo`, `comment`: валидны, если секция опубликовала `valid`.
- `shipping:${groupId}`: валидна, если для `groupId` выбран метод И активный провайдер `shipping:*@${groupId}` валиден.
- `payment`: валидна, если выбран метод И активный `payment:*` провайдер валиден.
- `canSubmit = missingRequiredSections.length === 0`.

### Потоки (хореография) — текстово
- Монтируется секция → регистрация → локальная валидация → публикация `valid|invalid` → стор обновляет агрегат и эмитит события.
- Пользователь выбирает метод доставки/оплаты → стор сохраняет выбор, активирует нужный провайдер → провайдер валидирует и публикует `valid|invalid`.
- Кнопка «Оформить» → `requestSubmit()` → либо `submit/blocked` (UI подсвечивает секции/методы), либо `submit/ready(payload)` (вызов мутации/`onConfirm`).

### Интеграция в UI
- `src/modules/checkout/components/Checkout.tsx`
  - Убрать RHF-враппер уровня Checkout.
  - Использовать селекторы стора для отображения статусов.
  - Кнопка сабмита вызывает `requestSubmit()` и подписывается на `submit/ready|submit/blocked` через bus.
- `src/modules/checkout/infra/loaders/ProviderRenderer.tsx`
  - Обеспечить активацию/деактивацию провайдеров согласно `useMethodSelection`.
- `sections/*` и `vendors/*` компоненты
  - Оставить RHF локально, использовать соответствующий контроллер (`useSectionController`/`useProviderController`).

### Порядок внедрения (без обратной совместимости)
1. Создать `checkoutBus.ts` и типы событий. Подключить `emittery`.
2. Создать `checkoutStore.ts` с базовыми слайсами (`sections`, `providers`, выбор методов) и actions.
3. Добавить `selectors.ts` и `useGlobalValidation.ts`.
4. Реализовать `useSectionController.ts` и подключить его в секциях (`src/modules/checkout/sections/*`).
5. Реализовать `useProviderController.ts` и `useMethodSelection.ts`; подключить в метод-листингах и провайдерах (`src/modules/checkout/vendors/*`).
6. Переписать `components/Checkout.tsx`: убрать RHF, перевести сабмит на `requestSubmit()` + bus (`submit/ready|blocked`).
7. Обновить `ProviderRenderer.tsx` для активации/деактивации по выбору метода.
8. Очистить устаревшие зависимости/проверки (ручные валидации на верхнем уровне, дубли состояния).

### Тестирование и диагностика
- E2E-сценарии: «валидные секции → submit/ready», «невыбранные методы → submit/blocked», «смена провайдера сбрасывает его локальное состояние».
- Именование e2e-файлов: `*.spec.ts` в kebab-case.
- Логирование: при необходимости подписаться на bus-события в dev-сборке.

### Нормы кода и зависимости
- Комментарии в TypeScript — стиль ts-doc на английском (для публичных API: стор, контроллеры, селекторы).
- Управление зависимостями — `yarn`.
- Рекомендуемая зависимость: `emittery` (для событийного слоя).

### Расширение: добавление новых секций/провайдеров
- Секция: создать компонент в `src/modules/checkout/sections/<name>/...`, подключить `useSectionController(<sectionId>, { required })`, публиковать `valid|invalid` при изменении локальной RHF-валидации.
- Провайдер: создать компонент в `src/modules/checkout/vendors/<vendor>/components/*Provider.tsx`, зарегистрировать через `useProviderController('shipping:<vendor>'|'payment:<vendor>', <type>)`, валидировать локально, публиковать в стор.
- Метод-листинги: подключить `useMethodSelection` для выбора и синхронизации активного провайдера.

---

## Расширенные сценарии и примеры

### Потоки взаимодействия (подробнее)
- **Монтирование секции**: компонент секции → `useSectionController(sectionId, { required })` → `registerSection` → `emit('section/registered')`.
- **Ввод данных в секции**: RHF локально валидирует → при валидности `publishValid(data)` → стор записывает `sections[sectionId]`, `status='valid'` → `emit('section/valid')`. При ошибках — `publishInvalid(errors)` → `status='invalid'` → `emit('section/invalid')`.
- **Выбор метода доставки**: UI вызывает `selectShippingMethod(groupId, code)` → стор сохраняет выбор per group → активирует провайдера `shipping:*@groupId`, деактивирует другие в той же группе → `emit('method/shipping-selected', { groupId, code })` + `provider/activated|deactivated`.
- **Выбор метода оплаты**: UI вызывает `selectPaymentMethod(code)` → стор сохраняет выбор → активирует соответствующий `payment:*` провайдер, деактивирует остальные → `emit('method/payment-selected', { code })`.
- **Работа провайдера**: активный провайдер монтируется/реинициализируется → валидирует локально (RHF) → публикует `providerValid/Invalid` → стор отражает `providers[providerId]` и эмитит события.
- **Агрегация секций**: `shipping`/`payment` считаются валидными только при выбранном методе и валидном активном провайдере; это вычисляет стор.
- **Сабмит**: кнопка вызывает `requestSubmit()` → если `missingRequiredSections.length>0` → `emit('submit/blocked')`; иначе стор собирает `CheckoutPayload` → `emit('submit/ready', payload)`.

### Минимальные примеры кода (ядро)

Файл: `src/modules/checkout/state/checkoutBus.ts`
```ts
import Emittery from 'emittery';

export type SectionId = 'contact' | 'recipient' | 'shipping' | 'payment' | 'promo' | 'comment';
export type ProviderType = 'shipping' | 'payment';
export type ProviderId = `${ProviderType}:${string}`;

export type CheckoutPayload = {
  contact?: unknown;
  recipient?: unknown;
  delivery?: { methodCode: string; data: unknown };
  payment?: { methodCode: string; data: unknown };
  promo?: unknown;
  comment?: string;
};

export type CheckoutEvents = {
  'section/registered': { sectionId: SectionId; required: boolean };
  'section/valid': { sectionId: SectionId; data: unknown };
  'section/invalid': { sectionId: SectionId; errors?: Record<string, string> };
  'section/reset': { sectionId: SectionId };
  'provider/registered': { providerId: ProviderId; providerType: ProviderType };
  'provider/activated': { providerId: ProviderId };
  'provider/deactivated': { providerId: ProviderId };
  'provider/valid': { providerId: ProviderId; data: unknown };
  'provider/invalid': { providerId: ProviderId; errors?: Record<string, string> };
  'method/selected': { scope: 'shipping' | 'payment'; code: string | null };
  'submit/requested': {};
  'submit/blocked': { missing: SectionId[]; errors?: Record<SectionId, string[]> };
  'submit/ready': { payload: CheckoutPayload };
};

export const checkoutBus = new Emittery<CheckoutEvents>();

export const onCheckoutEvent = checkoutBus.on.bind(checkoutBus);
export const emitCheckoutEvent = checkoutBus.emit.bind(checkoutBus);
```

Файл: `src/modules/checkout/state/checkoutStore.ts` (упрощённый каркас)
```ts
import { create } from 'zustand';
import { emitCheckoutEvent } from './checkoutBus';

export type ValidationStatus = 'idle' | 'valid' | 'invalid';
export type SectionId = 'contact' | 'recipient' | 'shipping' | 'payment' | 'promo' | 'comment';
export type ProviderType = 'shipping' | 'payment';
export type ProviderId = `${ProviderType}:${string}`;

export interface SectionEntry { data: unknown | null; status: ValidationStatus; errors?: Record<string, string>; required: boolean; }
export interface ProviderEntry { data: unknown | null; status: ValidationStatus; errors?: Record<string, string>; type: ProviderType; active: boolean; }

interface CheckoutState {
  sections: Partial<Record<SectionId, SectionEntry>>;
  providers: Partial<Record<ProviderId, ProviderEntry>>;
  selectedShippingMethod: { code: string } | null;
  selectedPaymentMethod: { code: string } | null;
  registerSection: (id: SectionId, required: boolean) => void;
  sectionValid: (id: SectionId, data: unknown) => void;
  sectionInvalid: (id: SectionId, errors?: Record<string, string>) => void;
  resetSection: (id: SectionId) => void;
  registerProvider: (id: ProviderId, type: ProviderType) => void;
  activateProvider: (id: ProviderId) => void;
  deactivateProvider: (id: ProviderId) => void;
  providerValid: (id: ProviderId, data: unknown) => void;
  providerInvalid: (id: ProviderId, errors?: Record<string, string>) => void;
  resetProvider: (id: ProviderId) => void;
  selectMethod: (scope: 'shipping' | 'payment', code: string | null) => void;
  requestSubmit: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  sections: {},
  providers: {},
  selectedShippingMethod: null,
  selectedPaymentMethod: null,
  registerSection: (id, required) => {
    set((s) => ({ sections: { ...s.sections, [id]: { data: null, status: 'idle', required } } }));
    emitCheckoutEvent('section/registered', { sectionId: id, required });
  },
  sectionValid: (id, data) => {
    set((s) => ({ sections: { ...s.sections, [id]: { ...(s.sections[id] as any), data, status: 'valid' } } }));
    emitCheckoutEvent('section/valid', { sectionId: id, data });
  },
  sectionInvalid: (id, errors) => {
    set((s) => ({ sections: { ...s.sections, [id]: { ...(s.sections[id] as any), status: 'invalid', errors } } }));
    emitCheckoutEvent('section/invalid', { sectionId: id, errors });
  },
  resetSection: (id) => {
    set((s) => ({ sections: { ...s.sections, [id]: { ...(s.sections[id] as any), status: 'idle', data: null, errors: undefined } } }));
    emitCheckoutEvent('section/reset', { sectionId: id });
  },
  registerProvider: (id, type) => {
    set((s) => ({ providers: { ...s.providers, [id]: { data: null, status: 'idle', type, active: false } } }));
    emitCheckoutEvent('provider/registered', { providerId: id, providerType: type });
  },
  activateProvider: (id) => {
    set((s) => ({ providers: Object.fromEntries(Object.entries(s.providers).map(([k, v]) => [k, { ...v, active: k === id }])) }));
    emitCheckoutEvent('provider/activated', { providerId: id });
  },
  deactivateProvider: (id) => {
    set((s) => ({ providers: { ...s.providers, [id]: { ...(s.providers[id] as any), active: false, status: 'idle', data: null, errors: undefined } } }));
    emitCheckoutEvent('provider/deactivated', { providerId: id });
  },
  providerValid: (id, data) => {
    set((s) => ({ providers: { ...s.providers, [id]: { ...(s.providers[id] as any), data, status: 'valid' } } }));
    emitCheckoutEvent('provider/valid', { providerId: id, data });
  },
  providerInvalid: (id, errors) => {
    set((s) => ({ providers: { ...s.providers, [id]: { ...(s.providers[id] as any), status: 'invalid', errors } } }));
    emitCheckoutEvent('provider/invalid', { providerId: id, errors });
  },
  resetProvider: (id) => {
    set((s) => ({ providers: { ...s.providers, [id]: { ...(s.providers[id] as any), status: 'idle', data: null, errors: undefined } } }));
  },
  selectMethod: (scope, code) => {
    if (scope === 'shipping') set({ selectedShippingMethod: code ? { code } : null });
    if (scope === 'payment') set({ selectedPaymentMethod: code ? { code } : null });
    emitCheckoutEvent('method/selected', { scope, code });
  },
  requestSubmit: () => {
    // Проверка валидности + сборка payload (детали в реальной реализации)
    const state = get();
    // ... вычисление missingRequiredSections
    const missing: SectionId[] = [];
    if (missing.length > 0) {
      emitCheckoutEvent('submit/blocked', { missing });
      return;
    }
    const payload = {} as any; // собрать из sections и активных providers
    emitCheckoutEvent('submit/ready', { payload });
  },
}));
```

Файл: `src/modules/checkout/state/hooks/useSectionController.ts`
```ts
import { useEffect, useMemo } from 'react';
import { useCheckoutStore } from '../checkoutStore';

export function useSectionController(sectionId: SectionId, options: { required: boolean }) {
  const { registerSection, sectionValid, sectionInvalid, resetSection } = useCheckoutStore((s) => ({
    registerSection: s.registerSection,
    sectionValid: s.sectionValid,
    sectionInvalid: s.sectionInvalid,
    resetSection: s.resetSection,
  }));

  useEffect(() => {
    registerSection(sectionId, options.required);
    return () => { resetSection(sectionId); };
  }, [registerSection, resetSection, sectionId, options.required]);

  return useMemo(() => ({
    publishValid: (data: unknown) => sectionValid(sectionId, data),
    publishInvalid: (errors?: Record<string, string>) => sectionInvalid(sectionId, errors),
    reset: () => resetSection(sectionId),
  }), [sectionValid, sectionInvalid, resetSection, sectionId]);
}
```

Файл: `src/modules/checkout/state/hooks/useProviderController.ts`
```ts
import { useEffect, useMemo } from 'react';
import { useCheckoutStore } from '../checkoutStore';

export function useProviderController(providerId: ProviderId, type: ProviderType) {
  const { registerProvider, providerValid, providerInvalid, resetProvider } = useCheckoutStore((s) => ({
    registerProvider: s.registerProvider,
    providerValid: s.providerValid,
    providerInvalid: s.providerInvalid,
    resetProvider: s.resetProvider,
  }));

  const isActive = useCheckoutStore((s) => s.providers[providerId]?.active === true);

  useEffect(() => {
    registerProvider(providerId, type);
    return () => { resetProvider(providerId); };
  }, [registerProvider, resetProvider, providerId, type]);

  return useMemo(() => ({
    active: isActive,
    publishValid: (data: unknown) => providerValid(providerId, data),
    publishInvalid: (errors?: Record<string, string>) => providerInvalid(providerId, errors),
    reset: () => resetProvider(providerId),
  }), [isActive, providerValid, providerInvalid, resetProvider, providerId]);
}
```

Файл: `src/modules/checkout/state/hooks/useMethodSelection.ts`
```ts
import { useCheckoutStore } from '../checkoutStore';

export function useMethodSelection(scope: 'shipping' | 'payment') {
  const selected = useCheckoutStore((s) => scope === 'shipping' ? s.selectedShippingMethod : s.selectedPaymentMethod);
  const select = useCheckoutStore((s) => s.selectMethod);
  return { selected, select: (code: string | null) => select(scope, code) } as const;
}
```

### Примеры интеграции (использование)

Верхний компонент `src/modules/checkout/components/Checkout.tsx` (только CSR, без SSR):
```ts
import { useEffect, useState } from 'react';
import { onCheckoutEvent } from '@src/modules/checkout/state/checkoutBus';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';

export const Checkout = ({ onConfirm }: { onConfirm: (payload: any) => void }) => {
  const requestSubmit = useCheckoutStore((s) => s.requestSubmit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const offReady = onCheckoutEvent('submit/ready', ({ payload }) => onConfirm(payload));
    const offBlocked = onCheckoutEvent('submit/blocked', ({ missing }) => setError(`Заполните: ${missing.join(', ')}`));
    return () => { offReady(); offBlocked(); };
  }, [onConfirm]);

  return /* кнопка сабмита вызывает requestSubmit() и рендерит error */ null;
};
```

Листинг методов `src/modules/checkout/sections/delivery/components/ShippingMethods.tsx` (перегружен группой):
```ts
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';

export function ShippingMethods({ groupId }: { groupId: string }) {
  const selected = useCheckoutStore((s) => s.selectedShippingMethodByGroup[groupId] ?? null);
  const selectShippingMethod = useCheckoutStore((s) => s.selectShippingMethod);
  return /* onClick → selectShippingMethod(groupId, code) */ null;
}
```

Провайдер `src/modules/checkout/vendors/novaposta/components/ShippingProvider.tsx` (связка с groupId):
```ts
import { useProviderController } from '@src/modules/checkout/state/hooks/useProviderController';

export function ShippingProviderNovaposta({ groupId }: { groupId: string }) {
  const { active, publishValid, publishInvalid, reset } = useProviderController(`shipping:novaposta@${groupId}`, 'shipping');
  // если active=false → можно скрыть форму/сбросить RHF
  return /* при валидности формы → publishValid(data), иначе publishInvalid(errors) */ null;
}
```

Секция `src/modules/checkout/sections/contact/components/ContactSection.tsx`:
```ts
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';

export function ContactSection() {
  const { publishValid, publishInvalid } = useSectionController('contact', { required: true });
  // внутри RHF: onChange → validate → publishValid/Invalid
  return null;
}
```

### Ошибки и UX
- **Локальные ошибки**: показываются внутри секций/провайдеров на основе их RHF-валидации.
- **Глобальные ошибки**: `submit/blocked` содержит список обязательных секций, которые не прошли валидацию или не выбраны.
- **Фидбек**: верхний уровень может подсвечивать соответствующие секции и скроллить к первой невалидной (обработчик в подписке на bus).

### Краевые случаи и договорённости
- Смена метода деактивирует предыдущий провайдер в пределах соответствующей области:
  - доставка — внутри одной `delivery group`;
  - оплата — глобально.
- Сброс при деактивации: `status='idle'`, `data=null`, `errors=undefined`, локальный RHF `reset()`.
- Секция `shipping:${groupId}`/`payment` валидна только при наличии выбранного метода и валидного активного провайдера.
- Эфемерные события (submit, scroll-to-error) не пишутся в Zustand, чтобы избежать лишних перерендеров.
