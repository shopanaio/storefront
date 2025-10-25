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
import { initNanoInDoc } from './nanoHelpers';

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
  // Loading spinner options for default prerender
  spinner?: { color?: string; size?: number };
  // Show close button during loading (in parent container)
  showCloseButton?: boolean;
  // Close button icon color
  closeButtonColor?: string;
};

// Styling helpers moved to nanoHelpers to keep this widget lean

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
      spinner = { color: '#888', size: 32 },
      showCloseButton = true,
      closeButtonColor = '#111',
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
      containerTemplate: ({
        uid,
        frame,
        prerenderFrame,
        event,
        doc,
        props,
        close,
      }) => {
        const root = doc.createElement('div');
        root.setAttribute('id', uid);

        // Init nano-css once for this widget instance in parent document
        const nonce = (props as ZoidProps<any>)?.cspNonce;
        const { rule, add, remove } = initNanoInDoc(doc, nonce, `iw-${uid}-`);

        // Build classes using nano-css
        // Root overlay (modal backdrop + center content on >=1024px)
        const rootBase = rule(
          {
            position: 'fixed',
            inset: '0',
            width: '100%',
            height: '100%',
            zIndex: '2147483647',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          } as any,
          'root'
        );
        add(root, rootBase);
        if (containerStyles) {
          const containerClass = rule(containerStyles as any, 'container');
          add(root, containerClass);
        }

        // Content wrapper that constrains iframe at >=1024px
        const content = doc.createElement('div');
        const contentCls = rule(
          {
            position: 'relative',
            width: '100%',
            height: '100%',
            '@media (min-width: 1024px)': {
              width: '800px',
              height: '90vh',
              borderRadius: '16px',
              overflow: 'hidden',
            },
          } as any,
          'content'
        );
        add(content, contentCls);
        // Append content wrapper to the root overlay (centers on >=1024px)
        root.appendChild(content);

        // Click on gray overlay (outside content) should request close via parent
        // Rationale: use zoid.updateProps from the parent to set a requestedClose flag
        // which the child can observe via xprops.onProps and confirm before exiting.
        try {
          root.addEventListener('click', (ev: MouseEvent) => {
            if (ev.target === root) {
              try {
                // Parent may pass a handler to update props
                (props as any)?.onOverlayClick?.();
              } catch (_) {
                /* noop */
              }
            }
          });
        } catch (_) {
          /* noop */
        }

        // Iframe base styles + ensure smooth opacity transition unless already specified
        const iframeCss: StyleMap = { ...(iframeStyles || {}) };
        if (!('transition' in iframeCss)) {
          iframeCss.transition = 'opacity .2s ease-in-out';
        }
        const iframeClass = rule(iframeCss as any, 'iframe');

        // Visibility helpers
        const clsVisible = rule({ opacity: 1 } as any, 'visible');
        const clsInvisible = rule({ opacity: 0 } as any, 'invisible');

        // Prevent parent document from scrolling while overlay is displayed
        try {
          if (doc && doc.body) {
            disableBodyScroll(doc.body, { reserveScrollBarGap: true });
            const unlock = () => {
              try {
                enableBodyScroll(doc.body);
              } catch (e) {
                /* noop */
              }
            };
            event.on(EVENT.CLOSE, unlock);
            event.on(EVENT.DESTROY, unlock);
            // In case of explicit hide/show flows, ensure body can scroll again
            event.on(EVENT.ERROR, unlock);
          }
        } catch (e) {
          /* noop: body-scroll-lock best-effort */
        }

        // Optional close button while loading (removed when main frame renders)
        let closeBtn: HTMLButtonElement | null = null;
        if (showCloseButton) {
          try {
            closeBtn = doc.createElement('button');
            closeBtn.type = 'button';
            // Style the button via nano-css
            const closeBtnClass = rule({
              position: 'fixed',
              top: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              border: 'none',
              background: '#fff',
              color: String(closeButtonColor),
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: '2147483647',
              fontSize: '24px',
              ':focus': {
                outline: 'none',
                boxShadow: '0 0 0 2px rgba(59,130,246,0.4)'
              }
            } as any, 'close-btn');
            closeBtn.className = closeBtnClass;
            closeBtn.setAttribute('aria-label', 'Close');
            closeBtn.textContent = '×';
            closeBtn.addEventListener('click', () => {
              try {
                close?.();
              } catch {}
            });
            root.appendChild(closeBtn);
          } catch {}
        }

        // Apply iframe classes and small smooth switch between prerender and the main frame
        if (frame) {
          add(frame as any, iframeClass);
        }
        if (prerenderFrame) {
          add(prerenderFrame, iframeClass);
          add(prerenderFrame, clsVisible);
          add(frame as any, clsInvisible);
          event.on(EVENT.RENDERED, () => {
            remove(prerenderFrame, clsVisible);
            add(prerenderFrame, clsInvisible);
            remove(frame as any, clsInvisible);
            add(frame as any, clsVisible);
            // Remove loading close button once main frame is ready
            if (closeBtn && closeBtn.parentElement) {
              try {
                closeBtn.parentElement.removeChild(closeBtn);
              } catch {}
            }
            setTimeout(() => {
              try {
                prerenderFrame.remove();
              } catch (e) {
                /* noop */
              }
            }, 1);
          });
          content.appendChild(prerenderFrame);
        } else if (frame) {
          add(frame as any, clsVisible);
        }

        // Mount main frame inside the content wrapper
        content.appendChild(frame as any);
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
        const spinnerSize = Math.max(8, Number(spinner?.size ?? 32));
        const spinnerColor = String(spinner?.color ?? '#888');
        style.appendChild(
          doc.createTextNode(`
            html, body, #__zoid_prerender__ { height: 100%; margin: 0; }
            body { background: #fff; }
            #__zoid_prerender__ { display: flex; align-items: center; justify-content: center; }
            #__zoid_spinner__ { width: ${spinnerSize}px; height: ${spinnerSize}px; border: 2px solid #e5e7eb; border-top-color: ${spinnerColor}; border-radius: 50%; animation: _zspin 1s linear infinite; }
            @keyframes _zspin { to { transform: rotate(360deg); } }
          `)
        );

        const wrap = doc.createElement('div');
        wrap.setAttribute('id', '__zoid_prerender__');
        wrap.innerHTML = '<div id="__zoid_spinner__"></div>';

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
