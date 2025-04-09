"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login as setUser } from "@/redux/slices/userSlice";
import { RootState } from "@/redux/store";
import AuthService from "@/services/auth";

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [apiMessage, setApiMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  const validateField = (name: string, value: string) => {
    if (name === "email") {
      if (!value) return "Email không được để trống";
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!isValid) return "Email không hợp lệ";
    }
    if (name === "password") {
      if (!value) return "Mật khẩu không được để trống";
      if (value.length < 6) return "Ít nhất 6 ký tự";
    }
    return "";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiMessage(null);
  };

  const handleSubmit = async (
    e:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    const emailError = validateField("email", values.email);
    const passwordError = validateField("password", values.password);
    setErrors({ email: emailError, password: passwordError });

    if (!emailError && !passwordError) {
      setLoading(true);
      setApiMessage(null);

      try {
        const response = await AuthService.login(values.email, values.password);

        dispatch(
          setUser({
            _id: response.user._id,
            name: response.user.name,
            username: response.user.username,
            email: response.user.email,
            profilePicture: response.user.profilePicture,
            isActive: response.user.isActive,
            isOnline: response.user.isOnline,
            followers: response.user.followers,
            following: response.user.following,
            isLoggedIn: true,
          })
        );

        setApiMessage({ type: "success", text: response.message });
        router.push("/");
      } catch (error: any) {
        setApiMessage({
          type: "error",
          text: error.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
        });
      }
      setLoading(false);
    } else {
      setApiMessage({ type: "error", text: "Vui lòng kiểm tra các trường." });
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 w-full">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-center">Đăng nhập</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="Nhập email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <div
                  className="absolute top-2.5 right-3 cursor-pointer text-muted-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>

            {apiMessage && (
              <p
                className={`text-sm text-center ${
                  apiMessage.type === "error" ? "text-red-500" : "text-green-600"
                }`}
              >
                {apiMessage.text}
              </p>
            )}
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Chưa có tài khoản?{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Đăng ký
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
