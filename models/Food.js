const { Schema, model } = require('mongoose');
const Entry = require('./Entry').schema;

const FoodSchema = new Schema(
  {
    item: {
      type: String,
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

const Food = model('Food', FoodSchema);

module.exports = Food;
