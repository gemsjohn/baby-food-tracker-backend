const { Schema, model } = require('mongoose');
const Entry = require('./Entry').schema;

const TrackerSchema = new Schema(
  {
    date: {
      type: String,
    },
    entry: [Entry]
  },
  
  // set this to use virtual below
  {
    toJSON: {
      virtuals: true,
    },
  }
);

const Tracker = model('Tracker', TrackerSchema);

module.exports = Tracker;
