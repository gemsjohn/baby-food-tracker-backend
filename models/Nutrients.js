const { Schema, model } = require('mongoose');

const NutrientsSchema = new Schema(
  {
    calories: String,
    protein: String,
    fat: String,
    carbohydrates: String,
    fiber: String,
    sugar: String,
    iron: String,
    zinc: String,
    omega3: String,
    vitaminD: String
  },
  
  // set this to use virtual below
  {
    toJSON: {
      virtuals: true,
    },
  }
);

const Nutrients = model('Nutrients', NutrientsSchema);

module.exports = Nutrients;
