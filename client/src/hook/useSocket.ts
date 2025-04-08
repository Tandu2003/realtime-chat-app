import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";

import { setConnected, setOnlineUsers, setSocket } from "@/redux/slices/socketSlice";
import { RootState } from "@/redux/store";

export const useSocket = (userId: string | null) => {
  const dispatch = useDispatch();
  const socket = useSelector((state: RootState) => state.socket.socket);

  useEffect(() => {
    if (!userId || socket) return;

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
      query: { userId },
    });

    dispatch(setSocket(newSocket));

    newSocket.on("connect", () => {
      dispatch(setConnected(true));
      newSocket.emit("get-online-users");
    });

    newSocket.on("disconnect", () => {
      dispatch(setConnected(false));
    });

    newSocket.on("online-users", (users) => {
      dispatch(setOnlineUsers(users));
    });

    return () => {
      newSocket.disconnect();
      dispatch(setConnected(false));
    };
  }, [userId]);
};
