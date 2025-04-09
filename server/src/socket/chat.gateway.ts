import { Server, Socket } from 'socket.io';
import { ConversationService } from 'src/conversation/conversation.service';

import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { MessageService } from '../message/message.service';
import { UserService } from '../user/user.service';

@WebSocketGateway({
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:1234'],
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private server: Server;

  constructor(
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
  ) {}

  afterInit(server: Server) {
    this.server = server;
  }

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.disconnect();
      return;
    }

    await this.userService.setUserOnline(userId, client.id);
    console.log(`✅ User ${userId} connected`);

    this.broadcastOnlineUsers(); // 👈 NEW
  }

  async handleDisconnect(client: Socket) {
    await this.userService.setUserOffline(client.id);
    console.log(`❌ Socket disconnected: ${client.id}`);

    this.broadcastOnlineUsers(); // 👈 NEW
  }

  private async broadcastOnlineUsers() {
    const onlineUsers = await this.userService.getOnlineUsers(); // 👈 viết hàm này trong userService
    this.server.emit(
      'online-users',
      onlineUsers.map((user) => ({
        _id: user._id,
        name: user.name, // hoặc avatar, email... tùy frontend
      })),
    );
  }

  @SubscribeMessage('get-online-users')
  async handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    const onlineUsers = await this.userService.getOnlineUsers();
    client.emit(
      'online-users',
      onlineUsers.map((user) => ({
        _id: user._id,
        name: user.name,
      })),
    );
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody()
    data: {
      conversationId: string;
      senderId: string;
      text: string;
      receiverId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { conversationId, senderId, text, receiverId } = data;

    const message = await this.messageService.sendMessage(
      conversationId,
      senderId,
      text,
    );

    await this.conversationService.updateLastMessageObject(conversationId, {
      sender: senderId,
      text,
      createdAt: new Date(),
    });

    // Emit cho UI cập nhật danh sách hội thoại realtime
    this.server.emit('conversation-updated', {
      conversationId,
      lastMessage: {
        sender: senderId,
        text,
        createdAt: new Date(),
      },
    });

    // Gửi cho người gửi
    client.emit('message-sent', message);

    // Gửi cho người nhận
    const receiver = await this.userService.findById(receiverId);
    if (receiver?.isOnline && receiver.socketId) {
      this.server.to(receiver.socketId).emit('new-message', message);
    }

    console.log('📤 Sending message to socket:', receiver?.socketId);
  }
}
