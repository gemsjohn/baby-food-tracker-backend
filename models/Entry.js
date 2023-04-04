const { Schema, model } = require('mongoose');

const Nutrients = require('./Nutrients').schema;

const EntrySchema = new Schema(
  {
    subuserid: {
      type: String
    },
    date: {
      type: String
    },
    schedule: {
      type: String
    },
    time: {
      type: String
    },
    item: {
      type: String
    },
    amount: {
      type: String
    },
    emotion: {
      type: String
    },
    nutrients: Nutrients,
    foodGroup: {
      type: String
    },
    allergy: {
      type: String
    },
    foodInDb: {
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

const Entry = model('Entry', EntrySchema);

module.exports = Entry;
