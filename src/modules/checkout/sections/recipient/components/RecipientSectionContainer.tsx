'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import type { ContactDto } from '@src/modules/checkout/core/contracts/dto';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { RecipientSectionView } from './RecipientSectionView';

/**
 * Container for the checkout recipient section.
 *
 * Orchestrates integration with the section controller.
 * Delegates all form logic and UI to RecipientSectionView.
 */
export const RecipientSectionContainer = () => {
  const t = useTranslations('Checkout');
  const [isRecipientSelf, setIsRecipientSelf] = useState(true);
  const [recipientData, setRecipientData] = useState<Partial<ContactDto>>({
    userFirstName: '',
    userLastName: '',
    userMiddleName: '',
    userPhone: '',
  });

  const { publishValid, publishInvalid } = useSectionController<'recipient'>('recipient', {
    required: true,
  });

  /**
   * Handles switch toggle between self and another person
   */
  const handleSwitchChange = useCallback((checked: boolean) => {
    setIsRecipientSelf(!checked);
    if (checked) {
      // When switching to "another person", don't publish yet
      // Wait for user to fill the form
    } else {
      // When switching to "self", immediately publish
      publishValid({ self: true });
    }
  }, [publishValid]);

  /**
   * Handles save event from view and publishes to section controller
   */
  const handleSave = useCallback(
    (dto: ContactDto) => {
      try {
        // Save recipient data to preserve it
        setRecipientData(dto);

        if (isRecipientSelf) {
          publishValid({ self: true });
        } else {
          publishValid({ self: false, ...dto });
        }
      } catch {
        publishInvalid?.({});
      }
    },
    [isRecipientSelf, publishValid, publishInvalid]
  );

  return (
    <RecipientSectionView
      isRecipientSelf={isRecipientSelf}
      initialValues={recipientData}
      switchLabel={t('i-am-recipient')}
      recipientTitle={t('recipient')}
      onSwitchChange={handleSwitchChange}
      onSave={handleSave}
    />
  );
};

export default RecipientSectionContainer;
