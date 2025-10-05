'use client';

import { CommentSectionContainer } from './CommentSectionContainer';

/**
 * Backward-compatible export: keep the original filename and export
 * the new container to avoid import changes across the app.
 */
export const CommentSection = CommentSectionContainer;

export default CommentSectionContainer;
