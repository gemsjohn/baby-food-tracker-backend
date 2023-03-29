const { Schema, model } = require('mongoose');
const Tracker = require('./Tracker').schema;

const SubUserSchema = new Schema(
  {
    subusername: {
      type: String,
      required: true
    },
    tracker: [Tracker],
    allergy: {
      type: [String]
    },
  },
  
  // set this to use virtual below
  {
    toJSON: {
      virtuals: true,
    },
  }
);


const SubUser = model('SubUser', SubUserSchema);

module.exports = SubUser;
