"use client";

import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import RequireAuth from "@/components/layouts/RequireAuth";
import { Button } from "@/components/ui/button";
import { logout } from "@/redux/slices/userSlice";
import AuthService from "@/services/auth";

export default function HomeForm() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      dispatch(logout());
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <RequireAuth>
      <main className="flex flex-col items-center justify-center min-h-screen gap-6">
        <h1 className="text-3xl font-bold">Welcome to My Chat App</h1>
        <Button variant="destructive" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </main>
    </RequireAuth>
  );
}
