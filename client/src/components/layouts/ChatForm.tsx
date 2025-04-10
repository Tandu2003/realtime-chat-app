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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat header */}
      {receiverInfo && (
        <div className="flex items-center gap-3 px-6 py-4 border-b bg-white shadow-sm">
          <Avatar className="w-12 h-12">
            <AvatarImage
              src={receiverInfo.profilePicture || "/default-avatar.png"}
              alt={receiverInfo.name}
            />
            <AvatarFallback>{receiverInfo.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-base text-gray-900">{receiverInfo.name}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              {isOnline ? (
                <>
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  Đang hoạt động
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                  Không hoạt động
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Chat body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p>Chưa có tin nhắn nào</p>
            <p className="text-sm">Hãy bắt đầu cuộc trò chuyện</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender._id === me._id;
            const showAvatar =
              !isMe && (index === 0 || messages[index - 1].sender._id !== msg.sender._id);
            const isLast =
              index === messages.length - 1 || messages[index + 1].sender._id !== msg.sender._id;
            const avatar = msg.sender.profilePicture || "/default-avatar.png";

            return (
              <div
                key={msg._id}
                className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && (
                  <div className="w-8 flex-shrink-0">
                    {showAvatar && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={avatar} alt="avatar" />
                        <AvatarFallback>{msg.sender.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}
                <div className="flex flex-col max-w-[75%]">
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm shadow-sm break-words ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-sm ml-auto"
                        : "bg-white text-gray-900 rounded-bl-sm mr-auto border border-gray-200"
                    } ${isMe && isLast ? "rounded-tr-2xl" : ""}`}
                  >
                    {msg.text}
                  </div>
                  {isLast && (
                    <span
                      className={`text-xs text-gray-400 mt-1 ${isMe ? "text-right" : "text-left"}`}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <div className="border-t px-4 py-3 bg-white flex gap-2 items-end">
        <Textarea
          className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-12"
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          size="icon"
          onClick={handleSendMessage}
          className="bg-blue-500 hover:bg-blue-600 rounded-full h-10 w-10 flex items-center justify-center"
          disabled={!text.trim()}
        >
          <SendHorizonal size={20} />
        </Button>
      </div>
    </div>
  );
}
