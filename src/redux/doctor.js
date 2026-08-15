// ** Redux Imports
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import instance from "../configs/api";
// ** Axios Imports

export const getDoctor = createAsyncThunk(
  "doctor/getDoctor",
  async (params, { rejectWithValue }) => {
    try {
      const response = await instance.get("/api/roles/doctor/users", {
        params: { ...params },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  },
  {
    // Dedupe concurrent list fetches (search still always runs)
    condition: (params, { getState }) => {
      if (params?.search_param) return true;
      return getState().doctor.doctors.loading !== "loading";
    },
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
        limit: 10,
        total: 100,
        totalPage: 10,
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
      .addCase(getDoctor.pending, (state, action) => {
        state.doctors.loading = "loading";
      });
  },
});

export const { selectEvent } = doctorSlice.actions;

export default doctorSlice.reducer;
