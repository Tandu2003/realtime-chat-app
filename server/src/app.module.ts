import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { ChatGateway } from './socket/chat.gateway';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app',
    ),
    UserModule,
    ConversationModule,
    MessageModule,
    AuthModule,
  ],
  providers: [ChatGateway],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude('auth/(.*)') // Không check token cho login/register
      .forRoutes('*'); // Áp dụng cho tất cả route
  }
}
