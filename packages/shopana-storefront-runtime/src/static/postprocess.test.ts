import { describe, expect, it } from 'vitest';
import {
  assertNoPrivateValues,
  pruneEmotionStyles,
  splitCssBlocks,
  withStaticDocumentInfo,
} from './postprocess';

describe('static HTML', () => {
  it('splits a style sheet into its top-level blocks', () => {
    expect(
      splitCssBlocks(
        '.a{color:red}@media (min-width:1px){.b{x:y}}.c{content:"}"}/* { */.d{}'
      )
    ).toEqual([
      '.a{color:red}',
      '@media (min-width:1px){.b{x:y}}',
      '.c{content:"}"}',
      '/* { */.d{}',
    ]);
  });

  it('drops the emotion rules no element uses', () => {
    const html =
      '<html><head>' +
      '<style data-emotion="acss used gone media">' +
      '.acss-used{color:red}.acss-used:hover{color:blue}.acss-gone{color:green}' +
      '@media (max-width:10px){.acss-media{x:y}}@keyframes spin{to{x:y}}' +
      '</style>' +
      '<style data-emotion="acss unused">.acss-unused{a:b}</style>' +
      '</head><body><div class="x acss-used"></div></body></html>';
    expect(pruneEmotionStyles(html)).toBe(
      '<html><head>' +
        '<style data-emotion="acss used">' +
        '.acss-used{color:red}.acss-used:hover{color:blue}@keyframes spin{to{x:y}}' +
        '</style>' +
        '</head><body><div class="x acss-used"></div></body></html>'
    );
  });

  it('keeps a rule that names a used class, and reads past escaped quotes', () => {
    const html =
      '<style data-emotion="acss a b c">' +
      '.acss-a .acss-b{x:y}.acss-c:not(.acss-a){x:y}.acss-c{content:"\\"}"}' +
      '</style><p class="acss-b"></p>';
    expect(pruneEmotionStyles(html)).toBe(
      '<style data-emotion="acss b">.acss-a .acss-b{x:y}</style><p class="acss-b"></p>'
    );
  });

  it('puts the static facts at the end of the head', () => {
    expect(
      withStaticDocumentInfo('<head></head>', {
        buildId: 'b',
        renderedAt: 't',
        locale: 'uk',
        path: '/uk/<x>',
      })
    ).toBe(
      '<head><script>window.__shopanaStatic={"buildId":"b","renderedAt":"t","locale":"uk","path":"/uk/\\u003cx>"}</script></head>'
    );
  });

  it('refuses private values', () => {
    expect(() =>
      assertNoPrivateValues('<p>secret-value-1234</p>', {
        STOREFRONT_SESSION_SECRET: 'secret-value-1234',
      })
    ).toThrow(/STOREFRONT_SESSION_SECRET/);
    expect(() =>
      assertNoPrivateValues(
        '<script>globalThis.__shopanaPublicEnv={}</script>',
        {}
      )
    ).toThrow(/__shopanaPublicEnv/);
    expect(() => assertNoPrivateValues('<p>ok</p>', {})).not.toThrow();
  });
});
