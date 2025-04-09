import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  _id: string;
  name: string;
  username: string;
  email: string;
  profilePicture: string;
  isActive: boolean;
  isOnline: boolean;
  followers: string[];
  following: string[];
  isLoggedIn: boolean;
}

const initialState: UserState = {
  _id: "",
  name: "",
  username: "",
  email: "",
  profilePicture: "",
  isActive: false,
  isOnline: false,
  followers: [],
  following: [],
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
        ...initialState,
        isLoggedIn: false,
      };
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice;
