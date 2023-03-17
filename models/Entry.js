const { Schema, model } = require('mongoose');

const EntrySchema = new Schema(
  {
    date: {
      type: String
    },
    schedule: {
      type: String
    },
    item: {
      type: String
    },
    amount: {
      type: String
    },
    nutrients: {
      type: String
    },

  },
  
  // set this to use virtual below
  {
    toJSON: {
      virtuals: true,
    },
  }
);

const Entry = model('Entry', EntrySchema);

module.exports = Entry;
