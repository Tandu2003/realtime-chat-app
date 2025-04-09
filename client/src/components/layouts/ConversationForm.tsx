"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RootState } from "@/redux/store";
import ConversationService from "@/services/conversation";

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface Conversation {
  _id: string;
  isGroup: boolean;
  participants: User[];
  latestMessage?: {
    text: string;
    createdAt: string;
  };
}

interface ConversationFormProps {
  onSelectConversation?: (id: string) => void;
  onConversationsLoaded?: (conversations: Conversation[]) => void;
}

export default function ConversationForm({
  onSelectConversation,
  onConversationsLoaded,
}: ConversationFormProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const me = useSelector((state: RootState) => state.user);
  const router = useRouter();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await ConversationService.getConversations();
        setConversations(data);
        if (onConversationsLoaded) {
          onConversationsLoaded(data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách hội thoại:", error);
      }
    };

    fetchConversations();
  }, []);

  const handleOpenChat = (conversationId: string) => {
    if (onSelectConversation) {
      onSelectConversation(conversationId);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Tin nhắn gần đây</h2>

      {conversations.length === 0 && <p className="text-gray-500">Chưa có cuộc trò chuyện nào.</p>}

      <div className="space-y-2">
        {conversations.map((conv) => {
          const userOther = conv.participants.find((u) => u._id !== me._id);
          if (!userOther) return null;

          return (
            <div
              key={conv._id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition"
              onClick={() => handleOpenChat(conv._id)}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={userOther.profilePicture || "/default-avatar.png"}
                  alt={userOther.name}
                />
                <AvatarFallback>{userOther.name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <p className="font-medium">{userOther.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {conv.latestMessage?.text || "Chưa có tin nhắn"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
