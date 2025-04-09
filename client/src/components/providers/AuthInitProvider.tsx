"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { login, logout } from "@/redux/slices/userSlice";
import AuthService from "@/services/auth";

export default function AuthInitProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await AuthService.getMe();
        dispatch(login(user));
      } catch (err) {
        dispatch(logout());
        console.error("Không thể lấy thông tin người dùng:", err);
      }
    };

    fetchUser();
  }, [dispatch]);

  return <>{children}</>;
}
