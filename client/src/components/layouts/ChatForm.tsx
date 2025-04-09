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

interface ChatFormProps {
  conversationId: string;
}

export default function ChatForm({ conversationId }: ChatFormProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const me = useSelector((state: RootState) => state.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getReceiverId = async () => {
    const conversation = await ConversationService.getConversationById(conversationId);
    const receiverId = conversation.participants.find((id: string) => id !== me._id);
    return receiverId || "";
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
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!text.trim()) return;

    const socket = getSocket();
    const receiverId = await getReceiverId();

    console.log("📤 Sending message:", {
      conversationId,
      senderId: me._id,
      text: text.trim(),
      receiverId,
    });

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

    socket.on("new-message", handleNewMessage);
    socket.on("message-sent", handleMessageSent);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message-sent", handleMessageSent);
    };
  }, [conversationId, me._id]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen border rounded-lg p-4 bg-white shadow-md">
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.map((msg) => {
          const isMe = msg.sender._id === me._id;
          const avatar = msg.senderAvatar || "/default-avatar.png";

          return (
            <div
              key={msg._id}
              className={`flex items-end ${isMe ? "justify-end" : "justify-start"}`}
            >
              {!isMe && (
                <Image
                  src={avatar}
                  alt="avatar"
                  width={48}
                  height={48}
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${
                  isMe
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-black rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex gap-2 items-center">
        <Textarea
          className="flex-1 resize-none min-h-[40px] max-h-[120px]"
          rows={1}
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button size="icon" onClick={handleSendMessage}>
          <SendHorizonal size={18} />
        </Button>
      </div>
    </div>
  );
}
