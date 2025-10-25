/*
 * TypeScript declarations for Zoid — all types and exports are contained
 * within the ambient module "zoid" for convenient consumption.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "zoid" {
  /**
   * Generic promise-like type used across the API. Compatible with native Promise and ZalgoPromise.
   */
  export type ZalgoPromiseLike<T = void> = Promise<T> | { then: Promise<T>["then"] };

  /**
   * Domain matcher used to restrict communication or rendering to allowed origins.
   */
  export type StringMatcher = string | ReadonlyArray<string> | RegExp;

  /**
   * Cross-domain window reference.
   */
  export type CrossDomainWindow = Window;

  /**
   * post-robot proxy window interface (minimal shape used by Zoid types).
   */
  export interface ProxyWindow {
    focus(): ZalgoPromiseLike<void>;
    isPopup?(): ZalgoPromiseLike<boolean>;
    getType?(): ZalgoPromiseLike<Context>;
    getWindow?(): Window | null | undefined;
    setName?(name: string): void;
  }

  /**
   * Simple event emitter compatible with belter's EventEmitter.
   */
  export interface EventEmitter {
    on(event: string, handler: (...args: any[]) => any): { cancel(): void };
    once?(event: string, handler: (...args: any[]) => any): { cancel(): void };
    trigger?(event: string, payload?: any): void;
  }

  /**
   * Pixel dimensions used internally by the child window.
   */
  export interface Dimensions {
    width: number;
    height: number;
  }

  /**
   * CSS dimensions applied to the container or iframe (px/% strings).
   */
  export interface CssDimensions {
    width?: string;
    height?: string;
  }

  /**
   * Container reference: an HTMLElement or a CSS selector string.
   */
  export type ContainerReference = string | HTMLElement;

  /**
   * Supported value serialization modes when building query/body params.
   */
  export const PROP_SERIALIZATION: {
    readonly JSON: "json";
    readonly DOTIFY: "dotify";
    readonly BASE64: "base64";
  };
  export type PropSerialization = (typeof PROP_SERIALIZATION)[keyof typeof PROP_SERIALIZATION];

  /**
   * Supported prop type tags.
   */
  export const PROP_TYPE: {
    readonly STRING: "string";
    readonly OBJECT: "object";
    readonly FUNCTION: "function";
    readonly BOOLEAN: "boolean";
    readonly NUMBER: "number";
    readonly ARRAY: "array";
  };
  export type PropTypeTag = (typeof PROP_TYPE)[keyof typeof PROP_TYPE];

  /**
   * Render context: iframe or popup.
   */
  export const CONTEXT: {
    readonly IFRAME: "iframe";
    readonly POPUP: "popup";
  };
  export type Context = (typeof CONTEXT)[keyof typeof CONTEXT];

  /**
   * System lifecycle events emitted by Zoid.
   */
  export const EVENT: {
    readonly RENDER: "zoid-render";
    readonly RENDERED: "zoid-rendered";
    readonly PRERENDER: "zoid-prerender";
    readonly PRERENDERED: "zoid-prerendered";
    readonly DISPLAY: "zoid-display";
    readonly ERROR: "zoid-error";
    readonly CLOSE: "zoid-close";
    readonly DESTROY: "zoid-destroy";
    readonly PROPS: "zoid-props";
    readonly RESIZE: "zoid-resize";
    readonly FOCUS: "zoid-focus";
  };
  export type ZoidEvent = (typeof EVENT)[keyof typeof EVENT];

  /**
   * Error thrown when a popup fails to open (re-exported from belter).
   */
  export class PopupOpenError extends Error {}

  // ===== Props =====
  /** Generic prop event handler; may return a promise. */
  export type EventHandler<T = any> = (value: T) => void | ZalgoPromiseLike<void>;
  /** Subscribe to prop updates in the child. */
  export type OnProps<P> = (handler: (props: Props<P>) => void) => { cancel(): void };

  /**
   * User-provided props for a component instance (parent-side input).
   */
  export type PropsInput<P = Record<string, any>> = P & {
    /** Parent reference (auto-injected for child components). */
    parent?: ParentProp<any, any>;
    /** Loading timeout in milliseconds. */
    timeout?: number;
    /** Explicit window or ProxyWindow to render into (same-domain only). */
    window?: CrossDomainWindow | ProxyWindow;
    /** CSP nonce propagated to default templates. */
    cspNonce?: string | null | undefined;
    /** Lifecycle/events callbacks. */
    onDisplay?: EventHandler<void>;
    onRendered?: EventHandler<void>;
    onRender?: EventHandler<void>;
    onPrerendered?: EventHandler<void>;
    onPrerender?: EventHandler<void>;
    onClose?: EventHandler<void>;
    onDestroy?: EventHandler<void>;
    onResize?: EventHandler<void>;
    onFocus?: EventHandler<void>;
    onError?: EventHandler<any>;
    /** Subscribe to child prop updates. */
    onProps?: OnProps<P>;
  };

  /**
   * Normalized props available to the component and child window (after decoration).
   */
  export type Props<P = Record<string, any>> = P & {
    timeout?: number;
    window?: CrossDomainWindow | ProxyWindow | null | undefined;
    cspNonce?: string | null | undefined;
    /** Effective CSS dimensions applied to the container. */
    dimensions: CssDimensions;
    /** Lifecycle/event handlers (guaranteed defined; default to no-op). */
    onDisplay: EventHandler<void>;
    onRendered: EventHandler<void>;
    onRender: EventHandler<void>;
    onPrerendered: EventHandler<void>;
    onPrerender: EventHandler<void>;
    onClose: EventHandler<void>;
    onDestroy: EventHandler<void>;
    onResize: EventHandler<void>;
    onFocus: EventHandler<void>;
    onError: EventHandler<any>;
    onProps: OnProps<P>;
  };

  /**
   * Props exposed to the child window via window.xprops.
   */
  export type ChildProps<P = Record<string, any>, X = any> = Props<P> & {
    parent?: ParentProp<any, any>;
    uid: string;
    tag: string;
    close: () => ZalgoPromiseLike<void>;
    focus: () => ZalgoPromiseLike<void>;
    show: () => ZalgoPromiseLike<void>;
    hide: () => ZalgoPromiseLike<void>;
    export: (xports: X) => ZalgoPromiseLike<void>;
    getParent: () => CrossDomainWindow;
    getParentDomain: () => string;
    resize: (size: { width?: number | null; height?: number | null }) => ZalgoPromiseLike<void>;
    onError: (err: any) => ZalgoPromiseLike<void>;
    onProps: OnProps<P>;
    getSiblings: (opts?: { anyParent?: boolean }) => ReadonlyArray<{ props: any; exports: any }>;
  };

  /**
   * Lightweight parent reference injected into child component props.
   */
  export interface ParentProp<P = any, X = any> {
    uid: string;
    props: Props<P>;
    export(xports: X): ZalgoPromiseLike<void>;
  }

  /**
   * Context passed to prop compute/decorate functions on the parent side.
   */
  export interface PropComputeCtx<P = any> {
    props: Props<P>;
    state: Record<string, any>;
    close(): ZalgoPromiseLike<void>;
    focus(): ZalgoPromiseLike<void>;
    onError(err: any): ZalgoPromiseLike<void>;
    container?: HTMLElement;
    event: EventEmitter;
  }

  /**
   * Parent-side decorator context including the current prop value.
   */
  export interface PropDecorateCtx<T = any, P = any> extends PropComputeCtx<P> {
    value: T;
  }

  /**
   * Child-side decorator context available in childDecorate.
   */
  export interface ChildDecorateCtx<T = any, P = any, X = any> {
    value: T | undefined;
    uid: string;
    tag: string;
    close(): ZalgoPromiseLike<void>;
    focus(): ZalgoPromiseLike<void>;
    onError(err: any): ZalgoPromiseLike<void>;
    onProps: OnProps<P>;
    resize(size: { width?: number | null; height?: number | null }): ZalgoPromiseLike<void>;
    getParentDomain(): string;
    getParent(): CrossDomainWindow;
    show(): ZalgoPromiseLike<void>;
    hide(): ZalgoPromiseLike<void>;
    export(xports: X): ZalgoPromiseLike<void>;
    getSiblings(opts?: { anyParent?: boolean }): ReadonlyArray<{ props: any; exports: any }>;
  }

  /**
   * Generic prop definition. Use specific aliases (StringPropDefinition, etc.) for convenience.
   */
  export interface BasePropDefinition<T, P = any, X = any> {
    /** Prop type tag used for validation/serialization. */
    type: PropTypeTag;
    /** Whether the value is required (defaults to true unless explicitly optional). */
    required?: boolean;
    /** Optional alias name for the prop. */
    alias?: string;
    /** Compute default value on the parent when input is absent. */
    default?(ctx: PropComputeCtx<P>): T | undefined;
    /** Compute value on the parent (takes precedence over provided input). */
    value?(ctx: PropComputeCtx<P>): T | undefined;
    /** Validate value (used in debug builds). */
    validate?(ctx: { value: T; props: Props<P> }): void;
    /** Parent-side decorator applied to a value before use. */
    decorate?(ctx: PropDecorateCtx<T, P>): T;
    /** Child-side decorator applied before exposing to window.xprops. */
    childDecorate?(ctx: ChildDecorateCtx<T, P, X>): T | undefined;
    /** Control query param name or generation for GET. */
    queryParam?: boolean | string | ((ctx: { value: T }) => string | ZalgoPromiseLike<string>);
    /** Control body param name or generation for POST. */
    bodyParam?: boolean | string | ((ctx: { value: T }) => string | ZalgoPromiseLike<string>);
    /** Customize serialization value for GET. */
    queryValue?<R = any>(ctx: { value: T }): R | string | ZalgoPromiseLike<R>;
    /** Customize serialization value for POST. */
    bodyValue?<R = any>(ctx: { value: T }): R | string | ZalgoPromiseLike<R>;
    /** Whether to forward this prop to the child window. */
    sendToChild?: boolean;
    /** Allow delegate calls across windows (for FUNCTION props). */
    allowDelegate?: boolean;
    /** Restrict prop exposure to same-domain child only. */
    sameDomain?: boolean;
    /** Restrict prop exposure to explicit trusted domains. */
    trustedDomains?: ReadonlyArray<StringMatcher>;
    /** Serialization mode for object values. */
    serialization?: PropSerialization;
  }

  export type BooleanPropDefinition<T extends boolean, P = any, X = any> = BasePropDefinition<T, P, X> & { type: typeof PROP_TYPE.BOOLEAN };
  export type StringPropDefinition<T extends string, P = any, X = any> = BasePropDefinition<T, P, X> & { type: typeof PROP_TYPE.STRING };
  export type NumberPropDefinition<T extends number, P = any, X = any> = BasePropDefinition<T, P, X> & { type: typeof PROP_TYPE.NUMBER };
  export type FunctionPropDefinition<T extends (...args: any[]) => any, P = any, X = any> = BasePropDefinition<T, P, X> & { type: typeof PROP_TYPE.FUNCTION };
  export type ArrayPropDefinition<T extends ReadonlyArray<any>, P = any, X = any> = BasePropDefinition<T, P, X> & { type: typeof PROP_TYPE.ARRAY };
  export type ObjectPropDefinition<T extends Record<string, any>, P = any, X = any> = BasePropDefinition<T, P, X> & { type: typeof PROP_TYPE.OBJECT };

  export type MixedPropDefinition<P = any, X = any> =
    | BooleanPropDefinition<boolean, P, X>
    | StringPropDefinition<string, P, X>
    | NumberPropDefinition<number, P, X>
    | FunctionPropDefinition<(...args: any[]) => any, P, X>
    | ObjectPropDefinition<Record<string, any>, P, X>
    | ArrayPropDefinition<ReadonlyArray<any>, P, X>;

  export type UserPropsDefinition<P = any, X = any> = Readonly<Record<string, MixedPropDefinition<P, X>>>;

  export interface BuiltInPropsDefinition<P = any, X = any> {
    timeout: NumberPropDefinition<number, P, X>;
    window: ObjectPropDefinition<CrossDomainWindow | ProxyWindow, P, X>;
    close: FunctionPropDefinition<() => ZalgoPromiseLike<void>, P, X>;
    focus: FunctionPropDefinition<() => ZalgoPromiseLike<void>, P, X>;
    resize: FunctionPropDefinition<(size: { width?: number | null; height?: number | null }) => ZalgoPromiseLike<void>, P, X>;
    uid: StringPropDefinition<string, P, X>;
    tag: StringPropDefinition<string, P, X>;
    cspNonce: StringPropDefinition<string, P, X>;
    getParent: FunctionPropDefinition<() => CrossDomainWindow, P, X>;
    getParentDomain: FunctionPropDefinition<() => string, P, X>;
    hide: FunctionPropDefinition<() => ZalgoPromiseLike<void>, P, X>;
    show: FunctionPropDefinition<() => ZalgoPromiseLike<void>, P, X>;
    export: FunctionPropDefinition<(xports: X) => ZalgoPromiseLike<void>, P, X>;
    getSiblings: FunctionPropDefinition<(opts?: { anyParent?: boolean }) => ReadonlyArray<{ props: any; exports: any }>, P, X>;
    onDisplay: FunctionPropDefinition<EventHandler<void>, P, X>;
    onRendered: FunctionPropDefinition<EventHandler<void>, P, X>;
    onRender: FunctionPropDefinition<EventHandler<void>, P, X>;
    onPrerendered: FunctionPropDefinition<EventHandler<void>, P, X>;
    onPrerender: FunctionPropDefinition<EventHandler<void>, P, X>;
    onClose: FunctionPropDefinition<EventHandler<void>, P, X>;
    onDestroy: FunctionPropDefinition<EventHandler<void>, P, X>;
    onResize: FunctionPropDefinition<EventHandler<void>, P, X>;
    onFocus: FunctionPropDefinition<EventHandler<void>, P, X>;
    onError: FunctionPropDefinition<EventHandler<any>, P, X>;
    onProps: FunctionPropDefinition<OnProps<P>, P, X>;
  }

  export type PropsDefinition<P = any, X = any> = BuiltInPropsDefinition<P, X> & Readonly<Record<string, MixedPropDefinition<P, X>>>;

  // ===== Options / Templates / Exports =====
  /** HTML attributes applied to generated iframe/popup elements. */
  export interface Attributes {
    iframe?: Record<string, string>;
    popup?: Record<string, string>;
  }

  /** Auto-resize configuration for iframe content. */
  export interface AutoResizeOptions {
    /** Track width changes. */
    width?: boolean;
    /** Track height changes. */
    height?: boolean;
    /** Selector for the element to observe (defaults to "body"). */
    element?: string;
  }

  /**
   * Arguments passed to container/prerender template functions.
   */
  export interface RenderOptions<P = any> {
    /** Unique instance id. */
    uid: string;
    /** Normalized props. */
    props: Props<P>;
    /** Component tag. */
    tag: string;
    /** Render context. */
    context: Context;
    /** Request the component to close. */
    close(reason?: string | null): ZalgoPromiseLike<void>;
    /** Focus the component window. */
    focus(): ZalgoPromiseLike<void>;
    /** Document of the target window. */
    doc: Document;
    /** Container element (if provided). */
    container?: HTMLElement;
    /** Effective CSS dimensions. */
    dimensions: CssDimensions;
    /** Mutable state bag. */
    state: Record<string, any>;
    /** Event emitter for lifecycle events. */
    event: EventEmitter;
    /** Main iframe element, if any. */
    frame: HTMLIFrameElement | null;
    /** Prerender iframe element, if any. */
    prerenderFrame: HTMLIFrameElement | null;
  }
  /** Alias compatible with original Flow name. */
  export type RenderOptionsType<P = any> = RenderOptions<P>;

  /** Config map describing child→parent exports by type. */
  export type ExportsConfigDefinition = Readonly<Record<string, { type: PropTypeTag }>>;
  /** Mapper that receives a promise to the live export object. */
  export type ExportsMapperDefinition<X = any> = (ctx: { getExports(): ZalgoPromiseLike<X> }) => X;
  /** Either a config map or a mapper function. */
  export type ExportsDefinition<X = any> = ExportsConfigDefinition | ExportsMapperDefinition<X>;

  /**
   * Options for zoid.create().
   */
  export interface ComponentOptions<P = any, X = any, C = any, Ext = any> {
    /** Unique component tag (kebab-case). */
    tag: string;
    /** Function providing extra instance helpers mixed into the instance. */
    getExtensions?(parent: ParentComponent<P, X>): Ext;
    /** Child page URL or a function of props. */
    url: string | ((ctx: { props: Props<P> }) => string);
    /** Expected child domain matcher. */
    domain?: StringMatcher;
    /** post-robot bridge URL for legacy popup flows. */
    bridgeUrl?: string;
    /** Force request method for loading the child URL. */
    method?: "get" | "post";
    /** User prop definitions. */
    props?: UserPropsDefinition<P, X>;
    /** Container dimensions or a function of props. */
    dimensions?: CssDimensions | ((ctx: { props: Props<P> }) => CssDimensions);
    /** Auto-resize configuration. */
    autoResize?: AutoResizeOptions;
    /** Allowed parent domains (validated by the child). */
    allowedParentDomains?: StringMatcher;
    /** Element attributes for iframe/popup. */
    attributes?: Attributes | ((ctx: { props: Props<P> }) => Attributes);
    /** Per-instance eligibility check. */
    eligible?(ctx: { props: PropsInput<P> }): { eligible: boolean; reason?: string };
    /** Default render context if none is provided. */
    defaultContext?: Context;
    /** Custom container template. */
    containerTemplate?: (opts: RenderOptions<P>) => HTMLElement | null | undefined;
    /** Optional prerender template. */
    prerenderTemplate?: (opts: RenderOptions<P>) => HTMLElement | null | undefined;
    /** Validate input props (used in debug builds). */
    validate?(ctx: { props: PropsInput<P> }): void;
    /** Optional logger. */
    logger?: { info(event: string, payload?: Record<string, string | boolean | undefined>): any };
    /** Set of child components exposed on the instance. */
    children?(): C;
    /** Child→parent exports contract. */
    exports?: ExportsDefinition<X>;
  }

  // ===== Parent / Instance =====
  /**
   * Helper methods mixed into component instances (parent-side).
   */
  export interface ParentHelpers<P = any> {
    state: Record<string, any>;
    close(): ZalgoPromiseLike<void>;
    focus(): ZalgoPromiseLike<void>;
    resize(size: { width?: number | null; height?: number | null }): ZalgoPromiseLike<void>;
    onError(err: any): ZalgoPromiseLike<void>;
    updateProps(props: PropsInput<P>): ZalgoPromiseLike<void>;
    event: EventEmitter;
    show(): ZalgoPromiseLike<void>;
    hide(): ZalgoPromiseLike<void>;
  }

  /**
   * Internal parent component interface (useful for typing getExtensions and advanced flows).
   */
  export interface ParentComponent<P = any, X = any> {
    init(): void;
    render(opts: { target: CrossDomainWindow; container: ContainerReference; context: Context; rerender: () => ZalgoPromiseLike<void> }): ZalgoPromiseLike<void>;
    getProps(): Props<P>;
    setProps(newProps: PropsInput<P>, isUpdate?: boolean): void;
    export(x: X): ZalgoPromiseLike<void>;
    destroy(err?: any): ZalgoPromiseLike<void>;
    getHelpers(): ParentHelpers<P>;
    getDelegateOverrides(): ZalgoPromiseLike<any>;
    getExports(): X;
  }

  /**
   * A live component instance created by calling the factory.
   */
  export interface ZoidComponentInstance<P = any, X = any, C = any, Ext = any> extends Ext, ParentHelpers<P>, X, C {
    /** Whether the instance is eligible to render (from options.eligible). */
    isEligible(): boolean;
    /** Clone the instance with the same props. */
    clone(): ZoidComponentInstance<P, X, C, Ext>;
    /** Render into the current window. */
    render(container?: ContainerReference, context?: Context): ZalgoPromiseLike<void>;
    /** Delegate render into another window. */
    renderTo(target: CrossDomainWindow, container?: ContainerReference, context?: Context): ZalgoPromiseLike<void>;
  }

  /**
   * Component factory function with attached static helpers and state.
   */
  export interface ZoidComponent<P = any, X = any, C = any, Ext = any> {
    (props?: PropsInput<P> | void): ZoidComponentInstance<P, X, C, Ext>;
    /** Register a driver for a framework (react/vue/etc.). */
    driver<T = any>(name: string, dep: any): T;
    /** Returns true when executed in the child window. */
    isChild(): boolean;
    /** xprops available in the child window (if isChild()). */
    xprops?: Props<P>;
    /** Check if delegate render is possible to a given window. */
    canRenderTo(win: CrossDomainWindow): ZalgoPromiseLike<boolean>;
    /** Active instances created by this factory. */
    readonly instances: ReadonlyArray<ZoidComponentInstance<P, X, C, Ext>>;
  }

  export type ZoidProps<P = any> = Props<P>;
  /** Create function signature for zoid.create(). */
  export type CreateZoidComponent = <P = any, X = any, C = any, Ext = any>(options: ComponentOptions<P, X, C, Ext>) => ZoidComponent<P, X, C, Ext>;

  /** Create a new Zoid component. */
  export const create: CreateZoidComponent;
  /** Destroy all component instances/resources. */
  export function destroyComponents(err?: any): ZalgoPromiseLike<void>;
  /** Alias for destroyComponents. */
  export const destroyAll: typeof destroyComponents;
  /** Full cleanup of global state and post-robot listeners. */
  export function destroy(err?: any): ZalgoPromiseLike<void>;

  /** Convenience interface for the default export namespace. */
  export interface Zoid {
    create: CreateZoidComponent;
    destroy: typeof destroy;
    destroyComponents: typeof destroyComponents;
    destroyAll: typeof destroyAll;
    PROP_TYPE: typeof PROP_TYPE;
    PROP_SERIALIZATION: typeof PROP_SERIALIZATION;
    CONTEXT: typeof CONTEXT;
    EVENT: typeof EVENT;
    PopupOpenError: typeof PopupOpenError;
  }

  /** Default export combining functions and constants, mirroring the CJS export. */
  const _default: Zoid;
  export default _default;
}

declare module "@krakenjs/zoid" {
  export * from "zoid";
  import def from "zoid";
  export default def;
}
