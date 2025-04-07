import { Server, Socket } from 'socket.io';

import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { MessageService } from '../message/message.service';
import { UserService } from '../user/user.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      client.disconnect();
      return;
    }

    await this.userService.setUserOnline(userId, client.id);
    console.log(`🔌 User ${userId} connected`);
  }

  async handleDisconnect(client: Socket) {
    await this.userService.setUserOffline(client.id);
    console.log(`❌ User disconnected: ${client.id}`);
  }

  @SubscribeMessage('send-message')
  async handleMessage(
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

    // Gửi message cho người nhận nếu đang online
    const receiver = await this.userService.findById(receiverId);
    if (receiver?.isOnline && receiver.socketId) {
      client.to(receiver.socketId).emit('new-message', message);
    }

    // Trả lại cho người gửi
    client.emit('message-sent', message);
  }
}
