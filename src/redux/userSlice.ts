import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface IUser {
  id: string
  _id?: string
  name: string
  email: string
  role?: string
  partnerOnBoardingSteps?: number
  partnerStatus?: string
  rejectionReason?: string
  videoKycStatus?: string
  videoKycRoomId?: string
  videoKycRejectionReason?: string
}

interface IuserState {
  userData: IUser | null
}

const initialState: IuserState = {
  userData: null,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<IUser>) => {
      state.userData = action.payload
    },
    clearUserData: (state) => {
      state.userData = null
    }
  },
})

export const { setUserData, clearUserData } = userSlice.actions

export default userSlice.reducer