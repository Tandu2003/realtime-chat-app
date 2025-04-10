"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import { logout } from "@/redux/slices/userSlice";
import AuthService from "@/services/auth";

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost";
  showIcon?: boolean;
  className?: string;
}

export default function LogoutButton({
  variant = "default",
  showIcon = true,
  className = "",
}: LogoutButtonProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      dispatch(logout());
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      className={`flex items-center gap-2 ${className}`}
    >
      {showIcon && <LogOut size={16} />}
      Đăng xuất
    </Button>
  );
}
