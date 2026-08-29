import { withAsyncPaginate } from "react-select-async-paginate";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

export const NAME_SEARCH_MIN_CHARS = 2;
export const NAME_SEARCH_PHONE_MIN_DIGITS = 3;
export const NAME_SEARCH_DEBOUNCE_MS = 300;
export const NAME_SEARCH_LIMIT = 20;
/** Doctors list is small — search from the first character, less debounce. */
export const DOCTOR_SEARCH_MIN_CHARS = 0;
export const DOCTOR_SEARCH_DEBOUNCE_MS = 100;

export const AsyncPaginateSelect = withAsyncPaginate(Select);
export const AsyncPaginateCreatableSelect = withAsyncPaginate(CreatableSelect);

/** Phone is admin-only, so the label falls back to the name alone. */
export const mapCustomerOption = (customer, { showPhone = false } = {}) => ({
  label: showPhone
    ? `${customer.name} - ${customer.phone ?? "Không có SĐT"}`
    : customer.name,
  value: customer.id,
  id: customer.id,
});

export const mapDoctorOption = (doctor) => ({
  label: doctor.name,
  value: doctor.id,
  id: doctor.id,
});

/**
 * Whether the typed value is worth hitting the API for.
 * Empty input is allowed (defaultOptions / initial list).
 *
 * @param {string} inputValue
 * @param {{ minChars?: number, phoneMinDigits?: number }} [options]
 */
export const shouldSearchName = (inputValue = "", options = {}) => {
  const minChars = options.minChars ?? NAME_SEARCH_MIN_CHARS;
  const phoneMinDigits = options.phoneMinDigits ?? NAME_SEARCH_PHONE_MIN_DIGITS;
  const trimmed = String(inputValue).trim();
  if (trimmed.length === 0) return true;
  if (/^\d+$/.test(trimmed)) {
    return trimmed.length >= phoneMinDigits;
  }
  return trimmed.length >= minChars;
};

/**
 * loadOptions for react-select-async-paginate (scroll loads next page).
 * Supports AbortController via the 4th callback arg when the consumer passes signal.
 *
 * @param {(inputValue: string, page: number, signal?: AbortSignal) => Promise<{ options: Array, hasMore: boolean }>} fetchPage
 * @param {{ minChars?: number, phoneMinDigits?: number }} [searchOptions]
 */
export const createPaginatedNameLoadOptions = (fetchPage, searchOptions = {}) => {
  let abortController = null;

  return async (inputValue, _loadedOptions, additional) => {
    const page = additional?.page ?? 1;
    const trimmed = String(inputValue ?? "").trim();

    if (!shouldSearchName(trimmed, searchOptions)) {
      abortController?.abort();
      abortController = null;
      return {
        options: [],
        hasMore: false,
        additional: { page: 1 },
      };
    }

    abortController?.abort();
    abortController = new AbortController();
    const { signal } = abortController;

    try {
      const result = await fetchPage(trimmed, page, signal);
      if (signal.aborted) {
        return {
          options: [],
          hasMore: false,
          additional: { page },
        };
      }
      return {
        options: Array.isArray(result?.options) ? result.options : [],
        hasMore: Boolean(result?.hasMore),
        additional: { page: page + 1 },
      };
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED" || signal.aborted) {
        return {
          options: [],
          hasMore: false,
          additional: { page },
        };
      }
      return {
        options: [],
        hasMore: false,
        additional: { page },
      };
    }
  };
};
