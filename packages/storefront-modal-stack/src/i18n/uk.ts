export interface ModalStackMessages {
  unsavedChanges: string;
  unsavedChangesMessage: string;
  unsavedChildChangesMessage: string;
  leave: string;
  stay: string;
  loading: string;
}

export const uk: ModalStackMessages = {
  unsavedChanges: 'Незбережені зміни',
  unsavedChangesMessage: 'Є незбережені зміни. Закрити вікно без збереження?',
  unsavedChildChangesMessage:
    'У вікні, відкритому поверх цього, є незбережені зміни. Під час закриття цього вікна вони будуть втрачені. Закрити?',
  leave: 'Закрити',
  stay: 'Залишитися',
  loading: 'Завантаження',
};
