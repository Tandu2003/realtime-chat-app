import { io, Socket } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6789";
let socket: Socket;

export const connectSocket = (userId: string) => {
  socket = io(URL, {
    query: { userId },
    withCredentials: true,
  });

  return socket;
};

export const getSocket = () => socket;
