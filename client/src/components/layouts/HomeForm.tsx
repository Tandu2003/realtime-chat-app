"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import ChatForm from "@/components/layouts/ChatForm";
import ConversationForm from "@/components/layouts/ConversationForm";
import RequireAuth from "@/components/layouts/RequireAuth";
import { RootState } from "@/redux/store";

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
  const me = useSelector((state: RootState) => state.user);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Khi ConversationForm load xong, nó sẽ truyền danh sách hội thoại về đây
  const handleConversationsLoaded = (conversations: Conversation[]) => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0]._id);
    }
  };

  return (
    <RequireAuth>
      <main className="flex h-screen">
        {/* Left side: Conversation List */}
        <div className="w-1/3 border-r overflow-y-auto p-4 bg-gray-50">
          <ConversationForm
            onSelectConversation={setSelectedConversationId}
            onConversationsLoaded={handleConversationsLoaded}
          />
        </div>

        {/* Right side: Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {selectedConversationId ? (
            <ChatForm conversationId={selectedConversationId} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Chọn một hội thoại để bắt đầu chat
            </div>
          )}
        </div>
      </main>
    </RequireAuth>
  );
}
