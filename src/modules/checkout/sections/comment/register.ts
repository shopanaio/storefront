import { registerSection } from '../registry';

registerSection('comment', async () => {
  const mod = await import('./components/CommentSection');
  return {
    slug: 'comment',
    titleKey: 'comment',
    Component: mod.CommentSection,
  } as const;
});
