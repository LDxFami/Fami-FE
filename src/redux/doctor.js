// ** Redux Imports
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import instance from "../configs/api";

/** Sidebar / list fetch — writes into doctors store. */
export const getDoctor = createAsyncThunk(
  "doctor/getDoctor",
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      const response = await instance.get("/api/roles/doctor/users", {
        params: { limit: 200, ...params },
        signal,
      });
      return response.data;
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
        throw err;
      }
      return rejectWithValue(err.response?.data);
    }
  },
  {
    condition: (params, { getState }) => {
      // Typeahead must use searchDoctors — never clobber the filter list
      if (params?.typeahead || params?.search_param) return false;
      return getState().doctor.doctors.loading !== "loading";
    },
  }
);

/**
 * Async-select / typeahead fetch — does not write into the sidebar doctors list.
 */
export const searchDoctors = createAsyncThunk(
  "doctor/searchDoctors",
  async (params = {}, { rejectWithValue, signal }) => {
    const { abortSignal, ...query } = params;
    try {
      const response = await instance.get("/api/roles/doctor/users", {
        params: { typeahead: 1, ...query },
        signal: abortSignal ?? signal,
      });
      return response.data;
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
        throw err;
      }
      return rejectWithValue(err.response?.data);
    }
  }
);

export const doctorSlice = createSlice({
  name: "doctor",
  initialState: {
    doctors: {
      data: {
        from: 1,
        to: 10,
        page: 1,
        limit: 200,
        total: 0,
        totalPage: 0,
        items: [],
      },
      loading: "pending",
      error: "",
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDoctor.fulfilled, (state, action) => {
        state.doctors.data = action.payload.data;
        state.doctors.loading = "success";
        state.doctors.error = null;
      })
      .addCase(getDoctor.pending, (state) => {
        state.doctors.loading = "loading";
      })
      .addCase(getDoctor.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.doctors.loading = "error";
        state.doctors.error = action.payload;
      });
  },
});

export const { selectEvent } = doctorSlice.actions;

export default doctorSlice.reducer;
