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
      <main className="flex h-screen flex-col bg-gray-100 md:flex-row">
        {/* Header for mobile */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3.5 shadow-sm md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>

          <h1 className="text-lg font-semibold text-primary">Chat App</h1>

          <Avatar className="h-8 w-8 ring-2 ring-primary/10">
            <AvatarImage src={me.profilePicture || "/default-avatar.png"} alt={me.name} />
            <AvatarFallback>{me.name?.[0]}</AvatarFallback>
          </Avatar>
        </div>

        {/* Left side: Conversation List */}
        <div
          className={`${
            isMobileMenuOpen ? "block" : "hidden"
          } flex h-[calc(100vh-56px)] w-full flex-col overflow-hidden border-r bg-white transition-all md:block md:h-screen md:max-w-xs md:w-[320px] lg:w-[360px]`}
        >
          {/* User profile section */}
          <div className="hidden border-b p-4 md:flex md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                <AvatarImage src={me.profilePicture || "/default-avatar.png"} alt={me.name} />
                <AvatarFallback>{me.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-800">{me.name}</p>
                <p className="text-xs text-gray-500">@{me.username}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100"
              >
                <Settings size={16} className="text-gray-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100"
                onClick={handleLogout}
              >
                <LogOut size={16} className="text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto p-3">
            <ConversationForm
              onSelectConversation={(id) => {
                setSelectedConversationId(id);
                setIsMobileMenuOpen(false);
              }}
              onConversationsLoaded={handleConversationsLoaded}
            />
          </div>

          {/* Mobile logout button */}
          <div className="border-t p-3 md:hidden">
            <Button
              variant="outline"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Đăng xuất
            </Button>
          </div>
        </div>

        {/* Right side: Chat Area */}
        <div
          className={`flex-1 h-[calc(100vh-56px)] md:h-screen ${
            isMobileMenuOpen ? "hidden" : "block"
          } md:block`}
        >
          {selectedConversationId ? (
            <ChatForm conversationId={selectedConversationId} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-gray-400">
              <div className="mb-6 rounded-full bg-gray-100 p-8 shadow-inner">
                <MessageSquare size={48} className="text-blue-500" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-700">Tin nhắn của bạn</h3>
              <p className="max-w-sm text-center text-gray-500">
                Chọn một cuộc trò chuyện từ danh sách hoặc tìm kiếm người dùng để bắt đầu chat
              </p>
            </div>
          )}
        </div>
      </main>
    </RequireAuth>
  );
}
