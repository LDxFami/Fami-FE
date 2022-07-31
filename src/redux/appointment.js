// ** Redux Imports
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import instance from "../configs/api";
// ** Axios Imports

export const getAppointment = createAsyncThunk(
  "appointment/getAppointment",
  async (params, { rejectWithValue }) => {
    try {
      const response = await instance.get("/api/appointments", {
        params: { ...params },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
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
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateAppointment = createAsyncThunk(
  "appointment/updateAppointment",
  async (params, { rejectWithValue }) => {
    try {
      const response = await instance.put(`api/appointments/${params.id}`, { ...params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
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
    appointment: {},
    selectedAppointment: {},

  },
  reducers: {
    selectAppointment: (state, action) => {
      state.selectedAppointment = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAppointment.fulfilled, (state, action) => {
        state.appointments.data = action.payload.data;
        state.appointments.loading = "success";
        state.appointments.error = null;
      })
      .addCase(getAppointment.pending, (state, action) => {
        state.appointments.loading = "loading";
      })
      .addCase(addAppointment.fulfilled, (state, action) => {
        // state.appointment.loading = "success";
      })
      .addCase(addAppointment.pending, (state, action) => {
        // state.appointment.loading = "pending";
      })
      .addCase(addAppointment.rejected, (state, action) => {
        // state.appointment.loading = "error";
        // state.appointment.error = action.payload;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.appointment.loading = "success";
        state.appointment.data = action.payload;
      })
      .addCase(updateAppointment.pending, (state, action) => {
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
