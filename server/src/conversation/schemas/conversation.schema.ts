import { Document, Types } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  participants: Types.ObjectId[]; // dùng chung cho cả group & 1-1

  @Prop({ type: Boolean, default: false })
  isGroup: boolean;

  @Prop({ type: String, default: '' })
  name: string; // Chỉ dùng nếu là group chat

  @Prop({ type: String, enum: ['one-on-one', 'group'], required: true })
  type: 'one-on-one' | 'group';

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage: Types.ObjectId;
}

export type ConversationDocument = Conversation & Document;
export const ConversationSchema = SchemaFactory.createForClass(Conversation);
