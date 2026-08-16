// ** Redux Imports
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import instance from "../configs/api";
// ** Axios Imports

export const getCustomer = createAsyncThunk(
  "customer/getCustomer",
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await instance.get("/api/customers", {
        params: { ...params },
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

/** Typeahead / async-select — does not overwrite the customers table store. */
export const searchCustomers = createAsyncThunk(
  "customer/searchCustomers",
  async (params = {}, { rejectWithValue, signal }) => {
    const { abortSignal, ...query } = params;
    try {
      const response = await instance.get("/api/customers", {
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

export const updateCustomer = createAsyncThunk(
  "customer/updateCustomer",
  async (params, { rejectWithValue }) => {
    try {
      const response = await instance.put(`api/customers/${params.id}`, {
        ...params,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customer/deleteCustomer",
  async (params, { rejectWithValue }) => {
    try {
      const response = await instance.delete(`api/customers/${params}`, {
        ...params,
      });
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
        // Typeahead callers should use searchCustomers; ignore if they slip through
        if (action.meta.arg?.typeahead) return;
        state.customers.data = action.payload.data;
        state.customers.loading = "success";
        state.customers.error = null;
      })
      .addCase(getCustomer.pending, (state, action) => {
        if (action.meta.arg?.typeahead) return;
        state.customers.loading = "loading";
      })
      .addCase(getCustomer.rejected, (state, action) => {
        if (action.meta.aborted || action.meta.arg?.typeahead) return;
        state.customers.loading = "error";
        state.customers.error = action.payload;
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
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.customer.loading = "success";
      })
      .addCase(updateCustomer.pending, (state, action) => {
        state.customer.loading = "pending";
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.customer.loading = "error";
        state.customer.error = action.payload;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customer.loading = "success";
      })
      .addCase(deleteCustomer.pending, (state, action) => {
        state.customer.loading = "pending";
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.customer.loading = "error";
        state.customer.error = action.payload;
      });
  },
});

export const { selectEvent } = customerSlice.actions;

export default customerSlice.reducer;
