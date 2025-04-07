import { Server, Socket } from 'socket.io';

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';

import { UserService } from '../user/user.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly userService: UserService) {}

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
}
