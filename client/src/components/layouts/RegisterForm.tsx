"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RootState } from "@/redux/store";
import AuthService from "@/services/auth";

export default function RegisterForm() {
  const router = useRouter();

  const [values, setValues] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [apiMessage, setApiMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "username":
        if (!value) return "Username không được để trống";
        if (value.length < 4) return "Ít nhất 4 ký tự";
        break;
      case "name":
        if (!value) return "Tên không được để trống";
        break;
      case "email":
        if (!value) return "Email không được để trống";
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!isValid) return "Email không hợp lệ";
        break;
      case "password":
        if (!value) return "Mật khẩu không được để trống";
        if (value.length < 6) return "Ít nhất 6 ký tự";
        break;
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
    const newErrors = {
      username: validateField("username", values.username),
      name: validateField("name", values.name),
      email: validateField("email", values.email),
      password: validateField("password", values.password),
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => err !== "");
    if (!hasErrors) {
      setLoading(true);
      setApiMessage(null);

      try {
        const response = await AuthService.register(
          values.username,
          values.name,
          values.email,
          values.password
        );

        setApiMessage({
          type: "success",
          text: response.message + ". Đang chuyển hướng sang đang nhập",
        });
        setTimeout(() => {
          router.push("/login");
        }, 2000);
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
    <div className="w-full max-w-md">
      <Card className="overflow-hidden border-none shadow-lg">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800">Đăng ký</h1>
            <p className="mt-2 text-sm text-gray-600">Tạo tài khoản mới để sử dụng ứng dụng</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <Input
                name="username"
                type="text"
                placeholder="Nhập username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${
                  errors.username ? "border-red-500 ring-red-200" : "focus:ring-primary/20"
                } h-11 rounded-xl shadow-sm transition-all`}
              />
              {errors.username && (
                <p className="text-sm font-medium text-red-500">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Họ và tên
              </Label>
              <Input
                name="name"
                type="text"
                placeholder="Nhập họ tên"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${
                  errors.name ? "border-red-500 ring-red-200" : "focus:ring-primary/20"
                } h-11 rounded-xl shadow-sm transition-all`}
              />
              {errors.name && <p className="text-sm font-medium text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                name="email"
                type="email"
                placeholder="Nhập email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${
                  errors.email ? "border-red-500 ring-red-200" : "focus:ring-primary/20"
                } h-11 rounded-xl shadow-sm transition-all`}
              />
              {errors.email && <p className="text-sm font-medium text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${
                    errors.password ? "border-red-500 ring-red-200" : "focus:ring-primary/20"
                  } h-11 pr-10 rounded-xl shadow-sm transition-all`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm font-medium text-red-500">{errors.password}</p>
              )}
            </div>

            <Button
              className="w-full h-11 rounded-xl font-semibold text-base transition-all hover:shadow-md"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  Đang xử lý...
                </span>
              ) : (
                "Đăng ký"
              )}
            </Button>

            {apiMessage && (
              <div
                className={`rounded-lg border p-3 text-center text-sm font-medium ${
                  apiMessage.type === "error"
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-green-200 bg-green-50 text-green-600"
                }`}
              >
                {apiMessage.text}
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <a
                href="/login"
                className="font-medium text-blue-600 transition-colors hover:text-blue-800 hover:underline"
              >
                Đăng nhập
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
