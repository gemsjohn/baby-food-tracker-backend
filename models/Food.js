const { Schema, model } = require('mongoose');

const Nutrients = require('./Nutrients').schema;

const FoodSchema = new Schema(
  {
    item: {
      type: String,
    },
    nutrients: Nutrients,
    foodGroup: {
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

const Food = model('Food', FoodSchema);

module.exports = Food;
