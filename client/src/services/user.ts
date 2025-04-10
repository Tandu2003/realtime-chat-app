import axiosInstance from "@/lib/axios";

const UserService = {
  async followUser(targetId: string) {
    const response = await axiosInstance.post(`/users/follow/${targetId}`);
    return response.data;
  },

  async searchUsers(query: string) {
    const response = await axiosInstance.get(`/users/search`, { params: { q: query } });
    return response.data;
  },

  async getMe() {
    const response = await axiosInstance.get(`/users/me`);
    return response.data;
  },

  async getUserById(userId: string) {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  },

  // New methods for profile functionality
  async getUserByUsername(username: string) {
    const response = await axiosInstance.get(`/users/username/${username}`);
    return response.data;
  },

  async updateProfile(profileData: { name: string; bio?: string; profilePicture?: string }) {
    const response = await axiosInstance.put(`/users/profile`, profileData);
    return response.data;
  },
};

export default UserService;
