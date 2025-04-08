import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  isLoggedIn: boolean;
  profilePicture?: string;
  username?: string;
  email?: string;
  name?: string;
}

const initialState: UserState = {
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login(state, action: PayloadAction<UserState>) {
      const { isLoggedIn, ...rest } = action.payload;
      return {
        isLoggedIn: true,
        ...rest,
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
export default userSlice;
