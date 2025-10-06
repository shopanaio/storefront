import * as yup from 'yup';
import type { CommentFormData } from './types';

/**
 * Yup validation schema for CommentFormData
 * Comment is optional, so this schema always validates successfully
 */
export const commentFormSchema = yup.object<CommentFormData>().shape({
  comment: yup.string().max(255, 'Comment is too long').default(''),
});
