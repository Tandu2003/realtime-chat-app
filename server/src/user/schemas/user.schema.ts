import { Document, Types } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: '' })
  profilePicture: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isOnline: boolean;

  @Prop()
  lastSeen: Date;

  @Prop()
  socketId: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  followers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  following: Types.ObjectId[];
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
