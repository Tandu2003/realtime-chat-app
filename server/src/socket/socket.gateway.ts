import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { UserService } from '../user/user.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly userService: UserService) {}

  // Khi người dùng kết nối socket
  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    const isValidId = Types.ObjectId.isValid(userId);
    if (!isValidId) {
      client.disconnect();
      return;
    }

    // Cập nhật trạng thái online + lưu socketId
    await this.userService.setUserOnline(userId, client.id);
    this.server.emit('user-online', userId); // Broadcast cho client khác
  }

  // Khi người dùng disconnect
  async handleDisconnect(client: Socket) {
    const sockets = await this.server.fetchSockets();
    const disconnectedUser = [...sockets].find((s) => s.id === client.id)
      ?.handshake.query.userId as string;

    if (disconnectedUser) {
      await this.userService.setUserOffline(disconnectedUser);
      this.server.emit('user-offline', disconnectedUser);
    }
  }

  // (có thể mở rộng thêm sự kiện sau này ở đây)
}
