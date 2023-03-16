const { Schema, model } = require('mongoose');

const ChatSchema = new Schema(
  {
    npc: { 
        type: String,
    },
    user: {
        type: String
    }

  },
  
  // set this to use virtual below
  {
    toJSON: {
      virtuals: true,
    },
  }
);

const Chat = model('Chat', ChatSchema);

module.exports = Chat;
