import { WritableDraft } from "immer";
import { Socket } from "socket.io-client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OnlineUser {
  _id: string;
  name: string;
}

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: OnlineUser[];
}

const initialState: SocketState = {
  socket: null,
  isConnected: false,
  onlineUsers: [],
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setSocket(state, action: PayloadAction<Socket>) {
      state.socket = action.payload as unknown as WritableDraft<Socket>;
    },
    setConnected(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
    },
    setOnlineUsers(state, action: PayloadAction<OnlineUser[]>) {
      state.onlineUsers = action.payload;
    },
    clearSocket(state) {
      state.socket = null;
      state.isConnected = false;
      state.onlineUsers = [];
    },
  },
});

export const { setSocket, setConnected, setOnlineUsers, clearSocket } = socketSlice.actions;

export default socketSlice;
