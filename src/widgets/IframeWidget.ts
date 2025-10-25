/*
  IframeWidget: a thin wrapper around Zoid for creating iframe components
  with customizable container and iframe styles.

  Usage:

    const widget = new IframeWidget({
      tag: 'my-fullscreen-widget',
      url: 'https://example.com/app',
      // Fullscreen overlay by default
      containerStyles: {
        position: 'fixed',
        inset: '0',
        width: '100%',
        height: '100%',
        zIndex: '2147483647'
      },
      iframeStyles: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        border: '0'
      },
      iframeAttributes: { scrolling: 'no' },
      autoResize: { height: true }
    });

    // Zoid factory is available as widget.factory
    // Programmatic render without pre-existing elements:
    const mount = document.createElement('div');
    document.body.appendChild(mount);
    widget.factory().render(mount); // defaults to CONTEXT.IFRAME
*/

// Minimal types for options. Zoid is imported directly from sources here.
// If you use the @krakenjs/zoid package, replace the import with '@krakenjs/zoid/src'.

import { create, CONTEXT, EVENT } from 'zoid';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import type { StringMatcher, ZoidComponent, ZoidProps } from 'zoid';

type StyleMap = Partial<CSSStyleDeclaration> & {
  [key: string]: string | number | undefined;
};

export type IframeWidgetOptions = {
  tag: string;
  url: string | ((ctx: { props: any }) => string);
  domain?: StringMatcher;
  defaultContext?: 'iframe' | 'popup';

  // Styles and attributes
  containerStyles?: StyleMap;
  iframeStyles?: StyleMap;
  iframeAttributes?: Record<string, string>;

  // Dimensions and auto-resize
  dimensions?: { width?: string; height?: string };
  autoResize?: { width?: boolean; height?: boolean; element?: string };

  // Prerender (optional)
  prerenderHTML?: (opts: { doc: Document; props: any }) => HTMLElement | null;
};

function applyStyles(el: HTMLElement, styles?: StyleMap) {
  if (!styles) return;
  Object.keys(styles).forEach((key) => {
    const val = styles[key];
    if (val !== undefined && el.style) {
      (el.style as any)[key] = String(val);
    }
  });
}

export class IframeWidget {
  public factory: ZoidComponent<any, any, any, any>;

  constructor(opts: IframeWidgetOptions) {
    const {
      tag,
      url,
      domain,
      defaultContext = 'iframe',
      containerStyles = {
        position: 'fixed',
        inset: '0',
        width: '100%',
        height: '100%',
        zIndex: '2147483647',
      },
      iframeStyles = {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        border: '0',
      },
      iframeAttributes = { scrolling: 'no' },
      dimensions = { width: '100%', height: '100%' },
      autoResize = { height: true, width: false },
      prerenderHTML,
    } = opts;

    const ctx = defaultContext === 'popup' ? CONTEXT.POPUP : CONTEXT.IFRAME;

    this.factory = create({
      tag,
      url,
      domain,
      defaultContext: ctx,
      dimensions,
      autoResize,
      attributes: { iframe: { ...iframeAttributes } },

      /**
       * containerTemplate — container template built in the parent document.
       *
       * Where it runs:
       *  - In the parent document (the window that calls render/renderTo)
       *
       * What it does:
       *  - Creates and returns a single HTMLElement (a wrapper) that Zoid will insert into the provided container
       *  - Controls layout/styles of the wrapper and both iframes (main and prerender)
       *  - Switches visibility from the prerender iframe to the main one on EVENT.RENDERED
       *  - May react to EVENT.RESIZE to adjust the wrapper size
       *
       * Important details:
       *  - Create elements using the provided `doc`
       *  - If it returns null/undefined, no additional wrapper will be inserted
       *  - Removing the returned element from the DOM initiates closing/re-rendering of the component
       */
      containerTemplate: ({ uid, frame, prerenderFrame, event, doc, props }) => {
        const root = doc.createElement('div');
        root.setAttribute('id', uid);
        applyStyles(root, containerStyles);

        // Apply styles directly to iframe elements
        if (frame) {
          applyStyles(frame, iframeStyles);
        }
        if (prerenderFrame) {
          applyStyles(prerenderFrame, iframeStyles);
        }

        // Inject minimal CSS for smooth visibility toggle
        try {
          const styleEl = doc.createElement('style');
          const nonce = (props as ZoidProps<any>)?.cspNonce;
          if (nonce) {
            styleEl.setAttribute('nonce', String(nonce));
          }
          styleEl.appendChild(
            doc.createTextNode(`
              #${uid} > iframe { transition: opacity .2s ease-in-out; }
              #${uid} > iframe.invisible { opacity: 0; }
              #${uid} > iframe.visible { opacity: 1; }
            `)
          );
          root.appendChild(styleEl);
        } catch (e) {
          /* noop: style injection best-effort */
        }

        // Prevent parent document from scrolling while overlay is displayed
        try {
          if (doc && doc.body) {
            disableBodyScroll(doc.body, { reserveScrollBarGap: true });
            const unlock = () => {
              try { enableBodyScroll(doc.body); } catch (e) { /* noop */ }
            };
            event.on(EVENT.CLOSE, unlock);
            event.on(EVENT.DESTROY, unlock);
            // In case of explicit hide/show flows, ensure body can scroll again
            event.on(EVENT.ERROR, unlock);
          }
        } catch (e) {
          /* noop: body-scroll-lock best-effort */
        }

        // Small smooth switch between prerender and the main frame
        if (prerenderFrame) {
          prerenderFrame.classList.add('visible');
          (frame as any).classList.add('invisible');
          event.on(EVENT.RENDERED, () => {
            prerenderFrame.classList.remove('visible');
            prerenderFrame.classList.add('invisible');
            (frame as any).classList.remove('invisible');
            (frame as any).classList.add('visible');
            setTimeout(() => {
              try {
                prerenderFrame.remove();
              } catch (e) {
                /* noop */
              }
            }, 1);
          });
          root.appendChild(prerenderFrame);
        }

        root.appendChild(frame as any);
        return root;
      },

      /**
       * prerenderTemplate — temporary content rendered inside the prerender window
       * (about:blank iframe or popup) before the component's main URL loads.
       *
       * Where it runs:
       *  - In the prerender window document (not in the parent document)
       *
       * What it does:
       *  - Returns an HTMLElement (or null) that will be written into the prerender window's document
       *  - Useful for showing a spinner/skeleton, early UX, and optional autoResize
       *  - When the main content is ready (EVENT.RENDERED), the container switches visibility and prerender can be removed
       *
       * Important details:
       *  - Create elements using the provided `doc`
       *  - If a CSP is in place, you can use `props.cspNonce` for `<style nonce>`
       */
      prerenderTemplate: ({ doc, props }: { doc: Document; props: any }) => {
        if (typeof prerenderHTML === 'function') {
          return prerenderHTML({ doc, props });
        }
        // Minimal default prerender: return <html> element as required by zoid
        const html = doc.createElement('html');
        const head = doc.createElement('head');
        const body = doc.createElement('body');

        const style = doc.createElement('style');
        const nonce = (props as ZoidProps<any>)?.cspNonce;
        if (nonce) style.setAttribute('nonce', String(nonce));
        style.appendChild(
          doc.createTextNode(`
            html, body, #__zoid_prerender__ { height: 100%; margin: 0; }
            #__zoid_prerender__ { display: flex; align-items: center; justify-content: center; font-family: sans-serif; color: #666; }
            #__zoid_spinner__ { width: 24px; height: 24px; border: 2px solid #ddd; border-top-color: #888; border-radius: 50%; animation: _zspin 1s linear infinite; margin-right: 8px; }
            @keyframes _zspin { to { transform: rotate(360deg); } }
          `)
        );

        const wrap = doc.createElement('div');
        wrap.setAttribute('id', '__zoid_prerender__');
        wrap.innerHTML = '<div id="__zoid_spinner__"></div><div>Loading…</div>';

        head.appendChild(style);
        body.appendChild(wrap);
        html.appendChild(head);
        html.appendChild(body);

        return html;
      },
    });
  }
}

export default IframeWidget;

