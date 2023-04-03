const { Schema, model } = require('mongoose');

const PremiumSchema = new Schema(
  {
    status: {
      type: Boolean
    },
    expiration: {
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


const Premium = model('Premium', PremiumSchema);

module.exports = Premium;
