"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import { logout } from "@/redux/slices/userSlice";
import AuthService from "@/services/auth";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  showIcon?: boolean;
  className?: string;
}

export default function LogoutButton({
  variant = "default",
  showIcon = true,
  className = "",
}: LogoutButtonProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      dispatch(logout());
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      className={`transition-all ${className}`}
    >
      {showIcon && <LogOut size={16} className="mr-2" />}
      Đăng xuất
    </Button>
  );
}
