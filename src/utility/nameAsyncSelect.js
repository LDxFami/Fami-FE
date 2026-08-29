import { useMemo } from "react";
import { unwrapResult } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { selectThemeColors } from "@utils";
import { searchCustomers } from "../redux/customer";
import { searchDoctors } from "../redux/doctor";
import { useIsAdmin } from "./hooks/useCurrentUser";
import {
  AsyncPaginateSelect,
  AsyncPaginateCreatableSelect,
  createPaginatedNameLoadOptions,
  mapCustomerOption,
  mapDoctorOption,
  NAME_SEARCH_LIMIT,
  NAME_SEARCH_DEBOUNCE_MS,
  DOCTOR_SEARCH_MIN_CHARS,
  DOCTOR_SEARCH_DEBOUNCE_MS,
} from "./asyncNameSearch";

export { mapCustomerOption, mapDoctorOption };

const menuPortalStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 10050 }),
};

export const useCustomerNameLoadOptions = () => {
  const dispatch = useDispatch();
  const { isAdmin } = useIsAdmin();
  return useMemo(
    () =>
      createPaginatedNameLoadOptions(async (inputValue, page, abortSignal) => {
        const params = {
          limit: NAME_SEARCH_LIMIT,
          page,
          abortSignal,
        };
        if (inputValue) {
          params.search_param = inputValue;
        }
        const resultAction = unwrapResult(
          await dispatch(searchCustomers(params))
        );
        const items = resultAction.data.items || [];
        return {
          options: items.map((item) =>
            mapCustomerOption(item, { showPhone: isAdmin })
          ),
          hasMore:
            resultAction.data.has_more ?? items.length >= NAME_SEARCH_LIMIT,
        };
      }),
    [dispatch, isAdmin]
  );
};

export const useDoctorNameLoadOptions = () => {
  const dispatch = useDispatch();
  return useMemo(
    () =>
      createPaginatedNameLoadOptions(
        async (inputValue, page, abortSignal) => {
          const params = {
            limit: NAME_SEARCH_LIMIT,
            page,
            abortSignal,
          };
          if (inputValue) {
            params.search_param = inputValue;
          }
          const resultAction = unwrapResult(
            await dispatch(searchDoctors(params))
          );
          const items = resultAction.data.items || [];
          return {
            options: items.map(mapDoctorOption),
            hasMore:
              resultAction.data.has_more ?? items.length >= NAME_SEARCH_LIMIT,
          };
        },
        {
          minChars: DOCTOR_SEARCH_MIN_CHARS,
          phoneMinDigits: DOCTOR_SEARCH_MIN_CHARS,
        }
      ),
    [dispatch]
  );
};

const sharedSelectProps = {
  theme: selectThemeColors,
  className: "react-select",
  classNamePrefix: "select",
  defaultOptions: true,
  additional: { page: 1 },
  debounceTimeout: NAME_SEARCH_DEBOUNCE_MS,
  // Server-side Vietnamese ranking — never re-filter client-side
  filterOption: null,
  menuPortalTarget: typeof document !== "undefined" ? document.body : null,
  menuPosition: "fixed",
  styles: menuPortalStyles,
  getOptionValue: (option) => option?.value ?? option?.id,
  getOptionLabel: (option) => option?.label,
};

/**
 * Same customer typeahead used by calendar search and appointment modal.
 */
export const CustomerNameSelect = ({
  creatable = false,
  onCreateOption,
  placeholder = "Tìm khách hàng...",
  loadOptions: loadOptionsProp,
  cacheUniqs = [],
  ...props
}) => {
  const defaultLoadOptions = useCustomerNameLoadOptions();
  const { isAdmin } = useIsAdmin();
  const loadOptions = loadOptionsProp ?? defaultLoadOptions;
  const SelectComponent = creatable
    ? AsyncPaginateCreatableSelect
    : AsyncPaginateSelect;

  return (
    <SelectComponent
      {...sharedSelectProps}
      placeholder={placeholder}
      loadOptions={loadOptions}
      // Relabel cached options once the profile (and phone visibility) resolves
      cacheUniqs={[...cacheUniqs, isAdmin]}
      {...(creatable
        ? {
            onCreateOption,
            createOptionPosition: "last",
            allowCreateWhileLoading: false,
            formatCreateLabel: (inputValue) =>
              `Tạo khách hàng "${inputValue}"`,
          }
        : {})}
      {...props}
    />
  );
};

/**
 * Doctor typeahead — opens with the full list and searches from the first character.
 */
export const DoctorNameSelect = ({
  placeholder = "Tìm bác sĩ...",
  loadOptions: loadOptionsProp,
  cacheUniqs,
  ...props
}) => {
  const defaultLoadOptions = useDoctorNameLoadOptions();
  const loadOptions = loadOptionsProp ?? defaultLoadOptions;

  return (
    <AsyncPaginateSelect
      {...sharedSelectProps}
      debounceTimeout={DOCTOR_SEARCH_DEBOUNCE_MS}
      placeholder={placeholder}
      loadOptions={loadOptions}
      cacheUniqs={cacheUniqs}
      {...props}
    />
  );
};
