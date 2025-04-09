import axiosInstance from "@/lib/axios";

const AuthService = {
  async login(email: string, password: string) {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  async register(username: string, name: string, email: string, password: string) {
    const response = await axiosInstance.post("/auth/register", {
      username,
      name,
      email,
      password,
    });
    return response.data;
  },

  async logout() {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  },

  async getMe() {
    const response = await axiosInstance.get("/users/me");
    return response.data;
  },
};

export default AuthService;
