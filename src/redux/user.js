// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import instance from '../configs/api'

// ** app Imports

export const getUser = createAsyncThunk('api/user', async () => {
  const response = await instance.get('/apps/calendar/events')
  return response.data
})

export const userSlice = createSlice({
  name: 'userSlice',
  initialState: {
    userData: {},
  },
  reducers: {
   
  },
  extraReducers: builder => {
    builder
      .addCase(getUser.fulfilled, (state, action) => {
        state.events = action.payload
      })
     
  }
})

export const { selectEvent } = userSlice.actions

export default userSlice.reducer
