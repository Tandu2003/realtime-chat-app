import { createSlice } from "@reduxjs/toolkit";

interface UserState {
  isLoggedIn: boolean;
  profilePicture?: string;
  name?: string;
}

const initialState: UserState = {
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login(state, action) {
      return {
        isLoggedIn: true,
        ...action.payload,
      };
    },
    logout() {
      return {
        isLoggedIn: false,
      };
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
