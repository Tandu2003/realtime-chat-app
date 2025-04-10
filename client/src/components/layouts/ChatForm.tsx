"use client";

import { SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { connectSocket, getSocket } from "@/lib/socket";
import { RootState } from "@/redux/store";
import ConversationService from "@/services/conversation";
import MessageService from "@/services/message";
import UserService from "@/services/user";

interface ChatFormProps {
  conversationId: string;
}

export default function ChatForm({ conversationId }: ChatFormProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [receiverInfo, setReceiverInfo] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const me = useSelector((state: RootState) => state.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getReceiverInfo = async () => {
    try {
      const conversation = await ConversationService.getConversationById(conversationId);
      const receiverId = conversation.participants.find((id: string) => id !== me._id);
      if (!receiverId) return null;

      const user = await UserService.getUserById(receiverId);
      setReceiverInfo(user);
      return receiverId;
    } catch (error) {
      console.error("Failed to fetch receiver info", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const data = await MessageService.getMessages(conversationId);
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
    getReceiverInfo();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!text.trim()) return;

    const socket = getSocket();
    const receiverId = await getReceiverInfo();

    socket.emit("send-message", {
      conversationId,
      senderId: me._id,
      text: text.trim(),
      receiverId,
    });

    setText("");
  };

  useEffect(() => {
    const socket = connectSocket(me._id);

    const handleNewMessage = (message: any) => {
      if (message.conversation === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleMessageSent = (message: any) => {
      if (message.conversation === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleOnlineUsers = (users: any[]) => {
      setOnlineUsers(users);
    };

    socket.emit("get-online-users");
    socket.on("online-users", handleOnlineUsers);
    socket.on("new-message", handleNewMessage);
    socket.on("message-sent", handleMessageSent);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message-sent", handleMessageSent);
      socket.off("online-users", handleOnlineUsers);
    };
  }, [conversationId, me._id]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isOnline = onlineUsers.some((u) => u._id === receiverInfo?._id);

  const formatMessageTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="relative flex h-full flex-col bg-gray-50">
      {/* Chat header */}
      {receiverInfo && (
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white px-6 py-3.5 shadow-sm">
          <Avatar className="h-10 w-10 ring-2 ring-primary/10">
            <AvatarImage
              src={receiverInfo.profilePicture || "/default-avatar.png"}
              alt={receiverInfo.name}
            />
            <AvatarFallback>{receiverInfo.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-800">{receiverInfo.name}</p>
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              {isOnline ? (
                <>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  <span>Đang hoạt động</span>
                </>
              ) : (
                <>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                  <span>Không hoạt động</span>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Chat body */}
      <div className="flex-1 space-y-5 overflow-y-auto p-4 md:p-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-10 text-gray-400">
            <div className="mb-4 rounded-full bg-white p-5 shadow-sm">
              <SendHorizonal size={24} className="text-gray-300" />
            </div>
            <p className="font-medium text-gray-600">Chưa có tin nhắn nào</p>
            <p className="mt-1 text-sm text-gray-500">Hãy bắt đầu cuộc trò chuyện</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender._id === me._id;
            const showAvatar =
              !isMe && (index === 0 || messages[index - 1].sender._id !== msg.sender._id);
            const isLast =
              index === messages.length - 1 || messages[index + 1].sender._id !== msg.sender._id;
            const avatar = msg.sender.profilePicture || "/default-avatar.png";
            const isFirstInGroup = index === 0 || messages[index - 1].sender._id !== msg.sender._id;
            const timeGap =
              index > 0 &&
              new Date(msg.createdAt).getTime() -
                new Date(messages[index - 1].createdAt).getTime() >
                300000; // 5 minutes

            return (
              <div key={msg._id} className={timeGap ? "mt-6" : ""}>
                {timeGap && (
                  <div className="mb-4 flex justify-center">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                      {new Date(msg.createdAt).toLocaleString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
                <div
                  className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"} ${
                    isFirstInGroup ? "mt-4" : "mt-1"
                  }`}
                >
                  {!isMe && (
                    <div className="w-8 flex-shrink-0">
                      {showAvatar && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={avatar} alt="avatar" />
                          <AvatarFallback>{msg.sender.name[0]}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}
                  <div className={`"max-w-[75%] flex flex-col ${isLast ? "translate-y-5.5" : ""}`}>
                    <div
                      className={`break-words rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        isMe
                          ? "rounded-br-sm rounded-tr-xl bg-blue-600 text-white"
                          : "rounded-bl-sm rounded-tl-xl border border-gray-100 bg-white text-gray-800"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {isLast && (
                      <span
                        className={`mt-1.5 text-xs text-gray-400 ${
                          isMe ? "mr-1 text-right" : "ml-1 text-left"
                        }`}
                      >
                        {formatMessageTime(msg.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <div className="sticky bottom-0 z-10 flex items-end gap-2 border-t bg-white px-4 py-3">
        <Textarea
          className="min-h-12 max-h-36 flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          size="icon"
          onClick={handleSendMessage}
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 shadow-sm transition-all hover:bg-blue-600 ${
            !text.trim() ? "cursor-not-allowed opacity-50" : "hover:shadow-md"
          }`}
          disabled={!text.trim()}
        >
          <SendHorizonal size={18} className="text-white" />
        </Button>
      </div>
    </div>
  );
}
