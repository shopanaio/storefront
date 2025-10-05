'use client';

import { RecipientSectionContainer } from './RecipientSectionContainer';

/**
 * Backward-compatible export: keep the original filename and export
 * the new container to avoid import changes across the app.
 */
export const RecipientSection = RecipientSectionContainer;

export default RecipientSectionContainer;
