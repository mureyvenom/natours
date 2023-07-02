import { Schema, model } from 'mongoose';

const required = true;

export const usersSchema = new Schema({
  name: {
    type: String,
    required,
  },
});

export default model('Users', usersSchema);
