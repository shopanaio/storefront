type CacheStatus = 'pending' | 'loaded' | 'error';

interface CacheEntry {
  status: CacheStatus;
  promise: Promise<HTMLImageElement>;
  image?: HTMLImageElement;
  error?: Error;
  usageCount: number;
  pinned: boolean;
}

const cache = new Map<string, CacheEntry>();

const isClient = () => typeof window !== 'undefined';

const createPreloadPromise = (src: string) => {
  if (!isClient()) {
    throw new Error('Image cache is only available in a browser environment.');
  }

  const loader = new window.Image();
  loader.decoding = 'async';

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      loader.onload = null;
      loader.onerror = null;
    };

    const fulfill = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(loader);
    };

    const fail = (error: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(error);
    };

    loader.onload = () => {
      const decoded =
        typeof loader.decode === 'function' ? loader.decode() : undefined;

      if (decoded && typeof decoded.then === 'function') {
        decoded
          .catch(() => {
            // Ignore decode failures and rely on onload result.
          })
          .finally(fulfill);
        return;
      }

      fulfill();
    };

    loader.onerror = () => {
      fail(new Error(`Failed to load image: ${src}`));
    };

    loader.src = src;

    if (loader.complete) {
      if (loader.naturalWidth > 0) {
        const decoded =
          typeof loader.decode === 'function' ? loader.decode() : undefined;

        if (decoded && typeof decoded.then === 'function') {
          decoded
            .catch(() => {
              // Ignore decode failures and rely on the cached pixels.
            })
            .finally(fulfill);
        } else {
          fulfill();
        }
      } else {
        fail(new Error(`Cached image appears to be corrupted: ${src}`));
      }
    }
  });

  return { promise, loader };
};

const ensureEntry = (src: string): CacheEntry | null => {
  if (!src || !isClient()) {
    return null;
  }

  const existing = cache.get(src);
  if (existing) {
    return existing;
  }

  const { promise, loader } = createPreloadPromise(src);
  const entry: CacheEntry = {
    status: 'pending',
    promise,
    image: loader,
    usageCount: 0,
    pinned: false,
  };

  cache.set(src, entry);

  promise
    .then((image) => {
      entry.status = 'loaded';
      entry.image = image;
    })
    .catch((error) => {
      entry.status = 'error';
      entry.error = error;
      cache.delete(src);
    });

  return entry;
};

export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  if (!src) {
    return Promise.reject(new Error('Cannot preload image without a source.'));
  }

  const entry = ensureEntry(src);

  if (!entry) {
    return Promise.resolve(null as unknown as HTMLImageElement);
  }

  return entry.promise;
};

export const retainImageCache = (src?: string | null) => {
  if (!src) {
    return;
  }

  const entry = ensureEntry(src);
  if (!entry) {
    return;
  }

  entry.usageCount += 1;
};

export const releaseImageCache = (src?: string | null) => {
  if (!src || !isClient()) {
    return;
  }

  const entry = cache.get(src);
  if (!entry) {
    return;
  }

  entry.usageCount = Math.max(0, entry.usageCount - 1);

  if (entry.usageCount === 0 && !entry.pinned) {
    cache.delete(src);
  }
};

export const pinImageCache = (src?: string | null) => {
  if (!src) {
    return;
  }

  const entry = ensureEntry(src);
  if (!entry) {
    return;
  }

  entry.pinned = true;
};

export const unpinImageCache = (src?: string | null) => {
  if (!src || !isClient()) {
    return;
  }

  const entry = cache.get(src);
  if (!entry) {
    return;
  }

  entry.pinned = false;

  if (entry.usageCount === 0) {
    cache.delete(src);
  }
};

export const primeImageCache = (src?: string | null) => {
  if (!src) {
    return;
  }

  void preloadImage(src);
};

export const isImageCached = (src: string) =>
  cache.get(src)?.status === 'loaded';

export const getCachedImage = (src: string) => cache.get(src)?.image ?? null;
