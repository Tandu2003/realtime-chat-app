import axiosInstance from "@/lib/axios";

const ConversationService = {
  async getConversations() {
    const response = await axiosInstance.get("/conversations");
    return response.data;
  },

  async getConversationById(conversationId: string) {
    const response = await axiosInstance.get(`/conversations/${conversationId}`);
    return response.data;
  },

  async findOrCreateOneOnOneConversation(userOtherId: string) {
    const response = await axiosInstance.post("/conversations/one-on-one", {
      userOtherId,
    });
    return response.data;
  },

  async createGroupChat(userIds: string[], name: string) {
    const response = await axiosInstance.post("/conversations/group", {
      userIds,
      name,
    });
    return response.data;
  },
};

export default ConversationService;
