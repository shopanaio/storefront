import { beforeEach, describe, expect, it } from 'vitest';
import { SectionId } from '#checkout/state/interface';
import { useBannerStore } from './bannerStore';

describe('checkout banner lifecycle', () => {
  beforeEach(() => useBannerStore.getState().reset());

  it('keeps one failure per operation while retaining failures of other sections', () => {
    const state = useBannerStore.getState();
    state.reportSaveError({
      key: 'contact',
      sectionId: SectionId.Contact,
      message: 'First failure',
    });
    state.reportSaveError({
      key: 'note',
      sectionId: SectionId.Comment,
      message: 'Note failed',
    });
    state.reportSaveError({
      key: 'contact',
      sectionId: SectionId.Contact,
      message: 'Retry failed',
    });
    expect(useBannerStore.getState().saveErrors).toEqual([
      { key: 'note', sectionId: SectionId.Comment, message: 'Note failed' },
      { key: 'contact', sectionId: SectionId.Contact, message: 'Retry failed' },
    ]);
  });

  it('a successful save clears only the failure of that operation', () => {
    const state = useBannerStore.getState();
    state.reportSaveError({
      key: 'contact',
      sectionId: SectionId.Contact,
      message: 'Contact failed',
    });
    state.reportSaveError({
      key: 'note',
      sectionId: SectionId.Comment,
      message: 'Note failed',
    });
    state.clearSaveError('contact');
    state.clearSaveError('unknown-operation');
    expect(
      useBannerStore.getState().saveErrors.map((error) => error.key)
    ).toEqual(['note']);
  });

  it('remembers each dismissal without mutating the previously published set', () => {
    const before = useBannerStore.getState().dismissed;
    useBannerStore.getState().dismiss('prices:one');
    const first = useBannerStore.getState().dismissed;
    useBannerStore.getState().dismiss('notice:two');
    expect([...before]).toEqual([]);
    expect([...first]).toEqual(['prices:one']);
    expect([...useBannerStore.getState().dismissed]).toEqual([
      'prices:one',
      'notice:two',
    ]);
  });

  it('a replacement checkout starts without failures or dismissals from the previous checkout', () => {
    const state = useBannerStore.getState();
    state.reportSaveError({
      key: 'contact',
      sectionId: SectionId.Contact,
      message: 'Contact failed',
    });
    state.dismiss('prices:one');
    state.reset();
    expect(useBannerStore.getState().saveErrors).toEqual([]);
    expect([...useBannerStore.getState().dismissed]).toEqual([]);
    useBannerStore.getState().reportSaveError({
      key: 'contact',
      sectionId: SectionId.Contact,
      message: 'New checkout failure',
    });
    expect(useBannerStore.getState().saveErrors[0].message).toBe(
      'New checkout failure'
    );
  });
});
