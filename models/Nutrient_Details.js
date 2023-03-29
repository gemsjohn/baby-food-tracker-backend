const { Schema, model } = require('mongoose');


const Nutrient_DetailsSchema = new Schema(
  {
    amount: {
      type: String
    },
    unit: {
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

const Nutrient_Details = model('Nutrient_Details', Nutrient_DetailsSchema);

module.exports = Nutrient_Details;
