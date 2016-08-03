var mongoose = require('mongoose');

var User = mongoose.model('User', {
  resume: { type: Buffer},
  authenticationTokens: [{ token: String, expiration: Date }],
  email: { type: String, unique: true },
  password: String,
  firstname: String,
  lastname: String,
  phone: String,
  birthday: Date,
  address: String,
  city: String,
  cohort: String,
  relocating: String
});

module.exports = User;
