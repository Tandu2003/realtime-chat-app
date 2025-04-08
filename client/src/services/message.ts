import axiosInstance from "@/lib/axios";

const MessageService = {
  async sendMessage(conversationId: string, text: string) {
    const response = await axiosInstance.post(`/messages/${conversationId}/send`, { text });
    return response.data;
  },

	async getMessages(conversationId: string) {
		const response = await axiosInstance.get(`/messages/${conversationId}`);
		return response.data;
	},

	async markAsSeen(messageId: string) {
		const response = await axiosInstance.patch(`/messages/${messageId}/seen`);
		return response.data;
	},
};

export default MessageService;
