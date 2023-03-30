const { Schema, model } = require('mongoose');

const NutrientsSchema = new Schema(
  {
    // calories: String,
    // protein: String,
    // fat: String,
    // carbohydrates: String,
    // fiber: String,
    // sugar: String,
    // iron: String,
    // zinc: String,
    // omega3: String,
    // vitaminD: String
    calories: {
      amount: Number,
      unit: String
    },
    protein: {
      amount: Number,
      unit: String
    },
    fat: {
      amount: Number,
      unit: String
    },
    carbohydrates: {
      amount: Number,
      unit: String
    },
    fiber: {
      amount: Number,
      unit: String
    },
    sugar: {
      amount: Number,
      unit: String
    },
    iron: {
      amount: Number,
      unit: String
    },
    zinc: {
      amount: Number,
      unit: String
    },
    omega3: {
      amount: Number,
      unit: String
    },
    vitaminD: {
      amount: Number,
      unit: String
    }
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
