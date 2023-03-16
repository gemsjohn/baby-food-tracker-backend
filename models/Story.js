const { Schema, model } = require('mongoose');
const Chat = require('./Chat').schema;

const StorySchema = new Schema(
  {
    userid: {
      type: String,
    },
    chat: [Chat]
  },
  
  // set this to use virtual below
  {
    toJSON: {
      virtuals: true,
    },
  }
);

const Story = model('Story', StorySchema);

module.exports = Story;
