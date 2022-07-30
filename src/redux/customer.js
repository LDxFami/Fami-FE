// ** Redux Imports
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import instance from "../configs/api";
// ** Axios Imports

export const getCustomer = createAsyncThunk(
  "customer/getCustomer",
  async (params, { rejectWithValue }) => {
    try {
      const response = await instance.get("/api/customers", {
        params: { ...params },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const addCustomer = createAsyncThunk(
  "customer/addCustomer",
  async (params, { rejectWithValue }) => {
    try {
      const response = await instance.post("api/customers", { ...params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const customerSlice = createSlice({
  name: "customer",
  initialState: {
    customers: {
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
    customer: { data: null, loading: "pending", error: "" },
  },
  reducers: {
    selectCustomer: (state, action) => {
      state.selectedEvent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCustomer.fulfilled, (state, action) => {
        state.customers.data = action.payload.data;
        state.customers.loading = "success";
        state.customers.error = null;
      })
      .addCase(getCustomer.pending, (state, action) => {
        state.customers.loading = "loading";
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.customer.loading = "success";
      })
      .addCase(addCustomer.pending, (state, action) => {
        state.customer.loading = "pending";
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.customer.loading = "error";
        state.customer.error = action.payload;
      });
  },
});

export const { selectEvent } = customerSlice.actions;

export default customerSlice.reducer;
