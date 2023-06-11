import axios from 'axios';
import { Schema, model, models } from 'mongoose';
//permission   robot, member,admin
const roomSchema = new Schema(
  {
    name: { type: String, require: true, default: '#groupchat' },
  },
  { timestamps: true }
);

const RoomModel = models.Room || model('Room', roomSchema);

export default RoomModel;
