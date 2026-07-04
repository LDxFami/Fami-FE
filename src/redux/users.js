// ** Redux Imports
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import instance from "../configs/api";

export const getUsers = createAsyncThunk(
  "users/getUsers",
  async (params, { rejectWithValue }) => {
    try {
      const response = await instance.get("/api/users", { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const getUser = createAsyncThunk(
  "users/getUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await instance.get(`/api/users/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const addUser = createAsyncThunk(
  "users/addUser",
  async (params, { rejectWithValue }) => {
    try {
      const response = await instance.post("/api/users", { ...params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (params, { rejectWithValue }) => {
    try {
      const { id, ...body } = params;
      const response = await instance.put(`/api/users/${id}`, { ...body });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await instance.delete(`/api/users/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: {
      data: {
        from: 1,
        to: 10,
        page: 1,
        limit: 10,
        total: 0,
        totalPage: 1,
        items: [],
      },
      loading: "pending",
      error: null,
    },
    selectedUser: { data: null, loading: "idle", error: null },
  },
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = { data: null, loading: "idle", error: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.users.loading = "loading";
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users.data = action.payload.data;
        state.users.loading = "success";
        state.users.error = null;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.users.loading = "error";
        state.users.error = action.payload;
      })
      .addCase(getUser.pending, (state) => {
        state.selectedUser.loading = "loading";
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.selectedUser.data = action.payload.data?.user ?? null;
        state.selectedUser.loading = "success";
        state.selectedUser.error = null;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.selectedUser.loading = "error";
        state.selectedUser.error = action.payload;
      })
      .addCase(addUser.pending, (state) => {
        state.selectedUser.loading = "pending";
      })
      .addCase(addUser.fulfilled, (state) => {
        state.selectedUser.loading = "success";
      })
      .addCase(addUser.rejected, (state, action) => {
        state.selectedUser.loading = "error";
        state.selectedUser.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.selectedUser.loading = "pending";
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.selectedUser.loading = "success";
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.selectedUser.loading = "error";
        state.selectedUser.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.selectedUser.loading = "pending";
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.selectedUser.loading = "success";
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.selectedUser.loading = "error";
        state.selectedUser.error = action.payload;
      });
  },
});

export const { clearSelectedUser } = usersSlice.actions;

export default usersSlice.reducer;
