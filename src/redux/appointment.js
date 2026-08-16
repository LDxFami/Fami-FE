// ** Redux Imports
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import instance from "../configs/api";
// ** Axios Imports

const upsertAppointmentInList = (list, item) => {
  if (!item?.id) return list;
  const idx = list.findIndex((a) => a.id === item.id);
  if (idx === -1) return [...list, item];
  const next = list.slice();
  next[idx] = item;
  return next;
};

export const getAppointment = createAsyncThunk(
  "appointment/getAppointment",
  async (params, { rejectWithValue, signal }) => {
    const { silent, ...query } = params || {};
    try {
      const response = await instance.get("/api/appointments", {
        params: query,
        signal,
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

export const checkOverlapAppointment = createAsyncThunk(
  "appointment/checkOverlapAppointment",
  async (params, { rejectWithValue }) => {
    try {
      const response = await instance.post("/api/appointments/check-overlap", {
        ...params,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const addAppointment = createAsyncThunk(
  "appointment/addAppointment",
  async (params, { rejectWithValue }) => {
    try {
      const response = await instance.post("api/appointments", { ...params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const updateAppointment = createAsyncThunk(
  "appointment/updateAppointment",
  async (params, { rejectWithValue }) => {
    try {
      const response = await instance.put(`api/appointments/${params.id}`, {
        ...params,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const appointmentSlice = createSlice({
  name: "appointment",
  initialState: {
    appointments: {
      data: [],
      loading: "pending",
      error: "",
    },
    isOverlap: {
      data: false,
      loading: "pending",
      error: "",
    },
    appointment: {},
    selectedAppointment: {},
  },
  reducers: {
    selectAppointment: (state, action) => {
      state.selectedAppointment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAppointment.fulfilled, (state, action) => {
        state.appointments.data = action.payload.data;
        state.appointments.loading = "success";
        state.appointments.error = null;
      })
      .addCase(getAppointment.pending, (state, action) => {
        // Silent refreshes keep the calendar visible (no full-screen spinner)
        if (!action.meta.arg?.silent) {
          state.appointments.loading = "loading";
        }
      })
      .addCase(addAppointment.fulfilled, (state, action) => {
        if (action.payload?.is_overlap) return;
        if (action.payload?.data) {
          state.appointments.data = upsertAppointmentInList(
            state.appointments.data,
            action.payload.data
          );
        }
      })
      .addCase(checkOverlapAppointment.fulfilled, (state) => {
        state.isOverlap.loading = "success";
      })
      .addCase(checkOverlapAppointment.pending, (state) => {
        state.isOverlap.loading = "pending";
      })
      .addCase(checkOverlapAppointment.rejected, (state, action) => {
        state.isOverlap.loading = "error";
        state.isOverlap.error = action.payload;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        if (action.payload?.is_overlap) return;
        state.appointment.loading = "success";
        state.appointment.data = action.payload;
        if (action.payload?.data) {
          state.appointments.data = upsertAppointmentInList(
            state.appointments.data,
            action.payload.data
          );
        }
      })
      .addCase(updateAppointment.pending, (state) => {
        state.appointment.loading = "pending";
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.appointment.loading = "error";
        state.appointment.error = action.payload;
      });
  },
});

export const { selectAppointment } = appointmentSlice.actions;

export default appointmentSlice.reducer;
