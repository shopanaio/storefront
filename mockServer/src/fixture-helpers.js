export const gid = (type, value) => `gid://shopana/${type}/${value}`;

export const money = (amount, currencyCode = 'USD') => ({
  amount: Number(amount).toFixed(2),
  currencyCode,
});

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const lexicalTextNode = (text) => ({
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  type: 'text',
  version: 1,
});

const textFormat = {
  bold: 1,
  italic: 2,
  strikethrough: 4,
  underline: 8,
  code: 16,
};

const lexicalFormattedTextNode = ({ text, formats = [] }) => ({
  ...lexicalTextNode(text),
  format: formats.reduce((value, format) => value | textFormat[format], 0),
});

const lexicalElementNode = (type, children, extra = {}) => ({
  children,
  direction: null,
  format: '',
  indent: 0,
  type,
  version: 1,
  ...extra,
});

const lexicalParagraphNode = (text) => ({
  children: [lexicalTextNode(text)],
  direction: null,
  format: '',
  indent: 0,
  type: 'paragraph',
  version: 1,
  textFormat: 0,
  textStyle: '',
});

const inlineText = (children) => children.map(({ text }) => text).join('');

const inlineHtml = (children) =>
  children
    .map(({ text, formats = [] }) => {
      let html = escapeHtml(text);
      if (formats.includes('bold')) html = `<strong>${html}</strong>`;
      if (formats.includes('italic')) html = `<em>${html}</em>`;
      if (formats.includes('strikethrough')) html = `<s>${html}</s>`;
      if (formats.includes('underline')) html = `<u>${html}</u>`;
      if (formats.includes('code')) html = `<code>${html}</code>`;
      return html;
    })
    .join('');

const serializeRichTextBlock = (block) => {
  if (block.type === 'heading') {
    return {
      json: lexicalElementNode(
        'heading',
        block.children.map(lexicalFormattedTextNode),
        {
          tag: block.tag ?? 'h3',
        }
      ),
      html: `<${block.tag ?? 'h3'}>${inlineHtml(block.children)}</${block.tag ?? 'h3'}>`,
      text: inlineText(block.children),
    };
  }

  if (block.type === 'list') {
    const ordered = block.listType === 'number';
    const tag = ordered ? 'ol' : 'ul';
    return {
      json: lexicalElementNode(
        'list',
        block.items.map((children, index) =>
          lexicalElementNode(
            'listitem',
            children.map(lexicalFormattedTextNode),
            { value: index + 1 }
          )
        ),
        { listType: ordered ? 'number' : 'bullet', start: 1, tag }
      ),
      html: `<${tag}>${block.items.map((children) => `<li>${inlineHtml(children)}</li>`).join('')}</${tag}>`,
      text: block.items.map((children) => inlineText(children)).join('\n'),
    };
  }

  return {
    json: {
      ...lexicalElementNode(
        'paragraph',
        block.children.map(lexicalFormattedTextNode)
      ),
      textFormat: 0,
      textStyle: '',
    },
    html: `<p>${inlineHtml(block.children)}</p>`,
    text: inlineText(block.children),
  };
};

export const richTextDocument = (blocks) => {
  const serializedBlocks = blocks.map(serializeRichTextBlock);

  return {
    text: serializedBlocks.map(({ text }) => text).join('\n\n'),
    html: serializedBlocks.map(({ html }) => html).join(''),
    json: {
      root: lexicalElementNode(
        'root',
        serializedBlocks.map(({ json }) => json)
      ),
    },
  };
};

export const richText = (text) => {
  const paragraphs = text.split(/\n{2,}/u);

  return {
    text,
    html: paragraphs
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join(''),
    json: {
      root: {
        children: paragraphs.map(lexicalParagraphNode),
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
  };
};

export const emptyViewerState = {
  viewerEngagement: { vote: null, hasReported: false },
  viewerCapabilities: {
    canUpdate: false,
    canDelete: false,
    editableUntil: null,
  },
};

export const contentMetrics = (overrides = {}) => ({
  likeCount: 0,
  dislikeCount: 0,
  mediaCount: 0,
  childCount: 0,
  officialChildCount: 0,
  acceptedChildCount: 0,
  lastChildAt: null,
  updatedAt: null,
  ...overrides,
});

export const postalAddress = ({
  id,
  firstName,
  lastName,
  company = null,
  address1,
  address2 = null,
  city,
  province,
  provinceCode,
  country,
  countryCode,
  zip,
  phone,
}) => ({
  id,
  firstName,
  lastName,
  name: `${firstName} ${lastName}`,
  company,
  address1,
  address2,
  city,
  province,
  provinceCode,
  country,
  countryCode,
  zip,
  phone,
  formatted: [
    `${firstName} ${lastName}`,
    [address1, address2].filter(Boolean).join(', '),
    `${city}, ${provinceCode} ${zip}`,
    country,
  ],
  formattedArea: `${city}, ${provinceCode}, ${country}`,
});
