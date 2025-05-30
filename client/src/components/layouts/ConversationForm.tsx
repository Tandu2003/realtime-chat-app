"use client";

import { Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { connectSocket, getSocket } from "@/lib/socket";
import { RootState } from "@/redux/store";
import ConversationService from "@/services/conversation";
import UserService from "@/services/user";

interface User {
  _id: string;
  username?: string;
  name: string;
  email: string;
  profilePicture?: string;
  isOnline?: boolean;
  lastSeen?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Conversation {
  _id: string;
  isGroup: boolean;
  participants: User[];
  lastMessage?: {
    sender: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  const me = useSelector((state: RootState) => state.user);
  const onlineUsers = useSelector((state: RootState) => state.socket.onlineUsers);

  const router = useRouter();

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const data = await ConversationService.getConversations();
        setConversations(data);
        if (onConversationsLoaded) {
          onConversationsLoaded(data);
        }
        if (data.length > 0 && !activeConversation) {
          setActiveConversation(data[0]._id);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách hội thoại:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const handleOpenChat = (conversationId: string) => {
    setActiveConversation(conversationId);
    if (onSelectConversation) {
      onSelectConversation(conversationId);
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 2) {
      try {
        const results = await UserService.searchUsers(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching users:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const startNewConversation = async (userId: string) => {
    try {
      const conversation = await ConversationService.findOrCreateOneOnOneConversation(userId);
      // Add this conversation to our list if it's not already there
      const exists = conversations.some((conv) => conv._id === conversation._id);
      if (!exists) {
        setConversations([conversation, ...conversations]);
      }
      handleOpenChat(conversation._id);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error starting new conversation:", error);
    }
  };

  useEffect(() => {
    const socket = connectSocket(me._id);

    const handleConversationUpdate = (payload: {
      conversationId: string;
      lastMessage: { sender: string; text: string; createdAt: string };
    }) => {
      setConversations((prev) => {
        // Find the updated conversation
        const updatedIndex = prev.findIndex((c) => c._id === payload.conversationId);
        if (updatedIndex === -1) return prev;

        // Create a copy of the conversations array
        const updated = [...prev];

        // Update the conversation with the new message
        const updatedConv = { ...updated[updatedIndex], lastMessage: payload.lastMessage };

        // Remove it from current position
        updated.splice(updatedIndex, 1);

        // Add it to the beginning (most recent)
        return [updatedConv, ...updated];
      });
    };

    socket.on("conversation-updated", handleConversationUpdate);

    return () => {
      socket.off("conversation-updated", handleConversationUpdate);
    };
  }, [me._id]);

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Hôm qua";
    } else if (diffDays < 7) {
      const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString();
    }
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.some((user) => user._id === userId);
  };

  return (
    <div className="flex h-full flex-col space-y-5">
      <div className="relative">
        <Input
          type="text"
          placeholder="Tìm người dùng..."
          value={searchQuery}
          onChange={handleSearch}
          className="h-10 rounded-xl border-gray-200 bg-gray-50 pl-9 pr-3 shadow-sm focus:border-blue-400 focus:ring-blue-100"
        />
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {searchResults.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-3">
            <h3 className="text-sm font-medium text-gray-700">Kết quả tìm kiếm</h3>
          </div>

          {isLoading ? (
            <div className="p-4 text-center">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"></div>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto py-2">
              {searchResults.map((user) => (
                <div key={user._id} className="px-3 py-2 hover:bg-gray-50">
                  <div
                    className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors"
                    onClick={() => startNewConversation(user._id)}
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-gray-50">
                      <AvatarImage
                        src={user.profilePicture || "/default-avatar.png"}
                        alt={user.name}
                      />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        @{user.username || user.email.split("@")[0]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <h2 className="pt-1 text-base font-semibold text-gray-800">Tin nhắn gần đây</h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"></div>
        </div>
      ) : (
        <>
          {conversations.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <Users size={24} className="text-gray-400" />
              </div>
              <h3 className="mb-1 text-base font-medium text-gray-700">Chưa có cuộc trò chuyện</h3>
              <p className="text-sm text-gray-500">Tìm kiếm người dùng để bắt đầu trò chuyện</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => {
                const userOther =
                  conv.participants.find((user) => user._id !== me._id) ||
                  ({
                    _id: "",
                    name: "Unknown",
                  } as User);
                const online = isUserOnline(userOther._id);

                return (
                  <div
                    key={conv._id}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                      activeConversation === conv._id ? "bg-blue-50 shadow-sm" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleOpenChat(conv._id)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={userOther.profilePicture || "/default-avatar.png"}
                          alt={userOther.name}
                        />
                        <AvatarFallback>{userOther.name[0]}</AvatarFallback>
                      </Avatar>
                      {online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 shadow-sm"></span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="flex items-center justify-between">
                        <p className="truncate font-medium text-gray-800">{userOther.name}</p>
                        {conv.lastMessage?.createdAt && (
                          <span className="flex-shrink-0 text-xs text-gray-500">
                            {formatLastMessageTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-gray-600">
                        {conv.lastMessage ? (
                          <>
                            {me._id === conv.lastMessage.sender ? (
                              <span className="font-medium text-gray-500">Bạn: </span>
                            ) : (
                              ""
                            )}
                            {conv.lastMessage.text}
                          </>
                        ) : (
                          <span className="italic text-gray-400">Chưa có tin nhắn</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
