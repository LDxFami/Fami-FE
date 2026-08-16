export const NAME_SEARCH_MIN_CHARS = 2;
export const NAME_SEARCH_PHONE_MIN_DIGITS = 3;
export const NAME_SEARCH_DEBOUNCE_MS = 300;
export const NAME_SEARCH_LIMIT = 25;

/**
 * Whether the typed value is worth hitting the API for.
 * Empty input is allowed (defaultOptions / initial list).
 */
export const shouldSearchName = (inputValue = "") => {
  const trimmed = String(inputValue).trim();
  if (trimmed.length === 0) return true;
  if (/^\d+$/.test(trimmed)) {
    return trimmed.length >= NAME_SEARCH_PHONE_MIN_DIGITS;
  }
  return trimmed.length >= NAME_SEARCH_MIN_CHARS;
};

/**
 * Debounced + stale-safe loader for react-select AsyncSelect / AsyncCreatableSelect.
 * Always returns a Promise so older in-flight selects settle instead of hanging.
 *
 * @param {(inputValue: string) => Promise<Array>} fetchItems resolves to option objects
 * @param {{ debounceMs?: number }} [options]
 * @returns {(inputValue: string) => Promise<Array>}
 */
export const createDebouncedNameLoader = (fetchItems, options = {}) => {
  const debounceMs = options.debounceMs ?? NAME_SEARCH_DEBOUNCE_MS;
  let requestId = 0;
  let timer = null;
  let pendingResolve = null;

  return (inputValue) => {
    const trimmed = String(inputValue ?? "").trim();

    if (!shouldSearchName(trimmed)) {
      return Promise.resolve([]);
    }

    const currentRequestId = ++requestId;

    if (pendingResolve) {
      pendingResolve([]);
      pendingResolve = null;
    }
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    return new Promise((resolve) => {
      pendingResolve = resolve;
      timer = setTimeout(async () => {
        pendingResolve = null;
        timer = null;
        try {
          const items = await fetchItems(trimmed);
          if (currentRequestId !== requestId) {
            resolve([]);
            return;
          }
          resolve(Array.isArray(items) ? items : []);
        } catch {
          resolve([]);
        }
      }, debounceMs);
    });
  };
};
