interface Warehouse {
  id: string
  type: string
  number: string
  address: string
  schedule: string
}

export const mockPoshtaWarehouse: Warehouse[] = [
  {
    id: "1",
    type: "Відділення Нова Пошта Нова Пошта",
    number: "1",
    address: "вул. Канатна, 92а",
    schedule: "Пн–Сб: 08:00–19:00, Нд: 09:00–17:00",
  },
  {
    id: "2",
    type: "Відділення Нова Пошта",
    number: "2",
    address: "Французький бульвар, 29",
    schedule: "Пн–Пт: 09:00–18:00, Сб: 10:00–16:00, Нд: вихідний",
  },
  {
    id: "3",
    type: "Відділення Нова Пошта",
    number: "3",
    address: "вул. Академіка Корольова, 30",
    schedule: "Пн–Сб: 08:00–20:00, Нд: 09:00–18:00",
  },
  {
    id: "4",
    type: "поштомат",
    number: "101",
    address: "ТРЦ Riviera, с. Фонтанка, Семафорна, 4",
    schedule: "Доступ 24/7",
  },
  {
    id: "5",
    type: "поштомат",
    number: "102",
    address: "вул. Пушкінська, 52 (АТБ)",
    schedule: "Доступ 08:00–22:00",
  },
  {
    id: "6",
    type: "Відділення Нова Пошта",
    number: "4",
    address: "вул. Дача Ковалевського, 121/1",
    schedule: "Пн–Пт: 09:00–18:00, Сб–Нд: вихідний",
  },
  {
    id: "7",
    type: "поштомат",
    number: "103",
    address: "вул. Балківська, 115 (Сільпо)",
    schedule: "Доступ 07:00–23:00",
  },
  {
    id: "8",
    type: "Відділення Нова Пошта",
    number: "5",
    address: "вул. Сегедська, 19",
    schedule: "Пн–Сб: 08:00–19:00, Нд: 09:00–17:00",
  },
];
