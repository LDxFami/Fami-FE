// ** Redux Imports
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import instance from "../configs/api";

// ** app Imports

export const getUser = createAsyncThunk(
  "user/getUser",
  async (params, { rejectWithValue }) => {
    try {
      const response = await instance.get("/api/profile", {
        params: { ...params },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updatePassword = createAsyncThunk(
  "user/updatePassword",
  async (params, { rejectWithValue }) => {
    try {
      const response = await instance.put("/api/profile/password", {
        ...params,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getUser.fulfilled, (state, action) => {
      state.userData = action.payload.data;
    });
  },
});

export const { selectEvent } = userSlice.actions;

export default userSlice.reducer;
