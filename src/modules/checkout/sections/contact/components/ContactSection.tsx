'use client';

import { ContactSectionContainer } from './ContactSectionContainer';

/**
 * Backward-compatible export: keep the original filename and export
 * the new container to avoid import changes across the app.
 */
export const ContactSection = ContactSectionContainer;

export default ContactSectionContainer;
