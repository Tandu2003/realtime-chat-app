"use client";

import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import ChatForm from "@/components/layouts/ChatForm";
import ConversationForm from "@/components/layouts/ConversationForm";
import RequireAuth from "@/components/layouts/RequireAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logout } from "@/redux/slices/userSlice";
import { RootState } from "@/redux/store";
import AuthService from "@/services/auth";

interface Conversation {
  _id: string;
  participants: {
    _id: string;
    name: string;
    profilePicture?: string;
  }[];
}

export default function HomeForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const me = useSelector((state: RootState) => state.user);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      dispatch(logout());
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Khi ConversationForm load xong, nó sẽ truyền danh sách hội thoại về đây
  const handleConversationsLoaded = (conversations: Conversation[]) => {
    // Remove the auto-selection of first conversation
    // Now no conversation will be selected by default
  };

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <RequireAuth>
      <main className="flex flex-col md:flex-row h-screen bg-gray-100">
        {/* Header for mobile */}
        <div className="md:hidden bg-white border-b p-3 flex justify-between items-center">
          <Button
            variant="ghost"
            className="p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="space-y-1">
              <div className="w-5 h-0.5 bg-gray-600"></div>
              <div className="w-5 h-0.5 bg-gray-600"></div>
              <div className="w-5 h-0.5 bg-gray-600"></div>
            </div>
          </Button>

          <h1 className="font-semibold">Chat App</h1>

          <div className="flex items-center gap-2">
            <Avatar className="w-9 h-9">
              <AvatarImage src={me.profilePicture || "/default-avatar.png"} alt={me.name} />
              <AvatarFallback>{me.name?.[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Left side: Conversation List */}
        <div
          className={`${
            isMobileMenuOpen ? "block" : "hidden"
          } md:block w-full md:w-1/3 lg:w-1/4 border-r md:max-w-xs bg-white overflow-hidden flex flex-col`}
        >
          {/* User profile section */}
          <div className="hidden md:flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={me.profilePicture || "/default-avatar.png"} alt={me.name} />
                <AvatarFallback>{me.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{me.name}</p>
                <p className="text-xs text-gray-500">@{me.username}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <Settings size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9"
                onClick={handleLogout}
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>

          {/* Conversations */}
          <div className="p-4 flex-1 overflow-y-auto">
            <ConversationForm
              onSelectConversation={(id) => {
                setSelectedConversationId(id);
                setIsMobileMenuOpen(false);
              }}
              onConversationsLoaded={handleConversationsLoaded}
            />
          </div>

          {/* Mobile logout button */}
          <div className="md:hidden p-4 border-t">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Đăng xuất
            </Button>
          </div>
        </div>

        {/* Right side: Chat Area */}
        <div className={`flex-1 ${isMobileMenuOpen ? "hidden" : "block"} md:block`}>
          {selectedConversationId ? (
            <ChatForm conversationId={selectedConversationId} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4">
              <div className="bg-gray-100 rounded-full p-8 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Tin nhắn của bạn</h3>
              <p className="text-center max-w-md">
                Chọn một cuộc trò chuyện từ danh sách bên trái hoặc tìm kiếm người dùng để bắt đầu
                chat
              </p>
            </div>
          )}
        </div>
      </main>
    </RequireAuth>
  );
}
