const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const Tracker = require('./Tracker').schema;
const SubUser = require('./SubUser').schema;
const Premium = require('./Premium').schema;



const UserSchema = new Schema(
  {
    role: {
      type: [String],
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: String,
    },
    currentVersion: {
      type: String,
      default: '1.2.0'
    },
    premium: Premium,
    subuser: [SubUser]
  },
  
  // set this to use virtual below
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// hash user password
UserSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// custom method to compare and validate password for logging in
UserSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = model('User', UserSchema);

module.exports = User;
