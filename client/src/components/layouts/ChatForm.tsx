import { SendHorizonal } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

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
  const me = useSelector((state: RootState) => state.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getReceiverInfo = async () => {
    const conversation = await ConversationService.getConversationById(conversationId);
    const receiverId = conversation.participants.find((id: string) => id !== me._id);
    if (!receiverId) return null;

    const user = await UserService.getUserById(receiverId);
    setReceiverInfo(user);
    return receiverId;
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await MessageService.getMessages(conversationId);
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {receiverInfo && (
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-white shadow-sm">
          <Image
            src={receiverInfo.profilePicture || "/default-avatar.png"}
            alt={receiverInfo.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium text-base text-gray-900">{receiverInfo.name}</p>
            <p className="text-sm text-gray-500">
              {isOnline ? "Đang hoạt động" : "Không hoạt động"}
            </p>
          </div>
        </div>
      )}

      {/* Chat body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender._id === me._id;
          const avatar = msg.senderAvatar || "/default-avatar.png";

          return (
            <div
              key={msg._id}
              className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
            >
              {!isMe && (
                <Image
                  src={avatar}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm break-words ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-sm ml-auto"
                    : "bg-white text-gray-900 rounded-bl-sm mr-auto border border-gray-300"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <div className="border-t px-4 py-3 bg-white flex gap-2 items-end">
        <Textarea
          className="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={1}
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button size="icon" onClick={handleSendMessage} className="bg-blue-500 hover:bg-blue-600">
          <SendHorizonal size={20} />
        </Button>
      </div>
    </div>
  );
}
