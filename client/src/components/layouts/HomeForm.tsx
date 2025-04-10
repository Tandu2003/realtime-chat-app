"use client";

import { LogOut, Menu, MessageSquare, Settings, X } from "lucide-react";
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
        <div className="md:hidden bg-white border-b sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>

          <h1 className="font-semibold text-primary">Chat App</h1>

          <div className="flex items-center">
            <Avatar className="w-8 h-8 ring-2 ring-primary/10">
              <AvatarImage src={me.profilePicture || "/default-avatar.png"} alt={me.name} />
              <AvatarFallback>{me.name?.[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Left side: Conversation List */}
        <div
          className={`${
            isMobileMenuOpen ? "block" : "hidden"
          } md:block w-full md:w-[320px] lg:w-[360px] border-r md:max-w-xs bg-white overflow-hidden flex flex-col h-[calc(100vh-56px)] md:h-screen transition-all`}
        >
          {/* User profile section */}
          <div className="hidden md:flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-2 ring-primary/10">
                <AvatarImage src={me.profilePicture || "/default-avatar.png"} alt={me.name} />
                <AvatarFallback>{me.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-800">{me.name}</p>
                <p className="text-xs text-gray-500">@{me.username}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-8 w-8 hover:bg-gray-100"
              >
                <Settings size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 hover:bg-gray-100"
                onClick={handleLogout}
              >
                <LogOut size={16} />
              </Button>
            </div>
          </div>

          {/* Conversations */}
          <div className="p-3 flex-1 overflow-y-auto">
            <ConversationForm
              onSelectConversation={(id) => {
                setSelectedConversationId(id);
                setIsMobileMenuOpen(false);
              }}
              onConversationsLoaded={handleConversationsLoaded}
            />
          </div>

          {/* Mobile logout button */}
          <div className="md:hidden p-3 border-t">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Đăng xuất
            </Button>
          </div>
        </div>

        {/* Right side: Chat Area */}
        <div className={`flex-1 ${isMobileMenuOpen ? "hidden" : "block"} md:block h-[calc(100vh-56px)] md:h-screen`}>
          {selectedConversationId ? (
            <ChatForm conversationId={selectedConversationId} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6">
              <div className="bg-gray-100 rounded-full p-8 mb-6 shadow-inner">
                <MessageSquare size={48} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-700">Tin nhắn của bạn</h3>
              <p className="text-center max-w-sm text-gray-500">
                Chọn một cuộc trò chuyện từ danh sách hoặc tìm kiếm người dùng để bắt đầu chat
              </p>
            </div>
          )}
        </div>
      </main>
    </RequireAuth>
  );
}
