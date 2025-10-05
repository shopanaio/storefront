'use client';

import { PromoSectionContainer } from './PromoSectionContainer';

/**
 * Backward-compatible export: keep the original filename and export
 * the new container to avoid import changes across the app.
 */
export const PromoSection = PromoSectionContainer;

export default PromoSectionContainer;
